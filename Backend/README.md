# Backend

Express API with PostgreSQL, JWT authentication, Cloudinary uploads and SMTP email.

## Configuration

Copy `.env.example` to a private `.env` for local development. In Hostinger, set variables in the application environment settings. Supply your own database, JWT, administrator, Cloudinary and SMTP values. No production credentials or default administrator password are stored in source.

## Commands

    npm ci
    npm run build
    npm start

For local development use `npm run dev`. The build script checks server syntax; this API does not require compilation. `npm test -- --testPathIgnorePatterns=migrations` runs controller tests with mocks. Migration tests require an isolated test database; never run them against production.

## Database maintenance

Back up the database before migration or rollback. From `Backend`, use `npm run migrate` to apply pending migrations, `npm run migrate:rollback` to roll back, and `npm run seed:admin` to provision an administrator using private environment variables. Category and tag seed utilities also require ADMIN_EMAIL and ADMIN_PASSWORD and must only be run deliberately by an administrator.

Hostinger settings: application root `Backend`, entry `src/server.js`, start `npm start`, build `npm run build`. Preserve the managed PORT and all existing server variables. Set FRONTEND_URL to the allowed frontend origin. The public API health endpoint is `/api/health`.

Uploaded files are runtime data and are excluded from Git. Preserve existing uploads on the hosting service independently of source deployment.
