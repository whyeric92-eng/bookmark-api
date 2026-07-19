# Bookmark API

A personal bookmark manager backend, inspired by Pocket / Raindrop.io, built with FastAPI. Logged-in users can save URLs with a title, notes, and tags, then filter and search them by tag or keyword.

This is a learning project. The goal is to practice core backend fundamentals — auth (per-user data isolation), many-to-many relations (Bookmark ↔ Tag), and filtered queries — rather than building a toy CRUD app.

## Tech Stack

- FastAPI
- Database: TBD

## Data Model (planned)

- `User`: email, password hash
- `Bookmark`: belongs to a User; url, title, notes, created_at
- `Tag`: name; many-to-many with Bookmark

## Features (planned)

- Register / login
- Create / list / filter and search bookmarks by tag or keyword
- Edit / delete bookmarks
- Manage tags

The frontend is optional and secondary — the backend is the priority.
