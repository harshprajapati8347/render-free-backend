# Minimal Express TODO API

Small Node.js + Express REST API for testing a Docker deploy on [Render](https://render.com), with MongoDB Atlas and an external `/healthz` keep-alive.

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/healthz` | App + MongoDB health |
| `GET` | `/todos` | List todos |
| `GET` | `/todos/:id` | Get one todo |
| `POST` | `/todos` | Create a todo |
| `PUT` | `/todos/:id` | Update a todo |
| `DELETE` | `/todos/:id` | Delete a todo |

## 1. Run locally

Requires Node.js 22+.

```bash
cp .env.example .env
# Edit .env and set MONGODB_URI (and optionally PORT)
npm install
npm start
```

The server listens on `process.env.PORT` or `3000`.

## 2. Set `MONGODB_URI`

Put the Atlas connection string in `.env` (never commit this file):

```text
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
PORT=3000
```

Replace `<user>`, `<password>`, `<cluster>`, and `<dbname>`. URL-encode special characters in the password.

## 3. Run with Docker

```bash
docker build -t todo-api .
docker run --rm -p 3000:3000 --env-file .env todo-api
```

The container reads `PORT` (default `3000`) and `MONGODB_URI` from the environment.

## 4. Create the MongoDB Atlas database

1. Create a project and a free/shared cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user (username + password).
3. Under **Network Access**, allow Render outbound IPs, or `0.0.0.0/0` for a demo.
4. Click **Connect** → **Drivers** and copy the `mongodb+srv://...` URI.
5. Add a database name in the URI path (for example `todos`).

## 5. Configure GitHub Secrets

In the GitHub repo: **Settings → Secrets and variables → Actions**.

| Secret | Value |
| --- | --- |
| `RENDER_DEPLOY_HOOK` | Deploy Hook URL from the Render service |

Create the hook in Render: service → **Settings** → **Deploy Hook**. CI uses `GITHUB_TOKEN` automatically to push images to GHCR; you do not need a separate GHCR password secret.

## 6. Configure GHCR

Pushing to `main` builds and publishes:

```text
ghcr.io/<github-user>/<repo>:latest
ghcr.io/<github-user>/<repo>:<git-sha>
```

The image is private by default. For Render to pull it:

1. GitHub → **Settings → Developer settings → Personal access tokens**.
2. Create a token with `read:packages` (and SSO authorize if the org requires it).
3. Add that token in Render as a **registry credential** for `ghcr.io` (username = your GitHub username).

Optional: make the package public under **GitHub → Packages → package settings** if you do not want a pull token.

## 7. Deploy to Render

Create a **Web Service** once in the Render dashboard (CI only triggers redeploys after that):

1. **New → Web Service**.
2. Choose **Deploy an existing image from a registry**.
3. Image URL: `ghcr.io/<github-user>/<repo>:latest`.
4. Attach the GHCR registry credential if the package is private.
5. Set environment variables:
   - `MONGODB_URI` — Atlas connection string
   - `PORT` — `3000`
6. Health check path: `/healthz`.
7. Create the **Deploy Hook** and store it as the `RENDER_DEPLOY_HOOK` GitHub secret.

Each push to `main` runs GitHub Actions: install → validate → Docker build → push to GHCR → `POST` the deploy hook.

## 8. External `/healthz` monitor (keep-alive)

The app does **not** ping itself. Render free instances may sleep; this service is allowed to sleep **12:00 AM–6:00 AM IST**.

Use [UptimeRobot](https://uptimerobot.com/) (or similar):

1. Create an HTTP(s) monitor for `GET https://<your-service>.onrender.com/healthz`.
2. Interval: every 5 minutes.
3. Add a **maintenance window** so checks pause **12:00 AM–6:00 AM IST** (18:30–00:30 UTC).

Outside that window, the monitor keeps the Render service awake by hitting `/healthz`.

## 9. Test the API with curl

Replace `http://localhost:3000` with your Render URL when testing production.

**Health**

```bash
curl -s http://localhost:3000/healthz
```

**Create**

```bash
curl -s -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship to Render","completed":false}'
```

**List**

```bash
curl -s http://localhost:3000/todos
```

**Get one** (use `_id` from the create response)

```bash
curl -s http://localhost:3000/todos/<id>
```

**Update**

```bash
curl -s -X PUT http://localhost:3000/todos/<id> \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'
```

**Delete**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X DELETE http://localhost:3000/todos/<id>
```

Expected: `204`.

## 10. Test with Postman

No UI is included. Use Postman (or import [`postman_collection.json`](postman_collection.json)).

### Import (optional)

1. Open Postman → **Import** → select `postman_collection.json`.
2. Open the **TODO API** collection → **Variables**.
3. Set `baseUrl` to `http://localhost:3000` (local) or `https://<your-service>.onrender.com` (Render).
4. Send **Create todo** first. The collection saves `_id` into `todoId` for Get / Update / Delete.

### Manual requests

Use the same `baseUrl`. For POST and PUT, set **Body → raw → JSON**.

| Step | Method | URL | Body | Expected |
| --- | --- | --- | --- | --- |
| 1. Health | `GET` | `{{baseUrl}}/healthz` | — | `200` `{ "status": "ok", "db": "connected" }` |
| 2. Create | `POST` | `{{baseUrl}}/todos` | `{ "title": "Ship to Render", "completed": false }` | `201` — copy `_id` |
| 3. List | `GET` | `{{baseUrl}}/todos` | — | `200` array |
| 4. Get one | `GET` | `{{baseUrl}}/todos/<id>` | — | `200` one todo |
| 5. Update | `PUT` | `{{baseUrl}}/todos/<id>` | `{ "completed": true }` | `200` `completed: true` |
| 6. Delete | `DELETE` | `{{baseUrl}}/todos/<id>` | — | `204` empty body |

`title` must be a non-empty string. `completed` must be a JSON boolean (`true`/`false`), not `"true"`.

Useful extras:

- Missing title on create → `400`
- Invalid id (for example `abc`) → `400`
- Unknown id → `404`
