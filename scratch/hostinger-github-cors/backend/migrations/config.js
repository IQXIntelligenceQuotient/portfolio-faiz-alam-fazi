require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const pool = require('../src/config/db');

/**
 * Migration Configuration
 * 
 * This file provides configuration and utilities for database migrations.
 */

const config = {
  // Migration scripts directory
  migrationsDir: require('path').join(__dirname, 'scripts'),
  
  // Migration history table name
  historyTable: 'migrations_history',
  
  // Database pool
  pool: pool,
};

/**
 * Ensure the migrations history table exists
 */
async function ensureHistoryTable() {
  const { pool, historyTable } = config;
  
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${historyTable} (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        rolled_back_at TIMESTAMP NULL
      )
    `);
    
    console.log(`✓ Migrations history table '${historyTable}' ready`);
  } catch (error) {
    console.error(`Error creating history table:`, error.message);
    throw error;
  }
}

/**
 * Get list of applied migrations
 */
async function getAppliedMigrations() {
  const { pool, historyTable } = config;
  
  try {
    const result = await pool.query(`
      SELECT migration_name 
      FROM ${historyTable} 
      WHERE rolled_back_at IS NULL
      ORDER BY migration_name
    `);
    
    return result.rows.map(row => row.migration_name);
  } catch (error) {
    console.error('Error fetching applied migrations:', error.message);
    throw error;
  }
}

/**
 * Record a migration as applied
 */
async function recordMigration(migrationName) {
  const { pool, historyTable } = config;
  
  try {
    await pool.query(`
      INSERT INTO ${historyTable} (migration_name, applied_at)
      VALUES ($1, CURRENT_TIMESTAMP)
      ON CONFLICT (migration_name) 
      DO UPDATE SET rolled_back_at = NULL, applied_at = CURRENT_TIMESTAMP
    `, [migrationName]);
    
    console.log(`✓ Recorded migration: ${migrationName}`);
  } catch (error) {
    console.error(`Error recording migration ${migrationName}:`, error.message);
    throw error;
  }
}

/**
 * Record a migration as rolled back
 */
async function recordRollback(migrationName) {
  const { pool, historyTable } = config;
  
  try {
    await pool.query(`
      UPDATE ${historyTable} 
      SET rolled_back_at = CURRENT_TIMESTAMP
      WHERE migration_name = $1
    `, [migrationName]);
    
    console.log(`✓ Recorded rollback: ${migrationName}`);
  } catch (error) {
    console.error(`Error recording rollback ${migrationName}:`, error.message);
    throw error;
  }
}

/**
 * Get the last applied migration
 */
async function getLastMigration() {
  const { pool, historyTable } = config;
  
  try {
    const result = await pool.query(`
      SELECT migration_name 
      FROM ${historyTable} 
      WHERE rolled_back_at IS NULL
      ORDER BY applied_at DESC
      LIMIT 1
    `);
    
    return result.rows.length > 0 ? result.rows[0].migration_name : null;
  } catch (error) {
    console.error('Error fetching last migration:', error.message);
    throw error;
  }
}

module.exports = {
  config,
  ensureHistoryTable,
  getAppliedMigrations,
  recordMigration,
  recordRollback,
  getLastMigration,
};
