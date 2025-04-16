import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Adding connection pool limits to prevent connection leaks
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Add event listeners for connection issues
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection on startup
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
  } catch (err) {
    console.error('Database connection error:', err.message);
  }
};

testConnection();

export default {
  query: (text, params) => pool.query(text, params),
  pool,
  // Add a transaction helper function
  getClient: async () => {
    const client = await pool.connect();
    const query = (text, params) => client.query(text, params);
    const release = () => client.release();
    return { query, release };
  }
};