# Bookmark API

A personal bookmark manager backend, inspired by Pocket / Raindrop.io, built with FastAPI. Logged-in users save URLs with a title, notes, and tags, then filter and search their own bookmarks by tag or keyword.

This is a learning project. The goal is to practice core backend fundamentals — auth (per-user data isolation), many-to-many relations (Bookmark ↔ Tag), and filtered queries — rather than building a toy CRUD app.

## Tech Stack

- FastAPI
- SQLModel (SQLAlchemy + Pydantic)
- PostgreSQL, run via Docker Compose
- Alembic for migrations
- JWT auth: `pyjwt` for tokens, `pwdlib[bcrypt]` for password hashing
- `uv` for dependency management

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

The frontend is optional and secondary — the backend is the priority.

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
