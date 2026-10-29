# Task 2 Checklist: Create Database Migration Scripts

## Overview

This checklist guides you through creating the database migration scripts for the admin panel improvements feature (Task 2).

## Prerequisites

✅ Task 1 completed - Migration infrastructure is set up  
✅ Requirements document reviewed (`.kiro/specs/admin-panel-improvements/requirements.md`)  
✅ Design document reviewed (`.kiro/specs/admin-panel-improvements/design.md`)  
✅ Migration system tested (`node scripts/checkMigrationSetup.js`)  

## Migration Scripts to Create

### 1. Migration 001: Add Reviews Fields

**File:** `migrations/scripts/001_add_reviews_fields.js`

**Fields to Add:**
- `approval_status` VARCHAR(50) DEFAULT 'pending'
- `communication_status` VARCHAR(50) DEFAULT 'email_pending'
- `last_message_type` VARCHAR(50) NULL
- `last_message_date` TIMESTAMP NULL

**Requirements:** 8.1, 1.1, 1.3

**Checklist:**
- [ ] Copy template: `cp _TEMPLATE.js.example 001_add_reviews_fields.js`
- [ ] Implement up() function
  - [ ] Check if columns already exist (idempotent)
  - [ ] Add approval_status column
  - [ ] Add communication_status column
  - [ ] Add last_message_type column
  - [ ] Add last_message_date column
  - [ ] Update existing rows with default values
- [ ] Implement down() function
  - [ ] Drop all added columns
- [ ] Test migration: `npm run migrate`
- [ ] Verify changes: `node scripts/checkReviews.js`
- [ ] Test rollback: `npm run migrate:rollback`
- [ ] Verify rollback: `node scripts/checkReviews.js`
- [ ] Re-apply: `npm run migrate`

### 2. Migration 002: Add Contacts Fields

**File:** `migrations/scripts/002_add_contacts_fields.js`

**Fields to Add:**
- `email_status` VARCHAR(50) DEFAULT 'not_sent' (may already exist)
- `email_sent_date` TIMESTAMP NULL
- `last_error_message` TEXT NULL

**Requirements:** 8.2, 2.1, 2.2

**Checklist:**
- [ ] Copy template: `cp _TEMPLATE.js.example 002_add_contacts_fields.js`
- [ ] Implement up() function
  - [ ] Check if email_status exists (may already be added)
  - [ ] Add email_sent_date column
  - [ ] Add last_error_message column
  - [ ] Update existing rows with default values
- [ ] Implement down() function
  - [ ] Drop added columns (keep email_status if it existed before)
- [ ] Test migration: `npm run migrate`
- [ ] Verify changes: `node scripts/checkContacts.js`
- [ ] Test rollback: `npm run migrate:rollback`
- [ ] Verify rollback: `node scripts/checkContacts.js`
- [ ] Re-apply: `npm run migrate`

### 3. Migration 003: Add Posts Publish Date

**File:** `migrations/scripts/003_add_posts_publish_date.js`

**Fields to Add:**
- `publish_date` TIMESTAMP NULL (nullable for drafts)

**Requirements:** 8.3, 3.1, 3.3

**Checklist:**
- [ ] Copy template: `cp _TEMPLATE.js.example 003_add_posts_publish_date.js`
- [ ] Implement up() function
  - [ ] Check if publish_date column exists
  - [ ] Add publish_date column (nullable)
  - [ ] Do NOT set default values (should be NULL for drafts)
- [ ] Implement down() function
  - [ ] Drop publish_date column
- [ ] Test migration: `npm run migrate`
- [ ] Verify changes: Check posts table structure
- [ ] Test rollback: `npm run migrate:rollback`
- [ ] Verify rollback: Check posts table structure
- [ ] Re-apply: `npm run migrate`

### 4. Migration 004: Add Tags Category ID

**File:** `migrations/scripts/004_add_tags_category_id.js`

**Fields to Add:**
- `category_id` INTEGER NULL REFERENCES categories(id)

**Requirements:** 8.5, 6.1

**Checklist:**
- [ ] Copy template: `cp _TEMPLATE.js.example 004_add_tags_category_id.js`
- [ ] Implement up() function
  - [ ] Check if category_id column exists
  - [ ] Add category_id column as foreign key
  - [ ] Do NOT set default values (tags may not have categories)
- [ ] Implement down() function
  - [ ] Drop foreign key constraint
  - [ ] Drop category_id column
- [ ] Test migration: `npm run migrate`
- [ ] Verify changes: Check tags table structure
- [ ] Test rollback: `npm run migrate:rollback`
- [ ] Verify rollback: Check tags table structure
- [ ] Re-apply: `npm run migrate`

### 5. Migration 005: Create Category-Tag Relationship Table

**File:** `migrations/scripts/005_create_category_tag_rel.js`

**Table to Create:** `category_tag_rel`

