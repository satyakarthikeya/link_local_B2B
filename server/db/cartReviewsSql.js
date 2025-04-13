import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCartReviewsSQL() {
  try {
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'cart_reviews_tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('Running cart and reviews tables setup...');
    
    // Execute the SQL statements
    try {
      await db.query(sqlContent);
      console.log('✅ Cart and Reviews tables created successfully!');
    } catch (err) {
      console.error('❌ Error executing SQL script:', err);
    }
  } catch (err) {
    console.error('❌ Error reading SQL file:', err);
  }
}

runCartReviewsSQL();