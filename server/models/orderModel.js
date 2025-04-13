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
        bp_sup.business_name as supplying_business_name, bp_sup.area as supplying_area, bp_sup.street as supplying_street,
        p.product_name
      FROM Orders o
      JOIN BusinessProfile bp_ord ON o.ordering_businessman_id = bp_ord.businessman_id
      JOIN BusinessProfile bp_sup ON o.supplying_businessman_id = bp_sup.businessman_id
      JOIN OrderProducts op ON o.order_id = op.order_id
      JOIN Product p ON op.product_id = p.product_id
      WHERE o.agent_id = $1
      ORDER BY o.created_at DESC`,
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
  }
};

export default OrderModel;