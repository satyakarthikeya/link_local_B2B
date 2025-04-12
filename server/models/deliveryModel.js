import db from '../config/db.js';
import bcrypt from 'bcrypt';

const DeliveryModel = {
  // Create a new delivery agent
  async create(agentData) {
    const { 
      email, 
      password, 
      name, 
      contact_number, 
      vehicle_type, 
      vehicle_number, 
      license_no, 
      area = '' // Provide default empty string if area is missing
    } = agentData;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Insert into base DeliveryAgent table
      const agentRes = await client.query(
        `INSERT INTO DeliveryAgent (email, password) 
         VALUES ($1, $2) RETURNING *`,
        [email, hashedPassword]
      );

      // Insert into DeliveryProfile table with vehicle_number parameter
      const profileRes = await client.query(
        `INSERT INTO DeliveryProfile (agent_id, name, contact_number, vehicle_type, vehicle_number, license_no, area)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [agentRes.rows[0].agent_id, name, contact_number, vehicle_type, vehicle_number || '', license_no, area]
      );
      
      await client.query('COMMIT');

      // Combine the results
      return {
        ...agentRes.rows[0],
        ...profileRes.rows[0]
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error in DeliveryModel.create:', error.message);
      throw error;
    } finally {
      client.release();
    }
  },

  // Find delivery agent by email
  async findByEmail(email) {
    const result = await db.query(
      `SELECT da.*, dp.* 
       FROM DeliveryAgent da
       LEFT JOIN DeliveryProfile dp ON da.agent_id = dp.agent_id 
       WHERE da.email = $1`,
      [email]
    );
    return result.rows[0];
  },

  // Find delivery agent by ID
  async findById(id) {
    const result = await db.query(
      `SELECT da.*, dp.*, db.*
       FROM DeliveryAgent da
       LEFT JOIN DeliveryProfile dp ON da.agent_id = dp.agent_id
       LEFT JOIN Delivery_Banking db ON da.agent_id = db.agent_id
       WHERE da.agent_id = $1`,
      [id]
    );
    return result.rows[0];
  },

  // Update delivery agent
  async update(id, updateData) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update base table if email is provided
      if (updateData.email) {
        await client.query(
          `UPDATE DeliveryAgent SET email = $1 WHERE agent_id = $2`,
          [updateData.email, id]
        );
      }

      // Update profile information
      if (Object.keys(updateData).some(key => 
        ['name', 'contact_number', 'gender', 'date_of_birth', 'area', 'street', 
         'vehicle_type', 'vehicle_number', 'license_no', 'about', 'availability_status'].includes(key))) {
        
        await client.query(
          `UPDATE DeliveryProfile 
           SET name = COALESCE($1, name),
               contact_number = COALESCE($2, contact_number),
               gender = COALESCE($3, gender),
               date_of_birth = COALESCE($4, date_of_birth),
               area = COALESCE($5, area),
               street = COALESCE($6, street),
               vehicle_type = COALESCE($7, vehicle_type),
               vehicle_number = COALESCE($8, vehicle_number),
               license_no = COALESCE($9, license_no),
               about = COALESCE($10, about),
               availability_status = COALESCE($11, availability_status)
           WHERE agent_id = $12`,
          [
            updateData.name,
            updateData.contact_number,
            updateData.gender,
            updateData.date_of_birth,
            updateData.area,
            updateData.street,
            updateData.vehicle_type,
            updateData.vehicle_number,
            updateData.license_no,
            updateData.about,
            updateData.availability_status,
            id
          ]
        );
      }

      // Handle banking information update
      if (updateData.bankDetails) {
        const bankResult = await client.query(
          `SELECT * FROM Delivery_Banking WHERE agent_id = $1`,
          [id]
        );
        
        if (bankResult.rows.length === 0) {
          await client.query(
            `INSERT INTO Delivery_Banking (
              agent_id, account_holder_name, account_number, 
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
            `UPDATE Delivery_Banking 
             SET account_holder_name = COALESCE($1, account_holder_name),
                 account_number = COALESCE($2, account_number),
                 ifsc_code = COALESCE($3, ifsc_code),
                 bank_name = COALESCE($4, bank_name),
                 branch_name = COALESCE($5, branch_name)
             WHERE agent_id = $6`,
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
      
      // Return updated delivery agent data
      return await this.findById(id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  // Get all available delivery agents
  async getAvailable() {
    const result = await db.query(
      `SELECT da.*, dp.* 
       FROM DeliveryAgent da
       JOIN DeliveryProfile dp ON da.agent_id = dp.agent_id
       WHERE dp.availability_status = 'Available'`
    );
    return result.rows;
  },

  // Update delivery agent's availability
  async updateAvailability(id, status) {
    const result = await db.query(
      `UPDATE DeliveryProfile 
       SET availability_status = $1 
       WHERE agent_id = $2 
       RETURNING *`,
      [status ? 'Available' : 'Unavailable', id]
    );
    return result.rows[0];
  },

  // Update delivery stats
  async updateStats(id, { rating, completed }) {
    const result = await db.query(
      `UPDATE DeliveryProfile 
       SET avg_rating = CASE 
           WHEN total_deliveries = 0 THEN $1
           ELSE ((avg_rating * total_deliveries) + $1) / (total_deliveries + 1)
         END,
         total_deliveries = CASE 
           WHEN $2 = true THEN total_deliveries + 1
           ELSE total_deliveries
         END
       WHERE agent_id = $3 
       RETURNING *`,
      [rating, completed, id]
    );
    return result.rows[0];
  }
};

export default DeliveryModel;