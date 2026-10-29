const fs = require('fs');
const path = require('path');

console.log('📦 Preparing Hostinger Deployment Package...\n');

const sourceDir = path.join(__dirname, '..');
const targetDir = path.join(__dirname, '..', 'hostinger-deploy');

// Files and folders to include
const include = [
  'src',
  'scripts',
  '.env',
  'package.json',
  'package-lock.json'
];

// Create uploads folder if not exists
const uploadsDir = path.join(targetDir, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads folder');
}

// Copy files and folders
include.forEach(item => {
  const sourcePath = path.join(sourceDir, item);
  const targetPath = path.join(targetDir, item);
  
  if (fs.existsSync(sourcePath)) {
    const stats = fs.statSync(sourcePath);
    
    if (stats.isDirectory()) {
      // Copy directory
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
        console.log(`✅ Copied directory: ${item}/`);
      }
    } else {
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Copied file: ${item}`);
    }
  } else {
    console.log(`⚠️  Not found: ${item}`);
  }
});

console.log('\n📦 Package ready at:', targetDir);
console.log('\nNext steps:');
console.log('1. Upload all files from hostinger-deploy/ to your Hostinger account');
console.log('2. Set environment variables in Hostinger control panel');
console.log('3. Run: npm install');
console.log('4. Run: npm run seed:admin');
console.log('5. Restart the application');
