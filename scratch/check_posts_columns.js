require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    await client.connect();
    const res = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'posts' ORDER BY ordinal_position;`);
    console.log('Columns in posts table:', res.rows.map(r => r.column_name).join(', '));
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await client.end();
  }
})();
