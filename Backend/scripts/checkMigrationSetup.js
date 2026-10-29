require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../src/config/db');
const fs = require('fs');
const path = require('path');

/**
 * Check Migration System Setup
 * 
 * Verifies that the migration system is properly configured and ready to use.
 */

async function checkMigrationSetup() {
  try {
    console.log('🔍 Checking migration system setup...\n');
    
    // 1. Check if migrations directory exists
    const migrationsDir = path.join(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('❌ Migrations directory not found:', migrationsDir);
      process.exit(1);
    }
    console.log('✓ Migrations directory exists');
    
    // 2. Check if required files exist
    const requiredFiles = [
      'config.js',
      'migrate.js',
      'rollback.js',
      'README.md',
      'MIGRATION_GUIDE.md',
      'QUICK_START.md'
    ];
    
    for (const file of requiredFiles) {
      const filePath = path.join(migrationsDir, file);
      if (!fs.existsSync(filePath)) {
        console.log(`❌ Required file not found: ${file}`);
        process.exit(1);
      }
    }
    console.log('✓ All required files exist');
    
    // 3. Check if scripts directory exists
    const scriptsDir = path.join(migrationsDir, 'scripts');
    if (!fs.existsSync(scriptsDir)) {
      console.log('❌ Scripts directory not found:', scriptsDir);
      process.exit(1);
    }
    console.log('✓ Scripts directory exists');
    
    // 4. Check if template file exists
    const templatePath = path.join(scriptsDir, '_TEMPLATE.js.example');
    if (!fs.existsSync(templatePath)) {
      console.log('❌ Template file not found:', templatePath);
      process.exit(1);
    }
    console.log('✓ Template file exists');
    
    // 5. Check database connection
    await pool.query('SELECT 1');
    console.log('✓ Database connection successful');
    
    // 6. Check if migrations_history table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'migrations_history'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✓ Migrations history table exists');
      
      // Show migration history
      const history = await pool.query(`
        SELECT migration_name, applied_at, rolled_back_at
        FROM migrations_history
        ORDER BY applied_at DESC
      `);
      
      if (history.rows.length > 0) {
        console.log('\n📋 Migration History:');
        history.rows.forEach(row => {
          const status = row.rolled_back_at ? '🔄 ROLLED BACK' : '✓ APPLIED';
          console.log(`  ${status} ${row.migration_name}`);
          console.log(`     Applied: ${row.applied_at}`);
          if (row.rolled_back_at) {
            console.log(`     Rolled back: ${row.rolled_back_at}`);
          }
        });
      } else {
        console.log('\n📋 No migrations applied yet');
      }
    } else {
      console.log('⚠️  Migrations history table does not exist yet');
      console.log('   It will be created automatically when you run the first migration');
    }
    
    // 7. Check for migration scripts
    const migrationFiles = fs.readdirSync(scriptsDir)
      .filter(file => file.endsWith('.js') && !file.startsWith('_'));
    
    console.log(`\n📦 Migration Scripts: ${migrationFiles.length}`);
    if (migrationFiles.length > 0) {
      migrationFiles.forEach(file => console.log(`  - ${file}`));
    } else {
      console.log('  No migration scripts found yet');
      console.log('  Create your first migration by copying _TEMPLATE.js.example');
    }
    
    // 8. Check npm scripts
    const packageJsonPath = path.join(__dirname, '../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    console.log('\n📜 NPM Scripts:');
    if (packageJson.scripts.migrate) {
      console.log('  ✓ npm run migrate');
    } else {
      console.log('  ❌ npm run migrate (not found)');
    }
    
    if (packageJson.scripts['migrate:rollback']) {
      console.log('  ✓ npm run migrate:rollback');
    } else {
      console.log('  ❌ npm run migrate:rollback (not found)');
    }
    
    console.log('\n✅ Migration system is properly set up and ready to use!');
    console.log('\n📚 Next Steps:');
    console.log('  1. Read QUICK_START.md for a quick introduction');
    console.log('  2. Read MIGRATION_GUIDE.md for detailed documentation');
    console.log('  3. Copy _TEMPLATE.js.example to create your first migration');
    console.log('  4. Run "npm run migrate" to apply migrations');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error checking migration setup:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

checkMigrationSetup();
