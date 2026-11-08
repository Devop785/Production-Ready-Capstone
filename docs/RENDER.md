# Deploy on Render

This is the preferred deployment for this repository. Render runs the Node.js/Express app directly; no Sites or Worker build is needed.

1. Sign up at https://render.com and connect your GitHub account.
2. Choose New > Blueprint and select Devop785/Production-Ready-Capstone, branch main.
3. Review render.yaml. It requests a paid Starter web service and a 1 GB persistent disk. Confirm the displayed charges only if acceptable.
4. Deploy and wait for the readiness check to pass.
5. Open the assigned onrender.com URL, test search, submit fictional details, and confirm /health/ready returns ready.
6. Restart the service and confirm records remain in SQLite. Set PUBLIC_ORIGIN to the exact HTTPS origin if you later add a custom domain; the default Render URL is detected automatically.

Manual alternative: New > Web Service, Node runtime, build command npm ci --omit=dev, start command npm run seed && npm start. Set HOST=0.0.0.0, NODE_VERSION=22.20.0, DB_PATH=/var/data/internships.sqlite. Attach a paid persistent disk at /var/data. Health path: /health/ready. Keep the Render-provided PORT.

Seeding runs at startup because persistent disks are unavailable during builds. Repeated seeds preserve existing IDs and applications. Free ephemeral disks do not meet the persistence requirement. The current conservative limiter does not trust forwarded IP headers, so users behind Render's proxy can share a bucket; validate the proxy chain before enabling per-client trust, and use a shared limiter for scale.

The previous private Sites deployment is separate and is not automatically removed by deploying to Render. Update README submission links to the verified Render URL after deployment.

Official references: https://render.com/docs/deploy-node-express-app and https://render.com/docs/disks
