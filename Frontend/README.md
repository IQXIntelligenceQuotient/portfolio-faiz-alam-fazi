# Frontend

Vite, React, Tailwind CSS and Motion, with custom React DOM Server prerendering. `npm run build` creates readable HTML per public route and SEO files in `dist`.

- `npm run dev`: local development
- `npm run lint`: lint source
- `npm run build`: compile, prerender published pages, generate SEO files
- `npm run preview`: preview generated output
- `npm run verify:build`: verify route HTML, metadata, schemas, links and assets
- `npm run publish:frontend -- --dry-run`: validate the static Git publication tree
- `npm run publish:frontend`: publish the generated `frontend` branch (normally CI only)

The default production origin is https://faizalamfaizi.com; `DEPLOYMENT_SITE_URL` can override it consistently for Vite, routing, rendering and SEO generation. Hostinger public_html publication requires a domain-root build. `VITE_API_BASE_URL` is a public API URL, never a secret.

See ../DEPLOYMENT_CHECKLIST.md for Hostinger configuration. Keep editing source on `main`; the `frontend` branch contains generated files only.
