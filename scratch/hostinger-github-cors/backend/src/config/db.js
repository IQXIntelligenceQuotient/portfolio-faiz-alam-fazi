const { Pool } = require('pg');
require('dotenv').config();

// Always prioritize DATABASE_URL if available (Neon PostgreSQL)
const useNeon = !!process.env.DATABASE_URL;

let pool;

if (useNeon) {
  console.log('📦 Using Neon PostgreSQL (DATABASE_URL found)');
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { 
      rejectUnauthorized: false,
      ca: process.env.PGSSLCERT ? require('fs').readFileSync(process.env.PGSSLCERT) : undefined
    },
  });
} else {
  console.log('📦 Using Local PostgreSQL (no DATABASE_URL)');
  pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
  });
}

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Test connection on startup
pool.query('SELECT 1')
  .then(() => console.log('✅ Database connected successfully:', useNeon ? 'Neon (cloud)' : 'Local PostgreSQL'))
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    console.error('Error details:', err);
    console.error('DATABASE_URL present:', !!process.env.DATABASE_URL);
    console.error('DB_HOST:', process.env.DB_HOST);
  });

module.exports = pool;
