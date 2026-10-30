const fs = require('fs');
const path = require('path');
const {
  config,
  ensureHistoryTable,
  getAppliedMigrations,
  recordMigration,
} = require('./config');

/**
 * Migration Runner
 * 
 * Applies pending database migrations in order.
 * 
 * Usage:
 *   node Backend/migrations/migrate.js           # Run all pending migrations
 *   node Backend/migrations/migrate.js 001       # Run specific migration
 */

async function runMigrations(specificMigration = null) {
  const { pool, migrationsDir } = config;
  
  try {
    console.log('🚀 Starting migration process...\n');
    
    // Ensure history table exists
    await ensureHistoryTable();
    
    // Get list of applied migrations
    const appliedMigrations = await getAppliedMigrations();
    console.log(`Applied migrations: ${appliedMigrations.length}`);
    if (appliedMigrations.length > 0) {
      appliedMigrations.forEach(m => console.log(`  - ${m}`));
    }
    console.log('');
    
    // Get list of available migration files
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.js'))
      .sort();
    
    if (migrationFiles.length === 0) {
      console.log('⚠️  No migration files found in', migrationsDir);
      process.exit(0);
    }
    
    console.log(`Available migrations: ${migrationFiles.length}`);
    migrationFiles.forEach(f => console.log(`  - ${f}`));
    console.log('');
    
    // Filter to pending migrations
    let pendingMigrations = migrationFiles.filter(file => {
      const migrationName = file.replace('.js', '');
      return !appliedMigrations.includes(migrationName);
    });
    
    // If specific migration requested, filter to just that one
    if (specificMigration) {
      const specificFile = `${specificMigration}.js`;
      if (!migrationFiles.includes(specificFile)) {
        console.error(`❌ Migration file not found: ${specificFile}`);
        process.exit(1);
      }
      
      const migrationName = specificMigration;
      if (appliedMigrations.includes(migrationName)) {
        console.log(`⚠️  Migration ${migrationName} has already been applied`);
        process.exit(0);
      }
      
      pendingMigrations = [specificFile];
    }
    
    if (pendingMigrations.length === 0) {
      console.log('✓ No pending migrations. Database is up to date!');
      process.exit(0);
    }
    
    console.log(`Pending migrations: ${pendingMigrations.length}`);
    pendingMigrations.forEach(f => console.log(`  - ${f}`));
    console.log('');
    
    // Run each pending migration
    for (const file of pendingMigrations) {
      const migrationName = file.replace('.js', '');
      const migrationPath = path.join(migrationsDir, file);
      
      console.log(`\n📦 Running migration: ${migrationName}`);
      console.log(`   File: ${file}`);
      
      try {
        // Load the migration module
        const migration = require(migrationPath);
        
        if (typeof migration.up !== 'function') {
          throw new Error(`Migration ${migrationName} does not export an 'up' function`);
        }
        
        // Run the migration
        await migration.up(pool);
        
        // Record the migration
        await recordMigration(migrationName);
        
        console.log(`✓ Migration ${migrationName} completed successfully`);
      } catch (error) {
        console.error(`\n❌ Migration ${migrationName} failed:`, error.message);
        console.error('Stack trace:', error.stack);
        console.error('\nMigration process stopped. Fix the error and try again.');
        process.exit(1);
      }
    }
    
    console.log('\n✅ All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration process failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Get specific migration from command line argument
const specificMigration = process.argv[2];

// Run migrations
runMigrations(specificMigration);
