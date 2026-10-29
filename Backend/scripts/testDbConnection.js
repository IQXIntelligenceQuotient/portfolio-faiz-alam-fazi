require('dotenv').config();
const { Pool } = require('pg');

console.log('🔍 Testing Database Connection...\n');

// Check what environment variables are loaded
console.log('Environment Check:');
console.log('- DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('- DB_HOST:', process.env.DB_HOST);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('');

// Test Neon connection
async function testNeonConnection() {
  if (!process.env.DATABASE_URL) {
    console.log('❌ No DATABASE_URL found in .env file');
    return false;
  }

  console.log('📦 Testing Neon PostgreSQL connection...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to Neon PostgreSQL!');
    
    const result = await client.query('SELECT 1');
    console.log('✅ Query test passed:', result.rows);
    
    // Test table existence
    try {
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      console.log('📊 Tables found:', tables.rows.length > 0 ? tables.rows.map(r => r.table_name).join(', ') : 'No tables');
    } catch (err) {
      console.log('⚠️  Could not list tables:', err.message);
    }
    
    client.release();
    await pool.end();
    return true;
  } catch (err) {
    console.error('❌ Neon connection failed:', err.message);
    console.error('Error details:', err);
    await pool.end();
    return false;
  }
}

// Test local connection
async function testLocalConnection() {
  if (!process.env.DB_HOST || process.env.DB_HOST === 'localhost') {
    console.log('⚠️  No local DB_HOST configured, skipping local connection test');
    return false;
  }

  console.log('📦 Testing Local PostgreSQL connection...');
  const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME,
  });

  try {
    const client = await pool.connect();
    console.log('✅ Successfully connected to Local PostgreSQL!');
    client.release();
    await pool.end();
    return true;
  } catch (err) {
    console.error('❌ Local connection failed:', err.message);
    await pool.end();
    return false;
  }
}

// Run tests
async function runTests() {
  const neonSuccess = await testNeonConnection();
  console.log('');
  
  if (!neonSuccess) {
    console.log('💡 Troubleshooting steps:');
    console.log('1. Check if DATABASE_URL is correct in .env file');
    console.log('2. Verify your Neon database is active');
    console.log('3. Check if your IP is whitelisted in Neon dashboard');
    console.log('4. Ensure sslmode=require is in the connection string');
  }
}

runTests();
