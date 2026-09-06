# CoAuthorLab API

A real Express + SQLite backend for the CoAuthorLab site: accounts, mentors, journal posts, and student ideas — tested and working (not a mock).

## Run locally

```bash
cd backend
npm install
npm start
```

The API listens on `http://localhost:4000`. A SQLite file is created automatically at `backend/data/coauthorlab.db` — no external database server needed to get started.

Set a real secret before going live:

```bash
# backend/.env
JWT_SECRET=replace-with-a-long-random-string
PORT=4000
```

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/signup | — | Create an account |
| POST | /api/auth/login | — | Get a JWT |
| GET | /api/mentors | — | List verified mentors |
| POST | /api/mentors/apply | student/mentor | Apply to become a mentor |
| POST | /api/mentors/:id/verify | admin | Verify a mentor |
| POST | /api/mentors/:id/request | any user | Request guidance |
| GET | /api/journal | — | List published posts |
| POST | /api/journal | any user | Create a draft post |
| POST | /api/journal/:id/submit | author | Submit draft for review |
| POST | /api/journal/:id/moderate | admin | Publish or reject |
| POST | /api/ideas | any user | Submit "Tell us your idea" |
| GET | /api/ideas/mine | any user | List your own ideas |

There is currently no admin-signup flow — promote a user to `admin` directly in the database once, e.g.:

```bash
sqlite3 backend/data/coauthorlab.db "UPDATE users SET role='admin' WHERE email='you@example.com';"
```

## Deploying the backend (free-tier friendly)

1. Push this `backend/` folder to its own GitHub repo (or a subfolder of your existing repo).
2. On **Render** (render.com): New → Web Service → connect the repo → Build command `npm install`, Start command `npm start`. Add the `JWT_SECRET` environment variable. Render gives you a URL like `https://coauthorlab-api.onrender.com`.
   - Railway.app and Fly.io work the same way if you prefer those.
3. SQLite lives on disk, so on Render add a **persistent disk** (Render → your service → Disks) mounted at `/opt/render/project/src/backend/data`, or set `DB_PATH` to that mount, so data survives restarts/deploys. If you outgrow SQLite, swap `better-sqlite3` for `pg` and point at a managed Postgres (Render/Neon/Supabase all have free tiers) — the SQL in `src/db.js` is intentionally plain so that migration is small.
4. Once deployed, open `frontend/config.js` and set:
   ```js
   window.COAUTHORLAB_API_BASE = "https://coauthorlab-api.onrender.com";
   ```

## Deploying the frontend

The `frontend/` folder is plain HTML/CSS/JS — no build step. Drag-and-drop deploy it to **Netlify** or **Vercel** (or GitHub Pages), and it will call whatever `COAUTHORLAB_API_BASE` you set in `config.js`.
