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
      `SELECT b.*, bp.*, bb.account_holder_name, bb.account_number, bb.ifsc_code, bb.bank_name, bb.branch_name 
       FROM Businessman b
       LEFT JOIN BusinessProfile bp ON b.businessman_id = bp.businessman_id 
       LEFT JOIN Business_Banking bb ON b.businessman_id = bb.businessman_id
       WHERE b.email = $1`,
      [email]
    );
    if (result.rows.length === 0) {
      return null;
    }
    const userData = result.rows[0];
    userData.bankDetails = {
      account_holder_name: userData.account_holder_name || null,
      account_number: userData.account_number || null,
      ifsc_code: userData.ifsc_code || null,
      bank_name: userData.bank_name || null,
      branch_name: userData.branch_name || null
    };
    delete userData.account_holder_name;
    delete userData.account_number;
    delete userData.ifsc_code;
    delete userData.bank_name;
    delete userData.branch_name;
    return userData;
  },

  // Find business user by ID
  async findById(id) {
    const result = await db.query(
      `SELECT 
        b.businessman_id, b.email, b.created_at, b.updated_at,
        bp.profile_id, bp.business_name, bp.owner_name, bp.area, bp.street, 
        bp.city, bp.state, bp.pincode, bp.phone_no, bp.website, 
        bp.established_year, bp.business_description, bp.category, bp.gst_number,
        bb.account_holder_name, bb.account_number, bb.ifsc_code, 
        bb.bank_name, bb.branch_name
       FROM Businessman b
       LEFT JOIN BusinessProfile bp ON b.businessman_id = bp.businessman_id
       LEFT JOIN Business_Banking bb ON b.businessman_id = bb.businessman_id
       WHERE b.businessman_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null; // Return null if no user is found
    }

    const userData = result.rows[0];

    // Add a structured bankDetails object
    userData.bankDetails = {
      account_holder_name: userData.account_holder_name || null,
      account_number: userData.account_number || null,
      ifsc_code: userData.ifsc_code || null,
      bank_name: userData.bank_name || null,
      branch_name: userData.branch_name || null
    };

    // Remove raw banking fields from the main object
    delete userData.account_holder_name;
    delete userData.account_number;
    delete userData.ifsc_code;
    delete userData.bank_name;
    delete userData.branch_name;

    return userData;
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
        try {
          const bankResult = await client.query(
            `SELECT * FROM Business_Banking WHERE businessman_id = $1`,
            [id]
          );
          
          // Extract and validate bank details, safely handle missing fields
          const bankDetails = updateData.bankDetails || {};
          const accountHolderName = bankDetails.account_holder_name !== undefined ? bankDetails.account_holder_name : null;
          const accountNumber = bankDetails.account_number !== undefined ? bankDetails.account_number : null;
          const ifscCode = bankDetails.ifsc_code !== undefined ? bankDetails.ifsc_code : null;
          const bankName = bankDetails.bank_name !== undefined ? bankDetails.bank_name : null;
          const branchName = bankDetails.branch_name !== undefined ? bankDetails.branch_name : null;
          
          if (bankResult.rows.length === 0) {
            // Insert new banking record
            await client.query(
              `INSERT INTO Business_Banking (
                businessman_id, account_holder_name, account_number, 
                ifsc_code, bank_name, branch_name
              ) VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                id,
                accountHolderName,
                accountNumber,
                ifscCode,
                bankName,
                branchName
              ]
            );
          } else {
            // Update existing banking record - only update fields that are provided
            const fieldsToUpdate = [];
            const params = [];
            
            if (bankDetails.account_holder_name !== undefined) {
              fieldsToUpdate.push(`account_holder_name = $${params.length + 1}`);
              params.push(accountHolderName);
            }
            
            if (bankDetails.account_number !== undefined) {
              fieldsToUpdate.push(`account_number = $${params.length + 1}`);
              params.push(accountNumber);
            }
            
            if (bankDetails.ifsc_code !== undefined) {
              fieldsToUpdate.push(`ifsc_code = $${params.length + 1}`);
              params.push(ifscCode);
            }
            
            if (bankDetails.bank_name !== undefined) {
              fieldsToUpdate.push(`bank_name = $${params.length + 1}`);
              params.push(bankName);
            }
            
            if (bankDetails.branch_name !== undefined) {
              fieldsToUpdate.push(`branch_name = $${params.length + 1}`);
              params.push(branchName);
            }
            
            // Only proceed with update if there are fields to update
            if (fieldsToUpdate.length > 0) {
              params.push(id);
              await client.query(
                `UPDATE Business_Banking 
                 SET ${fieldsToUpdate.join(', ')}
                 WHERE businessman_id = $${params.length}`,
                params
              );
            }
          }
        } catch (error) {
          console.error('Error updating banking details:', error);
          // Don't swallow the error, propagate it up
          throw new Error(`Failed to update banking details: ${error.message}`);
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