# Faiz Alam Faizi website

The `main` branch contains the website source in `Frontend/` and the API in `Backend/`.

## Development

Use Node.js 24. Install dependencies with `npm run install:all`, then start both applications with `npm run dev`.

Frontend checks:

    npm run lint --prefix Frontend
    npm run build --prefix Frontend
    npm run verify:build --prefix Frontend

## Deployment

The **Publish frontend for Hostinger** workflow builds and validates `Frontend/dist`, then publishes generated static files to the `frontend` branch. Connect that branch to Hostinger Git with destination `public_html`. Edit source on `main`; do not edit generated files on `frontend`.

The separate Hostinger Node.js app uses branch `main`, application directory `Backend`, entry file `src/server.js`, build command `npm run build`, and start command `npm start`.

The production website is https://faizalamfaizi.com and the API is https://api.faizalamfaizi.com. Public pages are prerendered with content, metadata, structured data and SEO files. Run the frontend workflow again after publishing or editing articles to update static pages and sitemaps.

Credentials belong in Hostinger environment variables. Keep local `.env`, uploads, database exports, archives and recovery copies outside Git. Use placeholder-only `.env.example` files for configuration names. See `Backend/README.md` and `Frontend/README.md` for application-specific commands.
