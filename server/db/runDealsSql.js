// filepath: c:\Users\pasar\Desktop\link-local\server\db\runDealsSql.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runDealsTableSQL() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'deals_table.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Running deals_table.sql script...');
    
    // Get a client for transaction
    const client = await db.pool.connect();
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      
      // Run the SQL script
      await client.query(sqlContent);
      
      // Commit transaction
      await client.query('COMMIT');
      
      console.log('✅ Deals table created successfully!');
    } catch (err) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      console.error('❌ Error executing SQL script:', err);
    } finally {
      // Release client
      client.release();
    }
  } catch (err) {
    console.error('❌ Error reading SQL file:', err);
  } finally {
    // Close pool
    db.pool.end();
  }
}

// Run the function
runDealsTableSQL();