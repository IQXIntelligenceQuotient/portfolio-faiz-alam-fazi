# Migration System - Quick Start

## What is this?

A database migration system for managing schema changes in a structured, version-controlled way.

## Quick Commands

```bash
# Run all pending migrations
npm run migrate

# Rollback the last migration
npm run migrate:rollback

# Run a specific migration
node migrations/migrate.js 001_migration_name

# Rollback a specific migration
node migrations/rollback.js 001_migration_name
```

## Creating Your First Migration

### 1. Copy the template

```bash
cd Backend/migrations/scripts
cp _TEMPLATE.js.example 001_my_first_migration.js
```

### 2. Edit the migration file

```javascript
async function up(pool) {
  console.log('  → Adding new column...');
  
  await pool.query(`
    ALTER TABLE my_table 
    ADD COLUMN new_column VARCHAR(255) DEFAULT 'default_value'
  `);
  
  console.log('  ✓ Column added');
}

async function down(pool) {
  console.log('  → Removing column...');
  
  await pool.query(`
    ALTER TABLE my_table 
    DROP COLUMN IF EXISTS new_column
  `);
  
  console.log('  ✓ Column removed');
}

module.exports = { up, down };
```

### 3. Run the migration

```bash
npm run migrate
```

### 4. Test rollback (optional)

```bash
npm run migrate:rollback
```

## File Structure

```
migrations/
├── README.md                    # Overview and documentation
├── QUICK_START.md              # This file
├── MIGRATION_GUIDE.md          # Detailed guide
├── config.js                   # Configuration
├── migrate.js                  # Migration runner
├── rollback.js                 # Rollback runner
└── scripts/                    # Migration scripts
    ├── _TEMPLATE.js.example    # Template for new migrations
    └── 001_example.js          # Your migration files
```

## Migration Naming

Use sequential numbers with descriptive names:

- `001_add_reviews_fields.js`
- `002_add_contacts_fields.js`
- `003_add_posts_publish_date.js`

## How It Works

1. **Migration History**: Tracks which migrations have been applied in the `migrations_history` table
2. **Sequential Execution**: Migrations run in order based on their filename prefix
3. **Idempotent**: Migrations should check if changes already exist before applying
4. **Reversible**: Each migration has an `up()` and `down()` function

## Best Practices

✅ **DO:**
- Check if changes already exist before applying
- Use default values for new columns
- Test on development database first
- Backup before production migrations
- Write clear rollback scripts

❌ **DON'T:**
- Modify existing migration files after they've been applied
- Skip writing rollback scripts
- Run migrations without testing first
- Forget to update existing rows after adding columns

## Common Patterns

### Adding a Column

```javascript
async function up(pool) {
  // Check if column exists
  const check = await pool.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'my_table' 
    AND column_name = 'new_column'
  `);

  if (check.rows.length > 0) {
    console.log('  ⚠️  Column already exists');
    return;
  }

  // Add column with default
  await pool.query(`
    ALTER TABLE my_table 
    ADD COLUMN new_column VARCHAR(255) DEFAULT 'default'
  `);
  
  // Update existing rows
  await pool.query(`
    UPDATE my_table 
    SET new_column = 'default' 
    WHERE new_column IS NULL
  `);
}
```

### Creating a Table

```javascript
async function up(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS new_table (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function down(pool) {
  await pool.query(`
    DROP TABLE IF EXISTS new_table
  `);
}
```

### Adding a Foreign Key

```javascript
async function up(pool) {
  await pool.query(`
    ALTER TABLE child_table 
    ADD COLUMN parent_id INTEGER REFERENCES parent_table(id)
  `);
}

async function down(pool) {
  await pool.query(`
    ALTER TABLE child_table 
    DROP COLUMN IF EXISTS parent_id
  `);
}
```

## Troubleshooting

### "Column already exists" error

The migration was partially applied. Either:
1. Manually remove the column and re-run
2. Or mark the migration as applied in `migrations_history`

### Check migration status

```sql
SELECT * FROM migrations_history 
ORDER BY applied_at DESC;
```

### Check table schema

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'your_table';
```

## Need More Help?

- See `MIGRATION_GUIDE.md` for detailed documentation
- See `README.md` for system overview
- Check the template file: `scripts/_TEMPLATE.js.example`
- Review existing migrations in `scripts/` directory

## Admin Panel Improvements Migrations

For this feature, you'll need to create migrations for:

1. **Reviews table** - Add communication fields
2. **Contacts table** - Add status fields
3. **Posts table** - Add publish_date field
4. **Tags table** - Add category_id field
5. **Category-tag relationship** - Create new table

See the requirements and design documents in `.kiro/specs/admin-panel-improvements/` for details.
