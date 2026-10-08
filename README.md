# Minimal Node.js API

A small Express REST API example that runs locally, in Docker, or on Render. It has no database; add MongoDB/Mongoose only when an endpoint needs persistent data.

## Run locally

Requires Node.js 22 or later.

```sh
npm install
npm start
```

The server uses `PORT` when set, otherwise port `3000`. No environment variables are required for local development. Set `PORT` in the host environment to use a different port.

## Endpoints

| Method | Path | Response |
| ------ | ---- | -------- |
| `GET` | `/healthz` | `200` `{ "status": "ok" }` |
| `GET` | `/api` | `200` `{ "message": "Hello from Express" }` |

Add API endpoints in `src/app.js`. `/healthz` is a lightweight process health check and does not depend on a database.

## Docker

```sh
docker build -t minimal-node-api .
docker run --rm -p 3000:3000 minimal-node-api
```

## Render

Create a Web Service from the Git repository and select the Docker runtime. Render builds the included `Dockerfile` and provides `PORT`. Set the health check path to `/healthz`. No database or other environment variables are needed for this example.

## Keep-alive

The application does not ping itself.

GitHub Actions periodically requests `/healthz` to keep the Render service active during the day. The scheduled workflow runs every 5 minutes and only sends the health check between **6:00 AM and 1:00 AM IST**.

During the **1:00 AM–6:00 AM IST** window, the workflow skips the health check so the Render service can spin down naturally.

Add the following GitHub repository secret:

```text
RENDER_HEALTH_URL=https://<your-service>.onrender.com/healthz
```

The keep-alive logic is implemented in `.github/ci-cd.yml`; no keep-alive code is required in the Node.js application.