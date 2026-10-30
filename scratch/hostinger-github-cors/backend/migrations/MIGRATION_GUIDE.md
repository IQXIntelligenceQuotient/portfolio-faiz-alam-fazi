# Database Migration Guide

## Overview

This guide explains how to use the database migration system for the admin panel improvements feature. The migration system provides a structured way to apply and rollback database schema changes.

## Quick Start

### Running Migrations

```bash
# From the Backend directory
npm run migrate

# Or directly
node migrations/migrate.js
```

### Rolling Back Migrations

```bash
# Rollback the last migration
npm run migrate:rollback

# Or directly
node migrations/rollback.js
```

## Migration System Architecture

### Components

1. **config.js** - Configuration and utility functions
   - Database connection management
   - Migration history tracking
   - Helper functions for recording migrations

2. **migrate.js** - Migration runner
   - Applies pending migrations in order
   - Tracks applied migrations
   - Handles errors gracefully

3. **rollback.js** - Rollback runner
   - Rolls back the last applied migration
   - Can target specific migrations
   - Updates migration history

4. **scripts/** - Migration scripts directory
   - Contains individual migration files
   - Each file exports `up()` and `down()` functions
   - Named with sequential prefixes (001_, 002_, etc.)

### Migration History Table

The system automatically creates a `migrations_history` table to track applied migrations:

```sql
CREATE TABLE migrations_history (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rolled_back_at TIMESTAMP NULL
);
```

## Creating a New Migration

### Step 1: Copy the Template

```bash
cd Backend/migrations/scripts
cp TEMPLATE.js 001_my_migration.js
```

### Step 2: Edit the Migration

```javascript
async function up(pool) {
  try {
    console.log('  → Adding new column...');
    
    // Check if column already exists (idempotent)
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'my_table' 
      AND column_name = 'new_column'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('  ⚠️  Column already exists, skipping');
      return;
    }

    // Add the column
    await pool.query(`
      ALTER TABLE my_table 
      ADD COLUMN new_column VARCHAR(255) DEFAULT 'default_value'
    `);
    
    console.log('  ✓ Column added successfully');
  } catch (error) {
    console.error('  ✗ Migration failed:', error.message);
    throw error;
  }
}

async function down(pool) {
  try {
    console.log('  → Removing column...');
    
    await pool.query(`
      ALTER TABLE my_table 
      DROP COLUMN IF EXISTS new_column
    `);
    
    console.log('  ✓ Column removed successfully');
  } catch (error) {
    console.error('  ✗ Rollback failed:', error.message);
    throw error;
  }
}

module.exports = { up, down };
```

### Step 3: Test the Migration

```bash
# Apply the migration
npm run migrate

# Verify the changes in the database
node scripts/checkReviews.js  # or appropriate check script

# Test rollback
npm run migrate:rollback

# Verify rollback worked
node scripts/checkReviews.js

# Re-apply for production
npm run migrate
```

## Migration Naming Convention

Migrations should be named with a sequential number prefix followed by a descriptive name:

- `001_add_reviews_fields.js` - First migration
- `002_add_contacts_fields.js` - Second migration
- `003_add_posts_publish_date.js` - Third migration
- etc.

The number prefix ensures migrations run in the correct order.

## Best Practices

### 1. Make Migrations Idempotent

Always check if changes already exist before applying them:

```javascript
// Good - checks before adding
const checkColumn = await pool.query(`
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'my_table' 
  AND column_name = 'new_column'
`);

if (checkColumn.rows.length > 0) {
  console.log('  ⚠️  Column already exists, skipping');
  return;
}

// Bad - will fail if column exists
await pool.query(`
  ALTER TABLE my_table 
  ADD COLUMN new_column VARCHAR(255)
`);
```

### 2. Use Default Values for New Columns

When adding columns to existing tables, provide default values:

```javascript
// Good - provides default
ALTER TABLE reviews 
ADD COLUMN communication_status VARCHAR(50) DEFAULT 'email_pending'

// Bad - existing rows will have NULL
ALTER TABLE reviews 
ADD COLUMN communication_status VARCHAR(50)
```

### 3. Update Existing Rows After Adding Columns

```javascript
// Add column with default
await pool.query(`
  ALTER TABLE reviews 
  ADD COLUMN communication_status VARCHAR(50) DEFAULT 'email_pending'
`);

// Update existing rows explicitly
await pool.query(`
  UPDATE reviews 
  SET communication_status = 'email_pending' 
  WHERE communication_status IS NULL
`);
```

### 4. Always Write Rollback Scripts

Every migration should have a corresponding rollback:

```javascript
// up() adds a column
async function up(pool) {
  await pool.query(`ALTER TABLE my_table ADD COLUMN new_column VARCHAR(255)`);
}

// down() removes the column
async function down(pool) {
  await pool.query(`ALTER TABLE my_table DROP COLUMN IF EXISTS new_column`);
}
```

### 5. Test on Development First

Always test migrations on a development database before production:

1. Backup your development database
2. Run the migration
3. Verify the changes
4. Test the application
5. Test rollback
6. Re-apply migration

### 6. Backup Before Production Migrations

```bash
# Backup the database
pg_dump -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
npm run migrate

# If something goes wrong, restore from backup
psql -U username -d database_name < backup_20240101_120000.sql
```

## Troubleshooting

### Migration Fails with "column already exists"

This usually means the migration was partially applied. Options:

1. **Check the database schema:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'your_table';
   ```

2. **Manually remove the column and re-run:**
   ```sql
   ALTER TABLE your_table DROP COLUMN column_name;
   ```
   Then run `npm run migrate` again.

3. **Or mark the migration as applied:**
   ```sql
   INSERT INTO migrations_history (migration_name, applied_at)
   VALUES ('001_migration_name', CURRENT_TIMESTAMP);
   ```

### Rollback Fails

Check which migrations are applied:

```sql
SELECT * FROM migrations_history 
WHERE rolled_back_at IS NULL
ORDER BY applied_at DESC;
```

If a rollback fails, you may need to manually revert the changes and update the history table:

```sql
-- Manually revert changes
ALTER TABLE your_table DROP COLUMN column_name;

-- Mark as rolled back
UPDATE migrations_history 
SET rolled_back_at = CURRENT_TIMESTAMP
WHERE migration_name = '001_migration_name';
```

### Migration History Out of Sync

If the migration history table doesn't match the actual database schema:

1. **Check current schema:**
   ```sql
   \d+ table_name  -- in psql
   ```

2. **Check migration history:**
   ```sql
   SELECT * FROM migrations_history ORDER BY applied_at;
   ```

3. **Manually sync if needed:**
   ```sql
   -- If migration was applied but not recorded
   INSERT INTO migrations_history (migration_name, applied_at)
   VALUES ('001_migration_name', CURRENT_TIMESTAMP);
   
   -- If migration was recorded but not applied
   UPDATE migrations_history 
   SET rolled_back_at = CURRENT_TIMESTAMP
   WHERE migration_name = '001_migration_name';
   ```

## Advanced Usage

### Running a Specific Migration

```bash
# Apply a specific migration
node migrations/migrate.js 001_add_reviews_fields

# Rollback a specific migration
node migrations/rollback.js 001_add_reviews_fields
```

### Checking Migration Status

```bash
# Connect to database
psql -U username -d database_name

# Check applied migrations
SELECT migration_name, applied_at, rolled_back_at 
FROM migrations_history 
ORDER BY applied_at DESC;

# Check pending migrations
# Compare files in migrations/scripts/ with migrations_history table
```

### Resetting All Migrations (Development Only!)

**WARNING: This will delete all migration history. Only use in development!**

```sql
-- Drop the history table
DROP TABLE IF EXISTS migrations_history;

-- Manually revert all schema changes
-- (You'll need to do this for each migration)
ALTER TABLE reviews DROP COLUMN IF EXISTS communication_status;
ALTER TABLE reviews DROP COLUMN IF EXISTS last_message_type;
-- etc.
```

Then re-run all migrations:

```bash
npm run migrate
```

## Migration Checklist

Before running migrations in production:

- [ ] Migrations tested on development database
- [ ] Rollback tested on development database
- [ ] Application tested with new schema
- [ ] Database backed up
- [ ] Migrations reviewed by team
- [ ] Downtime window scheduled (if needed)
- [ ] Rollback plan documented
- [ ] Monitoring in place to detect issues

## Support

For issues or questions about migrations:

1. Check this guide
2. Review the migration scripts in `migrations/scripts/`
3. Check the migration history table
4. Review error logs
5. Consult the requirements and design documents in `.kiro/specs/admin-panel-improvements/`
