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
      
      // Check if product has enough quantity available
      const productResult = await client.query(
        'SELECT quantity_available FROM Product WHERE product_id = $1',
        [product_id]
      );
      
      if (productResult.rows.length === 0) {
        throw new Error('Product not found');
      }
      
      const { quantity_available } = productResult.rows[0];
      
      if (quantity_available < quantity_requested) {
        throw new Error('Not enough quantity available');
      }
      
      // Create the order
      const orderResult = await client.query(
        `INSERT INTO Orders 
         (requesting_businessman_id, supplying_businessman_id, product_id, quantity_requested, status, delivery_status)
         VALUES ($1, $2, $3, $4, 'Requested', 'Accepted') 
         RETURNING *`,
        [requesting_businessman_id, supplying_businessman_id, product_id, quantity_requested]
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
        req.business_name as requesting_business_name,
        sup.business_name as supplying_business_name,
        p.product_name, p.price,
        da.name as agent_name, da.contact_number as agent_contact
      FROM Orders o
      JOIN Businessman req ON o.requesting_businessman_id = req.businessman_id
      JOIN Businessman sup ON o.supplying_businessman_id = sup.businessman_id
      JOIN Product p ON o.product_id = p.product_id
      LEFT JOIN Delivery_Agent da ON o.agent_id = da.agent_id
      WHERE o.order_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Update order status
  async updateStatus(id, status, delivery_status = null) {
    let query, params;
    
    if (delivery_status) {
      query = `UPDATE Orders
               SET status = $1,
                   delivery_status = $2
               WHERE order_id = $3
               RETURNING *`;
      params = [status, delivery_status, id];
    } else {
      query = `UPDATE Orders
               SET status = $1
               WHERE order_id = $2
               RETURNING *`;
      params = [status, id];
    }
    
    const result = await db.query(query, params);
    return result.rows[0];
  },

  // Get orders by businessman ID (either requesting or supplying)
  async getByBusinessmanId(businessmanId, role = 'both') {
    let query = `
      SELECT o.*,
        req.business_name as requesting_business_name,
        sup.business_name as supplying_business_name,
        p.product_name, p.price,
        da.name as agent_name, da.contact_number as agent_contact
      FROM Orders o
      JOIN Businessman req ON o.requesting_businessman_id = req.businessman_id
      JOIN Businessman sup ON o.supplying_businessman_id = sup.businessman_id
      JOIN Product p ON o.product_id = p.product_id
      LEFT JOIN Delivery_Agent da ON o.agent_id = da.agent_id
      WHERE 
    `;
    
    if (role === 'requesting') {
      query += 'o.requesting_businessman_id = $1';
    } else if (role === 'supplying') {
      query += 'o.supplying_businessman_id = $1';
    } else {
      query += 'o.requesting_businessman_id = $1 OR o.supplying_businessman_id = $1';
    }
    
    query += ' ORDER BY o.order_date DESC';
    
    const result = await db.query(query, [businessmanId]);
    return result.rows;
  },

  // Get orders assigned to a delivery agent
  async getByAgentId(agentId) {
    const result = await db.query(
      `SELECT o.*,
        req.business_name as requesting_business_name, req.area as requesting_area, req.street as requesting_street,
        sup.business_name as supplying_business_name, sup.area as supplying_area, sup.street as supplying_street,
        p.product_name
      FROM Orders o
      JOIN Businessman req ON o.requesting_businessman_id = req.businessman_id
      JOIN Businessman sup ON o.supplying_businessman_id = sup.businessman_id
      JOIN Product p ON o.product_id = p.product_id
      WHERE o.agent_id = $1
      ORDER BY o.order_date DESC`,
      [agentId]
    );
    return result.rows;
  },

  // Assign delivery agent to order
  async assignAgent(orderId, agentId) {
    const result = await db.query(
      'UPDATE Orders SET agent_id = $1, delivery_status = $2 WHERE order_id = $3 RETURNING *',
      [agentId, 'Accepted', orderId]
    );
    return result.rows[0];
  }
};

export default OrderModel;