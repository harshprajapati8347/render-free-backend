# Minimal Node.js API

A minimal Node.js + Express backend hosted **free on Render**, using **UptimeRobot** and **GitHub Actions** to keep it running.

The project is intentionally simple and can be used as a starting point for small JavaScript backend projects.

## Run locally

Requires Node.js 22 or later.

```sh
npm install
npm start
```

The server uses `PORT` when set, otherwise port `3000`.

## Endpoints

| Method | Path       | Response                                    |
| ------ | ---------- | ------------------------------------------- |
| `GET`  | `/healthz` | `200` `{ "status": "ok" }`                  |
| `GET`  | `/api`     | `200` `{ "message": "Hello from Express" }` |

Add API endpoints in `src/app.js`.

## Docker

```sh
docker build -t minimal-node-api .
docker run --rm -p 3000:3000 minimal-node-api
```

## Free Render Hosting

Create a Web Service on Render from this GitHub repository and select the **Docker** runtime.

Render provides the `PORT` environment variable automatically.

Set the Render health check path to:

```text
/healthz
```

No database or additional environment variables are required.

## Keep Render Running

Render's free service can spin down when there is no traffic.

This project uses two external mechanisms to keep the backend available:

### UptimeRobot

Create an HTTP monitor for:

```text
https://<your-service>.onrender.com/healthz
```

UptimeRobot periodically requests the `/healthz` endpoint, generating traffic to the Render service.

### GitHub Actions

GitHub Actions provides an additional scheduled keep-alive mechanism.

The workflow in `.github/ci-cd.yml` runs periodically and requests `/healthz` during the desired active hours.

The application itself does **not** ping itself. The `/healthz` endpoint is simply exposed so external services can check the running backend.

## GitHub Secret

Add this repository secret:

```text
RENDER_HEALTH_URL=https://<your-service>.onrender.com/healthz
```

The GitHub Actions workflow uses this URL for the scheduled health check.

## Project Structure

```text
.
├── .github/
│   └── ci-cd.yml
├── src/
│   ├── app.js
│   └── server.js
├── Dockerfile
├── package.json
└── README.md
```

## Key Idea

**Minimal Node.js + Express backend hosted free on Render using UptimeRobot and GitHub Actions to keep it running.**