**Fields:**
- `category_id` INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE
- `tag_id` INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE
- `priority` INTEGER DEFAULT 0
- `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- PRIMARY KEY (category_id, tag_id)

**Requirements:** 8.5, 6.3

**Checklist:**
- [ ] Copy template: `cp _TEMPLATE.js.example 005_create_category_tag_rel.js`
- [ ] Implement up() function
  - [ ] Check if table already exists
  - [ ] Create category_tag_rel table
  - [ ] Add composite primary key
  - [ ] Add foreign key constraints
  - [ ] Add indexes for performance
- [ ] Implement down() function
  - [ ] Drop category_tag_rel table
- [ ] Test migration: `npm run migrate`
- [ ] Verify changes: Check table structure
- [ ] Test rollback: `npm run migrate:rollback`
- [ ] Verify rollback: Check table is dropped
- [ ] Re-apply: `npm run migrate`

### 6. Migration Tests

**File:** `migrations/scripts/006_test_migrations.js` (optional)

**Tests to Write:**
- [ ] Test migration execution
- [ ] Test rollback functionality
- [ ] Test data preservation
- [ ] Test idempotency (running migrations twice)

**Requirements:** 9.1, 9.2, 9.3, 9.4, 9.5

## Testing Checklist

### Unit Testing

- [ ] Test each migration individually
- [ ] Test rollback for each migration
- [ ] Test idempotency (run twice, should not error)
- [ ] Test with existing data
- [ ] Test with empty tables

### Integration Testing

- [ ] Run all migrations in sequence
- [ ] Verify all tables have correct structure
- [ ] Verify foreign key constraints work
- [ ] Verify default values are set correctly
- [ ] Test rollback of all migrations in reverse order

### Data Preservation Testing

- [ ] Create test data before migrations
- [ ] Run migrations
- [ ] Verify test data is preserved
- [ ] Verify new fields have correct default values
- [ ] Rollback migrations
- [ ] Verify test data is still intact

## Verification Commands

```bash
# Check migration setup
node scripts/checkMigrationSetup.js

# Run all migrations
npm run migrate

# Check reviews table
node scripts/checkReviews.js

# Check contacts table
node scripts/checkContacts.js

# Check database schema
psql -U user -d database -c "\d+ reviews"
psql -U user -d database -c "\d+ contact_inquiries"
psql -U user -d database -c "\d+ posts"
psql -U user -d database -c "\d+ tags"
psql -U user -d database -c "\d+ category_tag_rel"

# Check migration history
psql -U user -d database -c "SELECT * FROM migrations_history ORDER BY applied_at DESC"

# Rollback last migration
npm run migrate:rollback

# Rollback specific migration
node migrations/rollback.js 001_add_reviews_fields
```

## Common Issues and Solutions

### Issue: "Column already exists"

**Solution:**
1. Check if the column was added by a previous script (e.g., `addEmailStatusColumn.js`)
2. Update migration to check for existing column first
3. Or manually remove the column and re-run migration

### Issue: "Foreign key constraint fails"

**Solution:**
1. Ensure referenced table exists
2. Ensure referenced column exists
3. Check data types match
4. Verify ON DELETE/ON UPDATE clauses

### Issue: "Migration fails but is recorded in history"

**Solution:**
1. Manually revert the changes
2. Update migrations_history to mark as rolled back:
   ```sql
   UPDATE migrations_history 
   SET rolled_back_at = CURRENT_TIMESTAMP
   WHERE migration_name = 'migration_name';
   ```

## Documentation

After completing all migrations:

- [ ] Update SETUP_SUMMARY.md with migration details
- [ ] Document any issues encountered
- [ ] Document any deviations from the plan
- [ ] Update README.md if needed

## Next Steps

After Task 2 is complete:

- [ ] Proceed to Task 3: Update backend services
- [ ] Implement ReviewService with communication methods
- [ ] Implement ContactService with status management
- [ ] Implement PostService for publish date and author handling
- [ ] Implement TagService with category-based functionality

## Resources

- **Requirements:** `.kiro/specs/admin-panel-improvements/requirements.md`
- **Design:** `.kiro/specs/admin-panel-improvements/design.md`
- **Tasks:** `.kiro/specs/admin-panel-improvements/tasks.md`
- **Quick Start:** `Backend/migrations/QUICK_START.md`
- **Migration Guide:** `Backend/migrations/MIGRATION_GUIDE.md`
- **Architecture:** `Backend/migrations/ARCHITECTURE.md`
- **Template:** `Backend/migrations/scripts/_TEMPLATE.js.example`

## Success Criteria

✅ All 5 migration scripts created  
✅ All migrations tested individually  
✅ All migrations tested in sequence  
✅ All rollbacks tested  
✅ Data preservation verified  
✅ Database schema matches design document  
✅ All requirements (8.1, 8.2, 8.3, 8.4, 8.5) satisfied  
✅ Documentation updated  

## Notes

- Always backup the database before running migrations in production
- Test migrations on a development database first
- Keep migrations small and focused on a single change
- Write clear commit messages for each migration
- Document any assumptions or decisions made

## Questions?

If you have questions about:
- **Migration system:** See `MIGRATION_GUIDE.md`
- **Requirements:** See `.kiro/specs/admin-panel-improvements/requirements.md`
- **Design:** See `.kiro/specs/admin-panel-improvements/design.md`
- **Database schema:** See `ARCHITECTURE.md`
