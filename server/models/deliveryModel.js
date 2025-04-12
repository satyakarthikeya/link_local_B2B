import db from '../config/db.js';
import bcrypt from 'bcrypt';

// Delivery agent model with CRUD operations
const DeliveryModel = {
  // Create a new delivery agent
  async create(agentData) {
    const { name, contact_number, vehicle_type, license_no, email, password } = agentData;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const result = await db.query(
      `INSERT INTO Delivery_Agent (name, contact_number, vehicle_type, license_no, email, password)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, contact_number, vehicle_type, license_no, email, hashedPassword]
    );
    
    return result.rows[0];
  },

  // Find delivery agent by email
  async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM Delivery_Agent WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  // Find delivery agent by ID
  async findById(id) {
    const result = await db.query(
      'SELECT * FROM Delivery_Agent WHERE agent_id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Update delivery agent
  async update(id, updateData) {
    const { name, contact_number, vehicle_type, availability_status } = updateData;
    
    const result = await db.query(
      `UPDATE Delivery_Agent
       SET name = COALESCE($1, name),
           contact_number = COALESCE($2, contact_number),
           vehicle_type = COALESCE($3, vehicle_type),
           availability_status = COALESCE($4, availability_status)
       WHERE agent_id = $5
       RETURNING *`,
      [name, contact_number, vehicle_type, availability_status, id]
    );
    
    return result.rows[0];
  },

  // Get all available delivery agents
  async getAvailable() {
    const result = await db.query(
      'SELECT * FROM Delivery_Agent WHERE availability_status = true'
    );
    return result.rows;
  },
  
  // Update delivery agent's availability
  async updateAvailability(id, status) {
    const result = await db.query(
      'UPDATE Delivery_Agent SET availability_status = $1 WHERE agent_id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  },
  
  // Assign order to delivery agent
  async assignOrder(agentId, orderId) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update the Orders table with the agent ID
      await client.query(
        'UPDATE Orders SET agent_id = $1 WHERE order_id = $2',
        [agentId, orderId]
      );
      
      // Update the Delivery_Agent with the order ID
      const agentResult = await client.query(
        'UPDATE Delivery_Agent SET order_id = $1 WHERE agent_id = $2 RETURNING *',
        [orderId, agentId]
      );
      
      await client.query('COMMIT');
      return agentResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
};

export default DeliveryModel;