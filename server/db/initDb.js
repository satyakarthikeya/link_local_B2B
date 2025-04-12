import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  console.log('Starting database initialization...');
  
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'init.sql');
    const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Connect to database
    const client = await db.pool.connect();
    
    try {
      console.log('Running database initialization script...');
      await client.query('BEGIN');
      
      // Execute the SQL commands
      await client.query(sqlCommands);
      
      await client.query('COMMIT');
      console.log('Database initialization completed successfully');
      
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error during database initialization:', err);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
}

// Run the initialization if this file is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export default initializeDatabase;