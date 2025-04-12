import db from '../config/db.js';
import bcrypt from 'bcrypt';

// Business user model with CRUD operations
const BusinessModel = {
  // Create a new business user
  async create(businessData) {
    const { name, business_name, area, street, category, email, password, phone_no } = businessData;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Begin transaction
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert business user
      const businessRes = await client.query(
        `INSERT INTO Businessman (name, business_name, area, street, category, email, password)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, business_name, area, street, category, email, hashedPassword]
      );
      
      // Insert phone number if provided
      if (phone_no) {
        await client.query(
          `INSERT INTO ContactNo (businessman_id, phone_no) VALUES ($1, $2)`,
          [businessRes.rows[0].businessman_id, phone_no]
        );
      }
      
      await client.query('COMMIT');
      return businessRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Find business user by email
  async findByEmail(email) {
    const result = await db.query(
      `SELECT b.*, c.phone_no 
       FROM Businessman b 
       LEFT JOIN ContactNo c ON b.businessman_id = c.businessman_id 
       WHERE b.email = $1`,
      [email]
    );
    return result.rows[0];
  },

  // Find business user by ID
  async findById(id) {
    const result = await db.query(
      `SELECT b.*, c.phone_no 
       FROM Businessman b 
       LEFT JOIN ContactNo c ON b.businessman_id = c.businessman_id 
       WHERE b.businessman_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Update business user
  async update(id, updateData) {
    const { name, business_name, area, street, category, phone_no } = updateData;
    
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update business info
      const businessRes = await client.query(
        `UPDATE Businessman
         SET name = COALESCE($1, name),
             business_name = COALESCE($2, business_name),
             area = COALESCE($3, area),
             street = COALESCE($4, street),
             category = COALESCE($5, category)
         WHERE businessman_id = $6
         RETURNING *`,
        [name, business_name, area, street, category, id]
      );
      
      // Update phone number if provided
      if (phone_no) {
        // Check if phone number already exists
        const phoneResult = await client.query(
          'SELECT * FROM ContactNo WHERE businessman_id = $1',
          [id]
        );
        
        if (phoneResult.rows.length === 0) {
          // Insert new phone number
          await client.query(
            'INSERT INTO ContactNo (businessman_id, phone_no) VALUES ($1, $2)',
            [id, phone_no]
          );
        } else {
          // Update existing phone number
          await client.query(
            'UPDATE ContactNo SET phone_no = $1 WHERE businessman_id = $2',
            [phone_no, id]
          );
        }
      }
      
      await client.query('COMMIT');
      return businessRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Get all businesses with optional filters
  async getAll(filters = {}) {
    const { category, area } = filters;
    let query = `
      SELECT b.*, c.phone_no 
      FROM Businessman b
      LEFT JOIN ContactNo c ON b.businessman_id = c.businessman_id
      WHERE 1=1
    `;
    const params = [];
    
    if (category) {
      params.push(category);
      query += ` AND b.category = $${params.length}`;
    }
    
    if (area) {
      params.push(area);
      query += ` AND b.area = $${params.length}`;
    }
    
    const result = await db.query(query, params);
    return result.rows;
  }
};

export default BusinessModel;