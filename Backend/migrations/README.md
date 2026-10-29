# Database Migrations

This directory contains database migration scripts for the admin panel improvements feature.

## Directory Structure

```
migrations/
├── README.md                    # This file
├── config.js                    # Migration configuration
├── migrate.js                   # Migration runner script
├── rollback.js                  # Rollback runner script
└── scripts/                     # Individual migration scripts
    ├── 001_add_reviews_fields.js
    ├── 002_add_contacts_fields.js
    ├── 003_add_posts_publish_date.js
    ├── 004_add_tags_category_id.js
    └── 005_create_category_tag_rel.js
```

## Running Migrations

### Apply all pending migrations
```bash
node Backend/migrations/migrate.js
```

### Apply a specific migration
```bash
node Backend/migrations/migrate.js 001
```

### Rollback the last migration
```bash
node Backend/migrations/rollback.js
```

### Rollback a specific migration
```bash
node Backend/migrations/rollback.js 001
```

## Migration Script Format

Each migration script should export two functions:
- `up()` - Applies the migration
- `down()` - Rolls back the migration

Example:
```javascript
async function up(pool) {
  await pool.query(`
    ALTER TABLE table_name 
    ADD COLUMN new_column VARCHAR(255)
  `);
}

async function down(pool) {
  await pool.query(`
    ALTER TABLE table_name 
    DROP COLUMN new_column
  `);
}

module.exports = { up, down };
```

## Migration Tracking

Migrations are tracked in the `migrations_history` table, which is automatically created on first run.

## Best Practices

1. **Always test migrations** on a development database first
2. **Write rollback scripts** for every migration
3. **Keep migrations small** and focused on a single change
4. **Never modify** existing migration scripts after they've been run in production
5. **Backup your database** before running migrations in production
6. **Check for existing columns** before adding them to avoid errors
7. **Use transactions** where possible to ensure atomicity

## Troubleshooting

### Migration fails with "column already exists"
This means the migration was partially applied. Check the database schema and either:
- Manually remove the added columns and re-run the migration
- Or skip to the next migration

### Rollback fails
Check the `migrations_history` table to see which migrations have been applied:
```sql
SELECT * FROM migrations_history ORDER BY applied_at DESC;
```

### Reset all migrations (DANGER - Development only!)
```sql
DROP TABLE IF EXISTS migrations_history;
-- Then manually revert all schema changes
```
