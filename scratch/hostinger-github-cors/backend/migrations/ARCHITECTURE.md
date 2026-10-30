# Migration System Architecture

## Overview

This document describes the architecture of the database migration system for the admin panel improvements feature.

## System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     Migration System Architecture                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
├─────────────────────────────────────────────────────────────────┤
│  npm run migrate              npm run migrate:rollback          │
│  node migrations/migrate.js   node migrations/rollback.js       │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Migration Runners                           │
├─────────────────────────────────────────────────────────────────┤
│  migrate.js                   rollback.js                       │
│  - Load pending migrations    - Load last migration             │
│  - Execute in order           - Execute rollback                │
│  - Record in history          - Update history                  │
│  - Handle errors              - Handle errors                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Configuration Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  config.js                                                       │
│  - Database connection                                           │
│  - Migration tracking functions                                  │
│  - History table management                                      │
│  - Utility functions                                             │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Migration Scripts                             │
├─────────────────────────────────────────────────────────────────┤
│  scripts/001_migration.js     scripts/002_migration.js          │
│  - up(pool)                   - up(pool)                        │
│  - down(pool)                 - down(pool)                      │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Neon)                                               │
│  - migrations_history table                                      │
│  - Application tables (reviews, contacts, posts, tags)          │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Migration Execution Flow

```
┌──────────────┐
│ User runs    │
│ npm run      │
│ migrate      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ migrate.js                                                    │
│ 1. Load configuration                                         │
│ 2. Connect to database                                        │
│ 3. Ensure migrations_history table exists                    │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ Get Applied Migrations                                        │
│ SELECT migration_name FROM migrations_history                │
│ WHERE rolled_back_at IS NULL                                 │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ Get Available Migration Files                                │
│ fs.readdirSync('migrations/scripts')                         │
│ Filter: *.js files, sorted alphabetically                    │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ Calculate Pending Migrations                                 │
│ pending = available - applied                                │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ For Each Pending Migration                                   │
│ 1. Load migration module                                     │
│ 2. Execute up(pool) function                                 │
│ 3. Record in migrations_history                              │
│ 4. Continue to next or stop on error                         │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│ Success!     │
│ All          │
│ migrations   │
│ applied      │
└──────────────┘
```

### Rollback Execution Flow

```
┌──────────────┐
│ User runs    │
│ npm run      │
│ migrate:     │
│ rollback     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ rollback.js                                                   │
│ 1. Load configuration                                         │
│ 2. Connect to database                                        │
│ 3. Ensure migrations_history table exists                    │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ Get Last Applied Migration                                   │
│ SELECT migration_name FROM migrations_history                │
│ WHERE rolled_back_at IS NULL                                 │
│ ORDER BY applied_at DESC LIMIT 1                             │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ Load Migration File                                          │
│ require('migrations/scripts/XXX_migration.js')               │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ Execute Rollback                                             │
│ 1. Execute down(pool) function                               │
│ 2. Update migrations_history (set rolled_back_at)           │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│ Success!     │
│ Migration    │
│ rolled back  │
└──────────────┘
```

## Database Schema

### migrations_history Table

```sql
CREATE TABLE migrations_history (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  rolled_back_at TIMESTAMP NULL
);
```

**Fields:**
- `id` - Auto-incrementing primary key
- `migration_name` - Unique name of the migration (e.g., "001_add_reviews_fields")
- `applied_at` - Timestamp when migration was applied
- `rolled_back_at` - Timestamp when migration was rolled back (NULL if not rolled back)

**Indexes:**
- Primary key on `id`
- Unique constraint on `migration_name`

**Queries:**
- Get applied migrations: `WHERE rolled_back_at IS NULL`
- Get last migration: `WHERE rolled_back_at IS NULL ORDER BY applied_at DESC LIMIT 1`
- Get all history: `ORDER BY applied_at DESC`

## Migration Script Structure

### File Naming Convention

```
001_add_reviews_fields.js
│││ └─────────────────────── Descriptive name (snake_case)
││└─────────────────────────── Separator
│└──────────────────────────── Sequential number (3 digits)
└───────────────────────────── Migration prefix
```

### Script Format

```javascript
/**
 * Migration: Add reviews fields
 * 
 * Adds communication tracking fields to the reviews table.
 */

/**
 * Apply the migration
 * @param {Pool} pool - PostgreSQL connection pool
 */
async function up(pool) {
  try {
    console.log('  → Applying migration...');
    
    // 1. Check if changes already exist (idempotent)
    const check = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'reviews' 
      AND column_name = 'communication_status'
    `);

    if (check.rows.length > 0) {
      console.log('  ⚠️  Changes already exist, skipping');
      return;
    }

    // 2. Apply changes
    await pool.query(`
      ALTER TABLE reviews 
      ADD COLUMN communication_status VARCHAR(50) DEFAULT 'email_pending'
    `);
    
    // 3. Update existing rows
    await pool.query(`
      UPDATE reviews 
      SET communication_status = 'email_pending' 
      WHERE communication_status IS NULL
    `);
    
    console.log('  ✓ Migration applied');
  } catch (error) {
    console.error('  ✗ Migration failed:', error.message);
    throw error;
  }
}

/**
 * Rollback the migration
 * @param {Pool} pool - PostgreSQL connection pool
 */
