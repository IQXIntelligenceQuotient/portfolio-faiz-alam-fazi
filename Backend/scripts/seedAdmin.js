const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = require('../src/config/db');
const createBlogTables = require('../src/models/blogModel');

const seedAdmin = async () => {
  try {
    // ADDED: Make sure all blog tables exist before inserting admin
    await createBlogTables();

    // ADDED: Admin details will come from .env file
    const name = process.env.ADMIN_NAME || 'Admin';
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    // ADDED: Basic check so empty email/password is not inserted
    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required in .env file');
    }

    // ADDED: Password must be hashed before saving into database
    const hashedPassword = await bcrypt.hash(password, 10);

    // ADDED: Insert admin only if email does not already exist
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, 'admin']
    );

    if (result.rows.length === 0) {
      console.log('Admin already exists. No new admin created.');
    } else {
      console.log('Admin created successfully:', result.rows[0]);
    }

    process.exit(0);

  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();