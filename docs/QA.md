# Quality assurance report
Date: 8 November 2026. Node.js 22.20.0, Windows.

## Checks performed
- Regression/security/Worker contract tests: 13 entries passed, zero failed; see test-output.txt.
- axe-core static DOM scan: zero violations in checked rules. Color contrast is disabled in jsdom; this is not a full accessibility certification. Details: accessibility.json.
- Browser checks: API data rendered, Python search returned the relevant role, form submitted fictional information successfully, mobile width 390px had no horizontal overflow.
- Local benchmark: 100 requests after 10 warmups, in-memory SQLite, six records. Median 3.80ms, p95 6.10ms. These are local loopback observations, not public deployment/load guarantees. Raw evidence: performance.json.
- Production dependency audit: no known vulnerabilities at time of implementation; rerun npm audit regularly.
- Worker contract checked through a D1-compatible SQLite adapter. Actual production deployment status is recorded separately.

The captioned video uses real local browser captures. No production traffic or real applicant information was used. It is a 50-second guided sequence, not an unedited screen recording.

Hosted deployment succeeded on 8 November 2026. Browser handoff reached the private sign-in gate; authenticated hosted journey testing remains pending. Local browser and Worker adapter checks passed.
