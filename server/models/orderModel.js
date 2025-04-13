import db from '../config/db.js';

// Order model with CRUD operations
const OrderModel = {
  // Create a new order
  async create(orderData) {
    const {
      requesting_businessman_id,
      supplying_businessman_id,
      product_id,
      quantity_requested
    } = orderData;
    
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check if product has enough quantity available and get price
      const productResult = await client.query(
        'SELECT quantity_available, price FROM Product WHERE product_id = $1',
        [product_id]
      );
      
      if (productResult.rows.length === 0) {
        throw new Error('Product not found');
      }
      
      const { quantity_available, price } = productResult.rows[0];
      
      if (quantity_available < quantity_requested) {
        throw new Error('Not enough quantity available');
      }
      
      // Calculate total amount
      const total_amount = price * quantity_requested;
      
      // Create the order
      const orderResult = await client.query(
        `INSERT INTO Orders 
         (ordering_businessman_id, supplying_businessman_id, product_id, status, delivery_status, total_amount) 
         VALUES ($1, $2, $3, 'Requested', 'Pending', $4) 
         RETURNING *`,
        [requesting_businessman_id, supplying_businessman_id, product_id, total_amount]
      );
      
      // Create order product entry
      await client.query(
        `INSERT INTO OrderProducts (order_id, product_id, quantity_requested, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderResult.rows[0].order_id, product_id, quantity_requested, price, total_amount]
      );
      
      // Update product quantity
      await client.query(
        'UPDATE Product SET quantity_available = quantity_available - $1 WHERE product_id = $2',
        [quantity_requested, product_id]
      );
      
      await client.query('COMMIT');
      return orderResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Find order by ID
  async findById(id) {
    const result = await db.query(
      `SELECT o.*,
        bp_ord.business_name as ordering_business_name,
        bp_sup.business_name as supplying_business_name,
        p.product_name, p.price,
        op.quantity_requested,
        da.name as agent_name, da.contact_number as agent_contact
      FROM Orders o
      JOIN BusinessProfile bp_ord ON o.ordering_businessman_id = bp_ord.businessman_id
      JOIN BusinessProfile bp_sup ON o.supplying_businessman_id = bp_sup.businessman_id
      JOIN OrderProducts op ON o.order_id = op.order_id
      JOIN Product p ON op.product_id = p.product_id
      LEFT JOIN DeliveryProfile da ON o.agent_id = da.agent_id
      WHERE o.order_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Update order status
  async updateStatus(id, status, delivery_status = null) {
    const result = await db.query(
      `UPDATE Orders 
       SET status = $1, 
           delivery_status = COALESCE($2, delivery_status),
           updated_at = CURRENT_TIMESTAMP 
       WHERE order_id = $3 
       RETURNING *`,
      [status, delivery_status, id]
    );
    return result.rows[0];
  },

  // Get orders by businessman ID (either ordering or supplying)
  async getByBusinessmanId(businessmanId, role = 'both') {
    let query = `
      SELECT o.*,
        bp_ord.business_name as ordering_business_name,
        bp_sup.business_name as supplying_business_name,
        p.product_name, p.price,
        op.quantity_requested,
        da.name as agent_name, da.contact_number as agent_contact
      FROM Orders o
      JOIN BusinessProfile bp_ord ON o.ordering_businessman_id = bp_ord.businessman_id
      JOIN BusinessProfile bp_sup ON o.supplying_businessman_id = bp_sup.businessman_id
      JOIN OrderProducts op ON o.order_id = op.order_id
      JOIN Product p ON op.product_id = p.product_id
      LEFT JOIN DeliveryProfile da ON o.agent_id = da.agent_id
      WHERE `;
    
    if (role === 'ordering') {
      query += 'o.ordering_businessman_id = $1';
    } else if (role === 'supplying') {
      query += 'o.supplying_businessman_id = $1';
    } else {
      query += 'o.ordering_businessman_id = $1 OR o.supplying_businessman_id = $1';
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const result = await db.query(query, [businessmanId]);
    return result.rows;
  },

  // Get orders assigned to a delivery agent
  async getByAgentId(agentId) {
    const result = await db.query(
      `SELECT o.*,
        bp_ord.business_name as ordering_business_name, bp_ord.area as ordering_area, bp_ord.street as ordering_street,
        bp_ord.phone_no as ordering_phone, bp_ord.city as ordering_city,
        bp_sup.business_name as supplying_business_name, bp_sup.area as supplying_area, bp_sup.street as supplying_street,
        bp_sup.phone_no as supplying_phone, bp_sup.city as supplying_city,
        p.product_name, p.category, op.quantity_requested, op.unit_price, op.subtotal
      FROM Orders o
      JOIN BusinessProfile bp_ord ON o.ordering_businessman_id = bp_ord.businessman_id
      JOIN BusinessProfile bp_sup ON o.supplying_businessman_id = bp_sup.businessman_id
      JOIN OrderProducts op ON o.order_id = op.order_id
      JOIN Product p ON op.product_id = p.product_id
      WHERE o.agent_id = $1
      ORDER BY 
        CASE 
          WHEN o.delivery_status = 'Pending' THEN 1
          WHEN o.delivery_status = 'Assigned' THEN 2
          WHEN o.delivery_status = 'PickedUp' THEN 3
          WHEN o.delivery_status = 'InTransit' THEN 4
          WHEN o.delivery_status = 'Delivered' THEN 5
          ELSE 6
        END,
        o.created_at DESC`,
      [agentId]
    );
    return result.rows;
  },

  // Get delivery agent's order history with filters
  async getDeliveryHistory(agentId, filters = {}) {
    const { status, start_date, end_date } = filters;
    
    // Build the query with optional filters
    let query = `
      SELECT o.*,
        bp_ord.business_name as ordering_business_name, bp_ord.area as ordering_area, bp_ord.street as ordering_street,
        bp_sup.business_name as supplying_business_name, bp_sup.area as supplying_area, bp_sup.street as supplying_street,
        p.product_name, p.price,
        op.quantity_requested
      FROM Orders o
      JOIN BusinessProfile bp_ord ON o.ordering_businessman_id = bp_ord.businessman_id
      JOIN BusinessProfile bp_sup ON o.supplying_businessman_id = bp_sup.businessman_id
      JOIN OrderProducts op ON o.order_id = op.order_id
      JOIN Product p ON op.product_id = p.product_id
      WHERE o.agent_id = $1
    `;
    
    const queryParams = [agentId];
    let paramCount = 2;
    
    // Add status filter if provided
    if (status) {
      query += ` AND o.delivery_status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }
    
    // Add date range filter if provided
    if (start_date) {
      query += ` AND o.created_at >= $${paramCount}`;
      queryParams.push(start_date);
      paramCount++;
    }
    
    if (end_date) {
      query += ` AND o.created_at <= $${paramCount}`;
      queryParams.push(end_date);
      paramCount++;
    }
    
    // Add ordering
    query += ` ORDER BY o.created_at DESC`;
    
    const result = await db.query(query, queryParams);
    return result.rows;
  },

  // Assign delivery agent to order
  async assignAgent(orderId, agentId) {
    const result = await db.query(
      `UPDATE Orders 
       SET agent_id = $1, 
           delivery_status = 'Assigned',
           updated_at = CURRENT_TIMESTAMP 
       WHERE order_id = $2 
       RETURNING *`,
      [agentId, orderId]
    );
    return result.rows[0];
  },

  // Create delivery tracking record
  async createDeliveryTracking(orderId, agentId) {
    const result = await db.query(
      `INSERT INTO Delivery (order_id, agent_id)
       VALUES ($1, $2) 
       RETURNING *`,
      [orderId, agentId]
    );
    return result.rows[0];
  },

  // Update delivery tracking status
  async updateDeliveryStatus(orderId, status, notes = null) {
    let query;
    let params;
    
    switch(status) {
      case 'PickedUp':
        query = `UPDATE Delivery 
                 SET status = $1, pickup_time = CURRENT_TIMESTAMP, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
                 WHERE order_id = $3 RETURNING *`;
        params = [status, notes, orderId];
        break;
      
      case 'Delivered':
        query = `UPDATE Delivery 
                 SET status = $1, delivery_time = CURRENT_TIMESTAMP, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
                 WHERE order_id = $3 RETURNING *`;
        params = [status, notes, orderId];
        break;
        
      default:
        query = `UPDATE Delivery 
                 SET status = $1, notes = COALESCE($2, notes), updated_at = CURRENT_TIMESTAMP
                 WHERE order_id = $3 RETURNING *`;
        params = [status, notes, orderId];
    }
    
    const result = await db.query(query, params);
    
    // Also update the corresponding order
    await this.updateStatus(orderId, null, status);
    
    return result.rows[0];
  },

  // Get delivery tracking information
  async getDeliveryTracking(orderId) {
    const result = await db.query(
      `SELECT d.*, da.name as agent_name, da.contact_number as agent_phone, da.vehicle_type
       FROM Delivery d
       JOIN DeliveryProfile da ON d.agent_id = da.agent_id
       WHERE d.order_id = $1`,
      [orderId]
    );
    return result.rows[0];
  },

  // Get nearby orders for a delivery agent
  async getNearbyOrders(city, limit = 10) {
    const result = await db.query(
      `SELECT o.*, 
        bp_ord.business_name as ordering_business_name, bp_ord.area as ordering_area, 
        bp_ord.street as ordering_street, bp_ord.city as ordering_city,
        bp_sup.business_name as supplying_business_name, bp_sup.area as supplying_area, 
        bp_sup.street as supplying_street, bp_sup.city as supplying_city,
        p.product_name, op.quantity_requested
       FROM Orders o
       JOIN BusinessProfile bp_ord ON o.ordering_businessman_id = bp_ord.businessman_id
       JOIN BusinessProfile bp_sup ON o.supplying_businessman_id = bp_sup.businessman_id
       JOIN OrderProducts op ON o.order_id = op.order_id
       JOIN Product p ON op.product_id = p.product_id
       WHERE o.agent_id IS NULL
       AND o.status = 'Confirmed'
       AND o.delivery_status = 'Pending'
       AND (bp_sup.city = $1 OR bp_ord.city = $1)
       ORDER BY o.created_at DESC
       LIMIT $2`,
      [city, limit]
    );
    return result.rows;
  },

  // Get order statistics for dashboard
  async getOrderStatistics(agentId) {
    const result = await db.query(
      `SELECT
        COUNT(*) FILTER (WHERE delivery_status = 'Delivered') as completed_orders,
        COUNT(*) FILTER (WHERE delivery_status IN ('Assigned', 'PickedUp', 'InTransit')) as active_orders,
        SUM(CASE WHEN delivery_status = 'Delivered' THEN total_amount * 0.05 ELSE 0 END) as total_earnings
       FROM Orders
       WHERE agent_id = $1`,
      [agentId]
    );
    return result.rows[0];
  },

  // Get business order history with filters
  async getOrderHistoryByBusiness(businessmanId, filters = {}) {
    const { status, startDate, endDate, sort = 'newest' } = filters;
    
    // Build the query with optional filters
    let query = `
      SELECT o.*,
        bp_ord.business_name as ordering_business_name, bp_ord.area as ordering_area,
        bp_ord.street as ordering_street, bp_ord.city as ordering_city,
        bp_sup.business_name as supplying_business_name, bp_sup.area as supplying_area,
        bp_sup.street as supplying_street, bp_sup.city as supplying_city,
        p.product_name, p.price, p.image_url,
        op.quantity_requested, op.unit_price, op.subtotal,
        da.name as agent_name, da.contact_number as agent_contact, da.vehicle_type,
        r.rating, r.comment, r.created_at as review_date
      FROM Orders o
      JOIN BusinessProfile bp_ord ON o.ordering_businessman_id = bp_ord.businessman_id
      JOIN BusinessProfile bp_sup ON o.supplying_businessman_id = bp_sup.businessman_id
      JOIN OrderProducts op ON o.order_id = op.order_id
      JOIN Product p ON op.product_id = p.product_id
      LEFT JOIN DeliveryProfile da ON o.agent_id = da.agent_id
      LEFT JOIN Reviews r ON r.order_id = o.order_id
      WHERE (o.ordering_businessman_id = $1 OR o.supplying_businessman_id = $1)
    `;
    
    const queryParams = [businessmanId];
    let paramCount = 2;
    
    // Add status filter if provided
    if (status) {
      query += ` AND o.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }
    
    // Add date range filter if provided
    if (startDate) {
      query += ` AND o.created_at >= $${paramCount}`;
      queryParams.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND o.created_at <= $${paramCount}`;
      queryParams.push(endDate);
      paramCount++;
    }
    
    // Add sorting
    if (sort === 'oldest') {
      query += ` ORDER BY o.created_at ASC`;
    } else if (sort === 'highToLow') {
      query += ` ORDER BY o.total_amount DESC`;
    } else if (sort === 'lowToHigh') {
      query += ` ORDER BY o.total_amount ASC`;
    } else {
      // Default to newest first
      query += ` ORDER BY o.created_at DESC`;
    }
    
    const result = await db.query(query, queryParams);
    return result.rows;
  },
  
  // Create review for an order
  async createReview(reviewData) {
    const { order_id, reviewer_id, supplying_business_id, rating, comment } = reviewData;
    
    const result = await db.query(
      `INSERT INTO Reviews (order_id, reviewer_id, business_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [order_id, reviewer_id, supplying_business_id, rating, comment]
    );
    
    return result.rows[0];
  },
  
  // Check if an order has been reviewed
  async checkOrderReviewed(orderId) {
    const result = await db.query(
      `SELECT * FROM Reviews WHERE order_id = $1`,
      [orderId]
    );
    return result.rows.length > 0;
  }
};

export default OrderModel;