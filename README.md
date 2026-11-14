# Faiz Alam Faizi website

Source code lives on `main` in `Frontend/` (Vite/React with build-time HTML rendering) and `Backend/` (Express/PostgreSQL API).

## Hosting

- Frontend: GitHub Actions builds and verifies `Frontend/dist`, then publishes only generated static files to the `frontend` branch. Connect that branch to Hostinger's static Git integration with destination `public_html`.
- Backend: separate Hostinger Node.js app, source branch `main`, application root `Backend`, entry `src/server.js`.
- GitHub Pages is not used by the current workflow.

See [the deployment checklist](DEPLOYMENT_CHECKLIST.md) for hPanel configuration and validation steps.

## Frontend development

Use Node 24 and run:

    npm ci --prefix Frontend
    npm run dev --prefix Frontend

Build and check production output:

    npm run lint --prefix Frontend
    npm run build --prefix Frontend
    npm run verify:build --prefix Frontend
    npm run publish:frontend --prefix Frontend -- --dry-run

Production defaults to https://faizalamfaizi.com with API https://api.faizalamfaizi.com. Each public route has generated HTML before JavaScript runs. Published articles are fetched from the public API during the build; article discovery failures stop publication. Re-run the workflow after CMS article changes. The regular publish command pushes the generated branch; dry-run validates it without a remote write.

Private server settings belong in Hostinger environment variables. `.env` and dependency folders are ignored by Git. Keep private credentials out of frontend build variables.
