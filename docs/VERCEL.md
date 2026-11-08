# Deploy free: Vercel Hobby + Turso

Vercel runs the frontend and Node function; Turso persists application records. Local filesystem SQLite is not used in Vercel. No Render service or disk is needed.

## 1. Create the database
Sign up at https://turso.tech on the free plan. Create a libSQL-compatible database, copy its libsql:// URL and generate a database auth token. Do not commit or send the token in chat.

## 2. Import the project
Sign up at https://vercel.com with GitHub. Choose Add New > Project and import Devop785/Production-Ready-Capstone. Choose a personal Hobby account for this non-commercial demo, not a Pro trial. Framework preset: Other. Root directory: repository root. Use the checked-in vercel.json settings: build npm run setup:turso, output public, Node 22.x.

## 3. Add environment variables before deploying
- TURSO_DATABASE_URL: your libsql:// database URL.
- TURSO_AUTH_TOKEN: database token (mark sensitive).

Enable these for Production. Use a separate demo database for Preview if enabling preview builds. Do not expose credentials with a PUBLIC/NEXT_PUBLIC prefix. The build creates schema and inserts six fictional roles idempotently; existing records are retained.

## 4. Deploy and verify
Click Deploy. Open the generated production .vercel.app URL. Test /health/ready, search, and a fictional application. Redeploy and confirm the data remains in Turso.

If application submission returns 403, set PUBLIC_ORIGIN to the exact HTTPS URL in the browser (no trailing slash), save and redeploy. This is required for custom domains and may be needed for preview domains. By default the app uses Vercel's production domain, then its deployment URL.

## Troubleshooting
- Build says database configuration missing: add both Turso variables to the target environment and redeploy.
- Authentication/database connection fails: verify the libSQL URL and regenerate a database-scoped token.
- No functions found: retain the api/index.js file and the committed vercel.json; use framework Other.
- 429: wait for the limit to reset. The demo's in-memory limiter is per-instance and conservatively groups proxy traffic. It is not a global distributed protection system.

## Limits
The free services have usage limits. Vercel Hobby is for personal non-commercial projects. No paid upgrade is needed for this setup within those limits. Authentication, verified applicant email and a shared rate limiter remain requirements for real recruiting use. The schema initializer supports this initial schema, not arbitrary future migrations.

References: https://vercel.com/docs/plans/hobby ; https://turso.tech/pricing ; https://vercel.com/kb/guide/is-sqlite-supported-in-vercel
