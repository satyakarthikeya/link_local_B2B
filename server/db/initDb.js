import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from root directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function initializeDatabase() {
  // Log the DATABASE_URL (without the password for security)
  const dbUrl = process.env.DATABASE_URL || '';
  const sanitizedUrl = dbUrl.replace(/:([^:@]+)@/, ':*****@');
  console.log('Connecting to database:', sanitizedUrl);
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('Testing database connection...');
    await pool.query('SELECT NOW()');
    console.log('Database connection successful!');
    
    console.log('Initializing database...');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, 'init.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Execute the SQL commands
    await pool.query(sql);
    
    console.log('Database initialized successfully!');
    
    // Insert sample data (optional)
    console.log('Inserting sample data...');
    
    // Insert business users
    await pool.query(`
      INSERT INTO Businessman (name, business_name, area, street, category, rating, email, password)
      VALUES 
      ('Rohith', 'Rohith SuperMarket', 'Market Area', 'Street 1', 'SuperMarket', 4.5, 'rohith@example.com', '$2b$10$Ek7MneKP.Vw0ade2LWRJ2.kpLESgTDgra7h1EOwuxFY66IxJ8CLLW'),
      ('Pydi', 'Pydi Electronics', 'Tech Park', 'Street 2', 'Electronics', 4.2, 'pydi@example.com', '$2b$10$Ek7MneKP.Vw0ade2LWRJ2.kpLESgTDgra7h1EOwuxFY66IxJ8CLLW'),
      ('BK', 'BK Wholesale', 'Industrial Hub', 'Street 3', 'Wholesale', 4.7, 'bk@example.com', '$2b$10$Ek7MneKP.Vw0ade2LWRJ2.kpLESgTDgra7h1EOwuxFY66IxJ8CLLW'),
      ('Kenny', 'Kenny Restaurant', 'Food Street', 'Street 4', 'Restaurant', 4.8, 'kenny@example.com', '$2b$10$Ek7MneKP.Vw0ade2LWRJ2.kpLESgTDgra7h1EOwuxFY66IxJ8CLLW')
    `);
    
    // Insert contact numbers
    await pool.query(`
      INSERT INTO ContactNo (businessman_id, phone_no)
      VALUES 
      (1, '9507444555'), 
      (2, '9391999643'), 
      (3, '7815923423'), 
      (4, '9703995921')
    `);
    
    // Insert products
    await pool.query(`
      INSERT INTO Product (product_name, price, quantity_available, businessman_id, description, image_url)
      VALUES
      ('Rice', 50.00, 100, 1, 'Premium quality rice', '/assets/rice_bags.jpeg'),
      ('Laptop', 50000.00, 10, 2, 'High performance laptop', '/assets/headphones.jpeg'),
      ('Wheat', 40.00, 150, 3, 'Organic wheat', '/assets/A4 sheets.jpeg'),
      ('Burger', 100.00, 50, 4, 'Delicious burger', '/assets/guddu.jpeg')
    `);
    
    // Insert delivery agents
    await pool.query(`
      INSERT INTO Delivery_Agent (name, contact_number, availability_status, vehicle_type, license_no, email, password)
      VALUES
      ('Myla', '9876543210', TRUE, 'Bike', 'DL01AB1234', 'myla@example.com', '$2b$10$Ek7MneKP.Vw0ade2LWRJ2.kpLESgTDgra7h1EOwuxFY66IxJ8CLLW'),
      ('Khadar', '8765432109', TRUE, 'Truck', 'KA02CD5678', 'khadar@example.com', '$2b$10$Ek7MneKP.Vw0ade2LWRJ2.kpLESgTDgra7h1EOwuxFY66IxJ8CLLW'),
      ('Dona', '7395684921', TRUE, 'Van', 'AP22AB0007', 'dona@example.com', '$2b$10$Ek7MneKP.Vw0ade2LWRJ2.kpLESgTDgra7h1EOwuxFY66IxJ8CLLW')
    `);
    
    console.log('Sample data inserted successfully!');
    
  } catch (err) {
    console.error('Error initializing database:', err);
    console.log('Please check that:');
    console.log('1. PostgreSQL is running on your machine');
    console.log('2. The database "linklocal" exists');
    console.log('3. The user "pydi" exists with the correct password');
    console.log('4. The user has permissions to create tables and insert data');
  } finally {
    await pool.end();
  }
}

initializeDatabase();