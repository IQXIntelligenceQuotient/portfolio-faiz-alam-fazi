/**
 * Verification test to confirm ogRoutes endpoint responds with correct HTML tags
 */
const http = require('http');

function testOgEndpoint() {
  console.log('📡 Fetching OG meta tags for "/og/blogs/foreign-direct-investment-lawyer-in-pakistan-legal-advisory-for-global-investors"...');
  
  http.get('http://localhost:5000/og/blogs/foreign-direct-investment-lawyer-in-pakistan-legal-advisory-for-global-investors', (res) => {
    let data = '';
    
    res.on('data', (chunk) => { data += chunk; });
    
    res.on('end', () => {
      console.log(`✅ Received Response (Status: ${res.statusCode})`);
      if (data.includes('<meta property="og:image"')) {
        console.log('✅ Success! HTML contains valid "og:image" tag.');
      } else {
        console.warn('⚠️ Warning: "og:image" tag not found.');
      }
      
      if (data.includes('<meta property="og:type" content="article"')) {
        console.log('✅ Success! HTML contains valid "og:type" article tag.');
      }
      
      console.log('\n📋 Meta Section snippet:\n');
      const lines = data.split('\n').filter(l => l.includes('meta') || l.includes('title'));
      lines.forEach(l => console.log(l.trim()));
    });
  }).on('error', (err) => {
    console.error('❌ Failed to connect to server:', err.message);
  });
}

testOgEndpoint();