async function down(pool) {
  try {
    console.log('  → Rolling back migration...');
    
    await pool.query(`
      ALTER TABLE reviews 
      DROP COLUMN IF EXISTS communication_status
    `);
    
    console.log('  ✓ Migration rolled back');
  } catch (error) {
    console.error('  ✗ Rollback failed:', error.message);
    throw error;
  }
}

module.exports = { up, down };
```

## Error Handling

### Migration Errors

```
┌──────────────────────────────────────────────────────────────┐
│ Error During Migration                                       │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 1. Log error message and stack trace                        │
│ 2. Stop migration process                                    │
│ 3. Do NOT record migration in history                        │
│ 4. Exit with error code 1                                    │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ User Actions:                                                │
│ 1. Review error message                                      │
│ 2. Check database state                                      │
│ 3. Fix the issue                                             │
│ 4. Re-run migration                                          │
└──────────────────────────────────────────────────────────────┘
```

### Rollback Errors

```
┌──────────────────────────────────────────────────────────────┐
│ Error During Rollback                                        │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ 1. Log error message and stack trace                        │
│ 2. Stop rollback process                                     │
│ 3. Do NOT update migration history                          │
│ 4. Exit with error code 1                                    │
└──────┬───────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│ User Actions:                                                │
│ 1. Review error message                                      │
│ 2. Check database state                                      │
│ 3. Manually revert changes if needed                         │
│ 4. Update migration history if needed                        │
└──────────────────────────────────────────────────────────────┘
```

## Configuration

### Database Connection

The migration system uses the existing database connection from `src/config/db.js`:

```javascript
const pool = require('../src/config/db');
```

This ensures:
- Consistent database configuration
- Automatic environment detection (Neon vs Local)
- SSL configuration handled automatically
- Connection pooling

### Environment Variables

Required environment variables (from `.env`):

```bash
# For Neon PostgreSQL (cloud)
DATABASE_URL=postgresql://user:password@host/database

# OR for Local PostgreSQL
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=database_name
```

## Best Practices

### 1. Idempotent Migrations

Always check if changes already exist:

```javascript
// Check before adding column
const check = await pool.query(`
  SELECT column_name 
  FROM information_schema.columns 
  WHERE table_name = 'my_table' 
  AND column_name = 'new_column'
`);

if (check.rows.length > 0) {
  console.log('  ⚠️  Column already exists, skipping');
  return;
}
```

### 2. Default Values

Provide default values for new columns:

```javascript
ALTER TABLE my_table 
ADD COLUMN new_column VARCHAR(255) DEFAULT 'default_value'
```

### 3. Update Existing Rows

Explicitly update existing rows after adding columns:

```javascript
UPDATE my_table 
SET new_column = 'default_value' 
WHERE new_column IS NULL
```

### 4. Reversible Migrations

Always write rollback scripts:

```javascript
// up() adds column
async function up(pool) {
  await pool.query(`ALTER TABLE my_table ADD COLUMN new_column VARCHAR(255)`);
}

// down() removes column
async function down(pool) {
  await pool.query(`ALTER TABLE my_table DROP COLUMN IF EXISTS new_column`);
}
```

### 5. Transaction Safety

For complex migrations, consider using transactions:

```javascript
async function up(pool) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Multiple operations
    await client.query(`ALTER TABLE table1 ADD COLUMN col1 VARCHAR(255)`);
    await client.query(`ALTER TABLE table2 ADD COLUMN col2 VARCHAR(255)`);
    
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

## Testing Strategy

### 1. Development Testing

```bash
# 1. Backup database
pg_dump -U user -d database > backup.sql

# 2. Run migration
npm run migrate

# 3. Verify changes
node scripts/checkReviews.js

# 4. Test application
npm run dev

# 5. Test rollback
npm run migrate:rollback

# 6. Verify rollback
node scripts/checkReviews.js

# 7. Re-apply migration
npm run migrate
```

### 2. Production Testing

```bash
# 1. Test on staging environment
# 2. Backup production database
# 3. Schedule maintenance window
# 4. Run migrations
# 5. Verify application works
# 6. Monitor for issues
```

## Monitoring

### Check Migration Status

```bash
# Run migrate to see status
npm run migrate

# Or check database directly
psql -U user -d database -c "SELECT * FROM migrations_history ORDER BY applied_at DESC"
```

### Check Database Schema

```bash
# Check table structure
psql -U user -d database -c "\d+ table_name"

# Check all columns
psql -U user -d database -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'table_name'"
```

## Troubleshooting

See `MIGRATION_GUIDE.md` for detailed troubleshooting scenarios.

## Future Enhancements

Potential improvements for the migration system:

1. **Migration Validation**
   - Syntax checking before execution
   - Dry-run mode
   - Schema validation

2. **Migration Dependencies**
   - Explicit dependency declarations
   - Parallel execution where possible

3. **Migration Rollback Limits**
   - Prevent rollback of old migrations
   - Rollback to specific version

4. **Migration Testing**
   - Automated testing framework
   - Test data generation
   - Rollback testing

5. **Migration Reporting**
   - Detailed execution logs
   - Performance metrics
   - Change summaries

## Conclusion

The migration system provides a robust, version-controlled way to manage database schema changes. It follows industry best practices and is designed to be safe, reliable, and easy to use.
