# Operations and deployment

Local: npm ci, npm run seed, npm start. Default port 3003. Keep DB_PATH on durable storage. For self-hosting, put Node behind HTTPS and set HOST, PORT and PUBLIC_ORIGIN explicitly. Restrict forwarded proxies before enabling trust proxy. Do not expose SQLite files.

Hosted Sites: npm run build embeds the public assets in a Worker ES module and packages schema migrations. The hosting manifest declares the DB binding. D1 persists records across Worker deploys. Migration is schema-only; fictional seed records are inserted idempotently when the API first runs. Never change an already-applied migration; add new files.

Health: /health/live reports process availability; /health/ready queries the database and returns 503 when unavailable. Request logs include generated requestId, method, pathname, response status and durationMs. Use request IDs to correlate failures without logging personal information.

Backup: for local SQLite, use the SQLite backup API or stop the server and copy the database with its WAL state safely checkpointed; never copy only the main file while writes are active. For D1, use the hosting provider's supported backup/export and restore procedures. Test restore before relying on it. No automated backups are claimed in this demo.

Rollback: redeploy the previous source version. Schema changes need compatible forward migrations; source rollback does not undo D1 migrations. Avoid destructive migrations. Investigate 5xx spikes, readiness failures and rate-limit surges. The local benchmark is a baseline only.

Walkthrough: docs/walkthrough.mp4 is a captioned 50-second walkthrough made from actual interface screenshots. Rebuild with Python Pillow and imageio-ffmpeg using scripts/make-walkthrough.py. Video topics: discovery, search, validation, persistence/confirmation, mobile and engineering decisions.
