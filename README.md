# Bookmark API

A personal bookmark manager, inspired by Pocket / Raindrop.io, with a FastAPI backend and a React frontend. Logged-in users save URLs with a title, notes, and tags, then filter and search their own bookmarks by tag or keyword.

This is a learning project. The goal is to practice core backend fundamentals — auth (per-user data isolation), many-to-many relations (Bookmark ↔ Tag), and filtered queries — rather than building a toy CRUD app. The frontend exists to exercise the API end-to-end; the backend remains the primary focus.

**Live app:** https://bookmark-api-omega.vercel.app
**API:** https://bookmark-api-o75m.onrender.com (interactive docs at `/docs`)

## Tech Stack

**Backend**
- FastAPI
- SQLModel (SQLAlchemy + Pydantic)
- PostgreSQL, run via Docker Compose locally / Neon in production
- Alembic for migrations
- JWT auth: `pyjwt` for tokens, `pwdlib[bcrypt]` for password hashing
- `uv` for dependency management

**Frontend**
- React + Vite
- `react-router-dom` for client-side routing

## Data Model

- `User`: email, username, hashed password, created_at
- `Bookmark`: belongs to a User; url, title, notes, created_at. Unique per user on `(user_id, url)`
- `Tag`: belongs to a User; name. Unique per user on `(user_id, tag)`. Many-to-many with Bookmark through a `tag_link` join table

## Features

**Auth**
- Register / login (JWT access token)
- Get / update current user's profile
- Logout (stateless — the client discards the token; no server-side blacklist)

**Bookmarks** (all scoped to the logged-in user)
- Create / list / get / update / delete
- Search by keyword (title, url, notes) and filter by tag
- Link / unlink tags on a bookmark

**Tags** (all scoped to the logged-in user)
- Create / list / get (with linked bookmarks) / update / delete

**Data integrity**
- Every bookmark/tag/link endpoint checks resource ownership; accessing another user's resource returns 404
- Duplicate email/username/url/tag-name violations return 400 instead of a raw 500

## Setup

1. Start Postgres: `docker compose up -d`
2. Install dependencies: `uv sync`
3. Create `app/.env` with:
   ```
   DATABASE_URL=postgresql+psycopg://...
   secret_key=<random hex string>
   ```
4. Run migrations: `uv run alembic upgrade head`
5. Start the API: `uv run fastapi dev app/main.py`
6. Interactive docs at `/docs`

## Deployment

| Component | Provider | URL |
|---|---|---|
| Database (Postgres) | [Neon](https://neon.tech) | — |
| Backend (FastAPI) | [Render](https://render.com) (free tier) | https://bookmark-api-o75m.onrender.com |
| Frontend (React/Vite) | [Vercel](https://vercel.com) (free tier) | https://bookmark-api-omega.vercel.app |

### Backend (Render)

- Root directory: repo root
- Build command: `pip install uv && uv sync --frozen`
- Start command: `uv run alembic upgrade head && uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - `alembic upgrade head` runs on every boot instead of as a separate step, since the free tier has no Shell/one-off job access. It's idempotent, so this is safe.
- Environment variables: `DATABASE_URL` (Neon connection string, `postgresql+psycopg://...`), `SECRET_KEY`
- `requires-python` is pinned to `>=3.12` in `pyproject.toml`, `.python-version`, and `uv.lock` — all three must stay in sync, or `uv sync --frozen` fails on Render because the lockfile's pinned interpreter version isn't available there. After bumping `requires-python`, always run `uv lock` locally and commit the updated `uv.lock`.

### Frontend (Vercel)

- Root directory: `frontend`
- Environment variable: `VITE_API_URL` = backend URL above
- `frontend/vercel.json` rewrites all paths to `/index.html` so client-side routes (`/login`, `/tags`, etc.) don't 404 on direct load/refresh — required for any SPA using `react-router-dom`'s `BrowserRouter`.
- After changing the Render backend URL, update `allow_origins` in `app/main.py`'s CORS middleware to include the Vercel domain.

### Notes

- Both Render and Vercel auto-deploy on push to `main`. Render doesn't scope this to backend-only paths, so a frontend-only commit still triggers a backend rebuild (harmless, just a wasted ~1–2 min build).
- Render's free instance spins down after 15 min of inactivity; the first request after that takes 30–50s to wake up.
- No zero-downtime deploys on the free tier — the backend is briefly unreachable while a new deploy replaces the running instance.
