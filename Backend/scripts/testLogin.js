const fetch = require('node-fetch');

const testLogin = async () => {
  try {
    console.log('\n=== Testing Login API ===\n');
    console.log('Endpoint: http://localhost:5000/api/auth/login');
    console.log('Email: admin@faizalamfaizi.com');
    console.log('Password: Admin@12345\n');

    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@faizalamfaizi.com',
        password: 'Admin@12345'
      })
    });

    const data = await response.json();

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));

    if (response.ok) {
      console.log('\n✅ Login successful!');
      console.log('Token:', data.token ? 'Received' : 'Missing');
    } else {
      console.log('\n❌ Login failed!');
      console.log('Error:', data.message);
    }

  } catch (error) {
    console.error('\n❌ Error testing login:');
    if (error.code === 'ECONNREFUSED') {
      console.error('Backend server is not running!');
      console.error('Start it with: npm run backend');
    } else {
      console.error(error.message);
    }
  }
};

testLogin();
