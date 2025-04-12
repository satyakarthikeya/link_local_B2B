import db from '../config/db.js';
import bcrypt from 'bcrypt';

const BusinessModel = {
  // Create a new business user
  async create(businessData) {
    const { email, password, business_name, owner_name, area, street, category, gst_number, phone_no } = businessData;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert into base Businessman table
      const businessmanRes = await client.query(
        `INSERT INTO Businessman (email, password) 
         VALUES ($1, $2) RETURNING *`,
        [email, hashedPassword]
      );

      // Insert into BusinessProfile table
      const profileRes = await client.query(
        `INSERT INTO BusinessProfile (businessman_id, business_name, owner_name, area, street, category, gst_number, phone_no)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [businessmanRes.rows[0].businessman_id, business_name, owner_name, area, street, category, gst_number, phone_no]
      );
      
      await client.query('COMMIT');

      // Combine the results
      return {
        ...businessmanRes.rows[0],
        ...profileRes.rows[0]
      };

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
      `SELECT b.*, bp.* 
       FROM Businessman b
       LEFT JOIN BusinessProfile bp ON b.businessman_id = bp.businessman_id 
       WHERE b.email = $1`,
      [email]
    );
    return result.rows[0];
  },

  // Find business user by ID
  async findById(id) {
    const result = await db.query(
      `SELECT b.*, bp.*, bb.*
       FROM Businessman b
       LEFT JOIN BusinessProfile bp ON b.businessman_id = bp.businessman_id
       LEFT JOIN Business_Banking bb ON b.businessman_id = bb.businessman_id
       WHERE b.businessman_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Update business user
  async update(id, updateData) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update base table if email is provided
      if (updateData.email) {
        await client.query(
          `UPDATE Businessman SET email = $1 WHERE businessman_id = $2`,
          [updateData.email, id]
        );
      }

      // Update profile information
      if (Object.keys(updateData).some(key => 
        ['business_name', 'owner_name', 'area', 'street', 'category', 'gst_number', 
         'phone_no', 'website', 'established_year', 'business_description'].includes(key))) {
        
        await client.query(
          `UPDATE BusinessProfile 
           SET business_name = COALESCE($1, business_name),
               owner_name = COALESCE($2, owner_name),
               area = COALESCE($3, area),
               street = COALESCE($4, street),
               category = COALESCE($5, category),
               gst_number = COALESCE($6, gst_number),
               phone_no = COALESCE($7, phone_no),
               website = COALESCE($8, website),
               established_year = COALESCE($9, established_year),
               business_description = COALESCE($10, business_description)
           WHERE businessman_id = $11`,
          [
            updateData.business_name,
            updateData.owner_name,
            updateData.area,
            updateData.street,
            updateData.category,
            updateData.gst_number,
            updateData.phone_no,
            updateData.website,
            updateData.established_year,
            updateData.business_description,
            id
          ]
        );
      }

      // Handle banking information update
      if (updateData.bankDetails) {
        const bankResult = await client.query(
          `SELECT * FROM Business_Banking WHERE businessman_id = $1`,
          [id]
        );
        
        if (bankResult.rows.length === 0) {
          await client.query(
            `INSERT INTO Business_Banking (
              businessman_id, account_holder_name, account_number, 
              ifsc_code, bank_name, branch_name
            ) VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              id,
              updateData.bankDetails.account_holder_name,
              updateData.bankDetails.account_number,
              updateData.bankDetails.ifsc_code,
              updateData.bankDetails.bank_name,
              updateData.bankDetails.branch_name
            ]
          );
        } else {
          await client.query(
            `UPDATE Business_Banking 
             SET account_holder_name = COALESCE($1, account_holder_name),
                 account_number = COALESCE($2, account_number),
                 ifsc_code = COALESCE($3, ifsc_code),
                 bank_name = COALESCE($4, bank_name),
                 branch_name = COALESCE($5, branch_name)
             WHERE businessman_id = $6`,
            [
              updateData.bankDetails.account_holder_name,
              updateData.bankDetails.account_number,
              updateData.bankDetails.ifsc_code,
              updateData.bankDetails.bank_name,
              updateData.bankDetails.branch_name,
              id
            ]
          );
        }
      }
      
      await client.query('COMMIT');
      
      // Return updated business data
      return await this.findById(id);
      
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
      SELECT b.*, bp.*
      FROM Businessman b
      LEFT JOIN BusinessProfile bp ON b.businessman_id = bp.businessman_id
      WHERE 1=1
    `;
    const params = [];
    
    if (category) {
      params.push(category);
      query += ` AND bp.category = $${params.length}`;
    }
    
    if (area) {
      params.push(area);
      query += ` AND bp.area = $${params.length}`;
    }
    
    const result = await db.query(query, params);
    return result.rows;
  }
};

export default BusinessModel;