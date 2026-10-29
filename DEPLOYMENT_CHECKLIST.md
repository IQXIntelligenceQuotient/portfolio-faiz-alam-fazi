# Production deployment: GitHub Pages + Hostinger

Repository: https://github.com/IQXIntelligenceQuotient/portfolio-faiz-alam-fazi

## Local changes and release

Keep Frontend/ and Backend/ together. Only Frontend/dist is uploaded to Pages. Review and commit the changes (including staged dependency/environment removals), then push main. This work does not itself publish or change DNS.

From Frontend run `npm ci`, `npm run lint`, `npm run build`, `npm run verify:build`. Node 24 is used in CI. The build fetches all published articles from the production API and fails if discovery or article fetch fails, instead of deploying empty blog pages. Rebuild with Actions > Deploy frontend to GitHub Pages > Run workflow whenever CMS articles change. Existing articles remain readable without JavaScript. Browser interactions mount React over the static content; metadata ownership is transferred before mounting. Do not use this build for a repository subpath: it intentionally targets the requested custom domain at /.

## GitHub dashboard (requires repository admin)

1. Open repository Settings > Pages. Select Source: GitHub Actions. Do not select branch/root publishing or add a Jekyll starter workflow.
2. Verify domain ownership under the owning account/organization Pages settings using GitHub's supplied TXT verification record. Keep that TXT record.
3. Set Custom domain to `faizalamfaizi.com` and save. Frontend/public/CNAME also records that domain.
4. Review Settings > Environments > github-pages; retain reviewers, timers and branch restrictions. Permit main through the existing policy.
5. Push changes to main, or manually run `.github/workflows/deploy-pages.yml`. Confirm both build and deployment succeed for the new commit. Record the run URL and commit.
6. After the DNS check succeeds and a certificate is available, enable Enforce HTTPS.

## DNS: change only frontend records

Export/screenshot the complete DNS zone first. Edit DNS at the authoritative provider. Do not change nameservers. Do not delete any Hostinger site.

Replace the apex (@) Hostinger A records with these four GitHub Pages A records:

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | iqxintelligencequotient.github.io |

Replace the existing www Hostinger CNAME; do not append a repository path to the new CNAME. Remove conflicting apex AAAA records pointing at Hostinger if present, or replace them with GitHub's documented IPv6 addresses. No AAAA records are required when using these A records. Preserve api records, MX, SPF, DKIM, DMARC, mail/autodiscover, verification TXT and unrelated records. Avoid wildcard records pointing to Pages.

Observed on 2026-10-29: apex A answers 77.37.76.85 and 92.112.198.176; www CNAME www.faizalamfaizi.com.cdn.hstgr.net; api A answers 77.37.76.108 and 92.112.198.67. These are observations, not permanent Hostinger targets. Keep the API values assigned by its existing app. The main domain returned 403 with platform: hostinger and server: hcdn. Publishing a GitHub workflow alone cannot change this DNS routing.

## Existing Hostinger backend app

Open the EXISTING api.faizalamfaizi.com Node.js app > Settings & Redeploy. Select the same repository/main, application root `Backend`, framework Express/Other, install `npm ci --omit=dev`, entry file `src/server.js`, start `npm start`. This backend has no compilation step; do not set Frontend/dist as its output or run the root frontend build. Choose a supported Node version compatible with the lockfile (Node 24 recommended when offered). Keep Hostinger's assigned PORT; server.js reads it. Preserve the existing API domain and TLS configuration.

Set server-only environment variables in hPanel: NODE_ENV=production, FRONTEND_URL=https://faizalamfaizi.com, DATABASE_URL (or DB_USER/DB_PASSWORD/DB_HOST/DB_PORT/DB_NAME), JWT_SECRET_KEY, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET. Preserve other required existing server variables. Use existing private values; never put credentials in VITE_ variables. Apply changes and redeploy/restart. Preserve database and uploads. Run migrations only after a database backup and review; no migrations were run here.

The frontend workflow explicitly sets the public API origin to https://api.faizalamfaizi.com. Local .env overrides should contain public URLs only. Tracked .env files were removed from the current Git index, but old commits still contain them: rotate any real database, JWT, SMTP and Cloudinary secrets previously committed, then update hPanel. Local dependency and .env files remain on disk. History was not rewritten.

## Verification after publishing

- Homepage and a service direct URL must return 200 from GitHub Pages; source must contain H1, body content, canonical and JSON-LD, without /src/main.jsx.
- Test direct article refreshes, assets, favicon, manifest, robots.txt, sitemap-index.xml, sitemap.xml, image-sitemap.xml, llms.txt and 404.html.
- Check apex and www HTTPS redirects, mobile layout, navigation, browser console, contact and newsletter forms, reviews and admin login.
- Live read-only checks passed: /api/health, /api/posts, /api/categories, /api/tags, /api/review returned 200; contact OPTIONS returned 204 with the frontend allowed origin. This does not prove email delivery, writes, admin authentication or Cloudinary uploads. Verify those with controlled dashboard-assisted tests after deployment.
- Preserve existing API and email DNS records throughout the change. No hosting sites need deletion.

References: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site and https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/

Local validation: npm ci succeeded; lint passed with nine existing hook-dependency warnings; build generated 43 public routes plus 404; output verification passed JSON-LD, metadata, FAQ and 2,417 local target checks. Dev server returned 200. Local preview API requests from 127.0.0.1:4173 are not in production CORS allowlist; test production API interactions on the custom domain. No production form submissions or email sends were performed.
