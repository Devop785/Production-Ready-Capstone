# Security checklist
- [x] Strict server validation, 16kb body cap, bounded fields and query parameters.
- [x] SQL parameters, foreign keys and atomic duplicate constraint.
- [x] DOM textContent, same-origin CSP and no inline JavaScript.
- [x] Rate limits: 120 API requests/minute, 5 application attempts/minute.
- [x] JSON/custom-header submission gate and origin rejection; no CORS permissions.
- [x] Applicant data not returned by public routes or stored in source control.
- [x] Request logs exclude bodies, applicant identities and search queries.
- [x] Hosted HTTPS/HSTS, nosniff, frame denial and no-referrer policy.

Limitations: limits are per process/isolate and reset on restart, not global. No email ownership verification; duplicate feedback can reveal whether an email/role pair exists. Local SQLite is not encrypted. Before accepting real applicants, add authentication, authorization, verified contact information, an explicit retention/deletion policy, shared rate limiting and monitored backups. Restrict access to database files and D1. Secrets belong in platform configuration, never Git.
