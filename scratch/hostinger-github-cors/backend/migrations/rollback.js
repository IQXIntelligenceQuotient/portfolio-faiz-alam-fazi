const fs = require('fs');
const path = require('path');
const {
  config,
  ensureHistoryTable,
  getLastMigration,
  recordRollback,
} = require('./config');

/**
 * Migration Rollback Runner
 * 
 * Rolls back the last applied migration or a specific migration.
 * 
 * Usage:
 *   node Backend/migrations/rollback.js           # Rollback last migration
 *   node Backend/migrations/rollback.js 001       # Rollback specific migration
 */

async function rollbackMigration(specificMigration = null) {
  const { pool, migrationsDir } = config;
  
  try {
    console.log('🔄 Starting rollback process...\n');
    
    // Ensure history table exists
    await ensureHistoryTable();
    
    // Determine which migration to rollback
    let migrationToRollback;
    
    if (specificMigration) {
      migrationToRollback = specificMigration;
      console.log(`Target migration: ${migrationToRollback}`);
    } else {
      migrationToRollback = await getLastMigration();
      
      if (!migrationToRollback) {
        console.log('⚠️  No migrations to rollback');
        process.exit(0);
      }
      
      console.log(`Last applied migration: ${migrationToRollback}`);
    }
    
    // Check if migration file exists
    const migrationFile = `${migrationToRollback}.js`;
    const migrationPath = path.join(migrationsDir, migrationFile);
    
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationFile}`);
      process.exit(1);
    }
    
    console.log(`\n📦 Rolling back migration: ${migrationToRollback}`);
    console.log(`   File: ${migrationFile}`);
    
    try {
      // Load the migration module
      const migration = require(migrationPath);
      
      if (typeof migration.down !== 'function') {
        throw new Error(`Migration ${migrationToRollback} does not export a 'down' function`);
      }
      
      // Run the rollback
      await migration.down(pool);
      
      // Record the rollback
      await recordRollback(migrationToRollback);
      
      console.log(`✓ Migration ${migrationToRollback} rolled back successfully`);
    } catch (error) {
      console.error(`\n❌ Rollback of ${migrationToRollback} failed:`, error.message);
      console.error('Stack trace:', error.stack);
      console.error('\nRollback process stopped. Fix the error and try again.');
      process.exit(1);
    }
    
    console.log('\n✅ Rollback completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Rollback process failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    // Close the database connection
    await pool.end();
  }
}

// Get specific migration from command line argument
const specificMigration = process.argv[2];

// Run rollback
rollbackMigration(specificMigration);
