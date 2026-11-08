# Deploy on Render

This is the preferred deployment for this repository. Render runs the Node.js/Express app directly; no Sites or Worker build is needed.

The committed `render.yaml` targets Render's **free** plan. The app is fully functional, but SQLite sits on the ephemeral filesystem: records reset on every deploy and whenever the free instance sleeps and wakes. See "Durable storage" below to upgrade.

1. Sign up at https://render.com and connect your GitHub account.
2. Choose New > Blueprint and select Devop785/Production-Ready-Capstone, branch main.
3. Review render.yaml. On the free plan no charges are shown; approve the blueprint.
4. Deploy and wait for the readiness check on /health/ready to pass.
5. Open the assigned onrender.com URL, test search, submit fictional details, and confirm /health/ready returns ready.
6. Set PUBLIC_ORIGIN to the exact HTTPS origin if you later add a custom domain; the default Render URL is detected automatically.

Manual alternative: New > Web Service, Node runtime, build command npm ci --omit=dev, start command npm run seed && npm start. Set HOST=0.0.0.0, NODE_VERSION=22.20.0, DB_PATH=data/internships.sqlite. Health path: /health/ready. Keep the Render-provided PORT.

## Free plan caveats

Free instances sleep after roughly 15 minutes of inactivity; the next request pays a cold start of up to about a minute. Because seeding runs at startup, a woken instance comes back with the seed data and loses any applications submitted earlier. Do not use the free plan to demonstrate persistence across restarts.

## Durable storage

Switch `plan: free` to `plan: starter`, set DB_PATH to /var/data/internships.sqlite, and reattach a disk:

```yaml
    disk:
      name: internship-data
      mountPath: /var/data
      sizeGB: 1
```

This is a paid service plus a paid disk; confirm the displayed charges in the dashboard. Seeding runs at startup because persistent disks are unavailable during builds, and repeated seeds preserve existing IDs and applications.

## Notes

The current conservative limiter does not trust forwarded IP headers, so users behind Render's proxy can share a bucket; validate the proxy chain before enabling per-client trust, and use a shared limiter for scale.

The previous private Sites deployment is separate and is not automatically removed by deploying to Render. Update README submission links to the verified Render URL after deployment.

Official references: https://render.com/docs/deploy-node-express-app and https://render.com/docs/disks
