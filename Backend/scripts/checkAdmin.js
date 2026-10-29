const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const pool = require('../src/config/db');

const checkAdmin = async () => {
  try {
    console.log('\n=== Checking Admin User ===\n');
    
    // Get admin from database
    const result = await pool.query(
      'SELECT id, name, email, role, password FROM users WHERE email = $1',
      ['admin@faizalamfaizi.com']
    );

    if (result.rows.length === 0) {
      console.log('❌ No admin user found in database!');
      console.log('Run: npm run seed:admin');
      process.exit(1);
    }

    const user = result.rows[0];
    console.log('✅ Admin user found:');
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   Password Hash:', user.password.substring(0, 20) + '...');

    // Test password from .env
    const testPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    console.log('\n=== Testing Password ===');
    console.log('Testing password:', testPassword);
    
    const isValid = await bcrypt.compare(testPassword, user.password);
    
    if (isValid) {
      console.log('✅ Password matches!');
      console.log('\nLogin credentials:');
      console.log('   Email:', user.email);
      console.log('   Password:', testPassword);
    } else {
      console.log('❌ Password does NOT match!');
      console.log('\nTrying to re-seed admin...');
      
      // Delete old admin
      await pool.query('DELETE FROM users WHERE email = $1', ['admin@faizalamfaizi.com']);
      
      // Create new admin with correct password
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      const newResult = await pool.query(
        `INSERT INTO users (name, email, password, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, role`,
        ['Admin', 'admin@faizalamfaizi.com', hashedPassword, 'admin']
      );
      
      console.log('✅ Admin re-created successfully!');
      console.log('   Email:', newResult.rows[0].email);
      console.log('   Password:', testPassword);
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkAdmin();
