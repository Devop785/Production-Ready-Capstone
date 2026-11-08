# SkillOrbit — Production-Ready Capstone

Full-stack internship portal capstone by **Syed Anwar Shazeb (Devop785)**. Integrates the responsive board, persistent REST API and secure application journey.

## Preferred deployment: Vercel + Turso

Follow [the Vercel deployment guide](docs/VERCEL.md). Use Vercel Hobby for the non-commercial demo and Turso's free database plan; both cost nothing and applications persist. The checked-in vercel.json configures the static frontend, Node API and initial database setup. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel before deploying. Local SQLite remains available for development.

### Alternative: Render

[The Render deployment guide](docs/RENDER.md) remains supported. The included render.yaml targets Render's free plan, where SQLite sits on an ephemeral disk and resets when the instance sleeps; that guide also records the change needed for a paid Starter service with a durable disk.

The older private Sites URL below is not the preferred submission deployment; replace it with the verified deployment URL.

## Submission links
- [Live deployment](https://production-ready-capstone.vercel.app) — public, no sign-in required. Vercel Hobby with a Turso database; submitted applications persist across redeploys.
- [Walkthrough video — 50 seconds](docs/walkthrough.mp4): captioned actual-interface captures and engineering decisions; no narration.
- [QA report](docs/QA.md), [security checklist](docs/SECURITY.md), [operations guide](docs/OPERATIONS.md).

## Run locally
Node.js 22.13+ required; tested with 22.20.0.

```sh
npm ci
npm run seed
npm start
```

Open http://127.0.0.1:3003. SQLite data persists in data/internships.sqlite. Node 22 may display a SQLite experimental warning. PORT, HOST, DB_PATH and PUBLIC_ORIGIN can be set through environment variables. Default binding is loopback; configure PUBLIC_ORIGIN to the exact browser origin for applications. The demonstration uses fictional records; use fictional applicant information.

```sh
npm test
npm run performance
npm audit
npm run build
```

## User journey
Browse paginated internships, search by role/company, filter by domain, clear filters, open a labelled application dialog, complete validated fields and receive a confirmation. Loading, empty, failure and retry feedback are visible. Failed submissions preserve entered values. Duplicate applications for the same email/role are rejected atomically. Screens adapt to mobile; controls have visible focus and touch-sized buttons.

## Architecture and decisions
- Plain HTML/CSS/JavaScript keeps the UI small and avoids a frontend build framework.
- Local Express API and SQLite preserve the earlier milestones. Public role modifications are blocked; applicants cannot retrieve others' submissions.
- Hosted Worker/D1 adapter matches the public list/detail/application contract. Node SQLite remains useful for local development and portable self-hosting.
- Parameterized queries, strict input validation, bounded JSON and unique/foreign-key constraints protect data integrity.
- Request IDs, status, route and elapsed time are logged as JSON; submitted names, email addresses, bodies and query strings are not logged.
- Native dialog, labels, live status messages, keyboard focus and simplified mobile layout support accessibility.
- Per-process/per-isolate limits are suitable for the demo; a distributed limiter and verified identities are required before real recruitment use.

## API contract
GET /api/internships accepts page (1–1,000,000), limit (1–100), q (up to 120 characters), domain (up to 120 characters). Returns data and meta with page, limit, total and totalPages. GET /api/internships/:id returns one record. GET /health/live checks process availability; GET /health/ready checks database readiness (503 on failure).

POST /api/applications requires application/json and X-Application-Request: 1. Fields: internshipId (positive integer), fullName (2–100 trimmed characters), email (valid format, max 254), coverLetter (30–3,000 trimmed characters), consent (true). Unknown fields are rejected. Successful response: 201 with `{data:{id,status:"received"}}`. Errors use `{error:{code,message,details:[]}}` and appropriate 400/403/404/405/409/413/415/429/500 codes. A 409 means the email/role pair already has an application.

## Source map
- public/: shared frontend
- src/: local Node API, integration middleware and database
- worker/: hosted API adapter
- db/: schema and fictional SQL/JSON seeds
- drizzle/: hosted schema migration
- scripts/: deterministic Worker build, performance measurement and walkthrough creation
- test/: frontend, API, security, accessibility and Worker contract tests
- docs/: actual test output, measured results and walkthrough

## Scope
This is a production-oriented educational demo, not a certified production recruiting service. No account verification, admin console, distributed rate limiter or automated privacy retention workflow is claimed. See security and operations guides before real-data deployment. The course screenshot was the supplied specification; separate linked course briefs and official seed files were not supplied.
