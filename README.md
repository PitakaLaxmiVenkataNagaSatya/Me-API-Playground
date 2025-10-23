# Me-API Playground

A tiny full-stack app that stores your candidate profile in a database and exposes it via a small API with a minimal frontend to run queries.

- Backend: Node.js + Express 5
- Database: SQLite via Sequelize (easily switchable to MySQL/Postgres)
- Frontend: Plain HTML/JS served by Express

## URLs (local)
- Backend health: http://localhost:3000/health
- API base: http://localhost:3000/api
- Frontend UI: http://localhost:3000/

## API Overview

- POST /api/profile — create/update (upsert) your profile
- GET /api/profile — get your profile (first/only row) or by email with `?email=...`
- GET /api/profile/:id — get by id
- PUT /api/profile/:id — update by id
- GET /api/projects?skill=python — list projects that use a given skill
- GET /api/skills/top — aggregated list of top skills across profiles
- GET /api/search?q=... — search by name, skills, or project title/description
- GET /health — liveness check (200 OK when DB is reachable)

Plain text responses: add `?format=txt` or send `Accept: text/plain` to any GET/POST route above to receive text instead of JSON. Examples:

```bash
curl -H "Accept: text/plain" "http://localhost:3000/api/profile?format=txt"
curl -H "Accept: text/plain" "http://localhost:3000/api/projects?skill=node&format=txt"
curl -H "Accept: text/plain" "http://localhost:3000/api/skills/top?format=txt"
curl -H "Accept: text/plain" "http://localhost:3000/api/search?q=cpu&format=txt"
```

## Database Schema
See docs/schema.md for table/column details. SQLite file lives at `./data/database.sqlite` by default.

## Quick Start (Local)

1) Install dependencies

```powershell
npm install
```

2) Seed your real data (edit `seeds/profile.json` with your info first)

```powershell
npm run seed
```

3) Run the server

```powershell
npm start
```

4) Open the UI

Open http://localhost:3000 in your browser. Use the buttons to load profile, search projects by skill, and view top skills.

## Sample cURL

```bash
# Health
curl http://localhost:3000/health

# Upsert profile
curl -X POST http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "email": "your.email@example.com",
    "education": "B.Tech in CS",
    "skills": ["javascript", "node"],
    "projects": [
      {"title":"API Playground","description":"CRUD API","skills":["node","express"]}
    ],
    "work": [{"company":"Example Corp","role":"SWE","period":"2023-Now"}],
    "links": {"github":"https://github.com/youruser","linkedin":"https://linkedin.com/in/youruser","portfolio":"https://your-portfolio.com"}
  }'

# Get profile
curl http://localhost:3000/api/profile

# Projects by skill
curl "http://localhost:3000/api/projects?skill=node"

# Top skills
curl http://localhost:3000/api/skills/top

# Search
curl "http://localhost:3000/api/search?q=api"
```

## Configuration

Environment variables (optional):

- PORT: default 3000
- DB_DIALECT: sqlite | mysql | postgres (default sqlite)
- DB_STORAGE: path to sqlite file (default ./data/database.sqlite)
- For MySQL: DB_NAME, DB_USER, DB_PASSWORD, DB_HOST, DB_PORT
- For Postgres: DATABASE_URL, DB_SSL=true

Create a `.env` file in the project root to override defaults.

## Deployment

📚 **[Complete Deployment Guide](docs/DEPLOYMENT.md)** - Detailed instructions for deploying to various platforms.

Quick deployment options:
- **Render** (Recommended) - One-click deploy using `render.yaml`
- **Heroku** - Deploy using `Procfile`
- **Docker** - Use included `Dockerfile` and `docker-compose.yml`
- **Railway**, **Fly.io** - See deployment guide for steps

### Quick Start - Render

- Backend: Deploy to Render, Railway, or Fly.io. Use persistent volume for SQLite or migrate to a managed DB (Postgres/MySQL) and set env vars.
- Frontend: Served by the backend; no separate hosting needed. For static hosting (Netlify/Vercel), set `window.API_BASE` in the HTML to point at your backend URL.

Example: in `frontend/index.html` head section add

```html
<script>window.API_BASE = 'https://your-backend.onrender.com';</script>
```

### One-click Render deploy

1) Push this repo to GitHub
2) In Render dashboard, "New +" → "Blueprint" → connect your repo
3) Render auto-detects `render.yaml`; click "Apply" to create the service
4) On first boot, Render runs `npm install` and then, at runtime start, `npm run seed && npm start` (the app reseeds each deploy)

Note on Free tier: Disks are not supported, so SQLite lives on the ephemeral filesystem. Your profile is reseeded on each deploy/rebuild. If you need persistence across restarts without reseeding, upgrade to a plan with disks or switch to Postgres (set `DB_DIALECT=postgres` and `DATABASE_URL`).

Environment variables (optional):
- PORT is provided by Render
- DB_DIALECT=sqlite (default) or postgres/mysql
- For Postgres: set `DATABASE_URL` and `DB_DIALECT=postgres`

After deploy, open the service URL:
- Health: https://<your-service>.onrender.com/health
- UI: https://<your-service>.onrender.com/
- API: https://<your-service>.onrender.com/api

### Heroku (optional)

1) Install Heroku CLI and login
2) heroku create me-api-playground
3) git push heroku main
4) heroku open

Note: Heroku ephemeral filesystem won’t persist SQLite across restarts. Prefer Render with disk or switch to Postgres.

## Known Limitations

- SQLite is ideal for local dev. For production, use Postgres/MySQL and add JSON indexes as needed.
- Authentication is not enabled; consider adding basic auth or API keys for write endpoints.
- Pagination/rate-limits not implemented; can be added as needed.

## Resume

Resume link intentionally omitted per user request.

## Architecture

- Express server exposes /api endpoints and serves the static frontend.
- Sequelize ORM abstracts DB; Profile model holds arrays/objects as JSON.
- Minimal frontend uses fetch() to call API and render JSON results.
