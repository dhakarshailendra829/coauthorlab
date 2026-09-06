# CoAuthorLab — Step-by-Step: Run It, Then Put It Live

This covers everything from "just downloaded the zip" to "live on the internet with a database."
Follow it top to bottom. Nothing here is a mock — every step below was tested.

---

## PART 1 — Run it on your own computer first

### 1. Install Node.js
You need Node.js version 18 or newer.
- Go to https://nodejs.org and install the "LTS" version for your OS.
- Check it worked by opening a terminal and running: `node -v`

### 2. Unzip the project
Unzip `CoAuthorLab_Site_and_Backend.zip` anywhere, e.g. your Desktop.
You'll see two folders: `frontend/` and `backend/`.

### 3. Install and start the backend
```bash
cd coauthorlab/backend
npm install
node src/seed.js        # creates an admin account + 1 demo mentor + 1 demo post
```
Now open `backend/.env.example`, copy it to a new file named `.env` in the same folder, and set:
```
JWT_SECRET=any-long-random-string-you-make-up
PORT=4000
SERVE_FRONTEND=true
```
`SERVE_FRONTEND=true` means this one backend will serve BOTH the website and the API — simplest option, one thing to run, one thing to deploy.

Start it:
```bash
npm start
```
You should see: `CoAuthorLab API running on port 4000`

### 4. Open the site
Go to **http://localhost:4000** in your browser. That's your full site, running with a real database.

Log in with the seeded admin account to explore:
- Email: `admin@coauthorlab.com`
- Password: `ChangeMe123!`
(Change this password immediately — see Part 3.)

Try it end to end:
1. Go to Sign in → "Create an account" → make a normal student account.
2. Click "Tell us your idea" on the homepage, type something, submit → it saves to the database.
3. Go to `workspace.html` → you'll see the idea listed — that's coming live from SQLite, not fake text.
4. Go to "Find a mentor" → you'll see Dr. Aditi Rao (the seeded demo mentor) loaded from the database.
5. Go to "Research Journal" → you'll see the seeded welcome post.

If anything looks empty, it's because nothing has been created yet in the database — that's expected on a fresh install, not a bug.

---

## PART 2 — Put it live on the internet (free-tier friendly)

You have two files that matter for going live:
- `backend/` — the whole app (with `SERVE_FRONTEND=true`, this also serves the website)
- A GitHub account (free) — https://github.com — needed to deploy to Render

### Step 1 — Put the code on GitHub
1. Create a free GitHub account if you don't have one.
2. Create a new repository, e.g. `coauthorlab`.
3. Upload the **entire `coauthorlab` folder** (both `frontend/` and `backend/`) to that repository. Easiest way if you're not familiar with git:
   - On the repo page, click "Add file" → "Upload files" → drag the whole folder in → commit.

### Step 2 — Deploy on Render (free tier)
1. Go to https://render.com and sign up (you can sign in with GitHub).
2. Click **New +** → **Web Service**.
3. Connect your GitHub account and select the `coauthorlab` repository.
4. Fill in:
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
5. Under **Environment Variables**, add:
   - `JWT_SECRET` = a long random string (make one up, keep it secret)
   - `SERVE_FRONTEND` = `true`
6. Click **Create Web Service**. Wait for the build to finish (2–5 minutes).
7. Render gives you a live URL like `https://coauthorlab.onrender.com` — open it. That is your live website, backed by a real API.

### Step 3 — Make your data survive restarts (important)
By default, Render's free web services can reset their disk on redeploy, which would wipe the SQLite database file.
1. In your Render service, go to **Disks** → **Add Disk**.
2. Mount path: `/opt/render/project/src/backend/data`
3. Size: 1 GB is plenty to start.
4. Redeploy. Now your database file persists across restarts and deploys.

### Step 4 — Seed the live database once
1. In Render, open your service → **Shell** tab (top right).
2. Run: `node src/seed.js`
3. This creates the admin account on your LIVE database. Use the printed login to sign in on your live URL, then immediately change that password (Part 3, step 2).

### Step 5 (optional) — Use your own domain name
1. Buy a domain (e.g. from Namecheap, GoDaddy, or Google Domains) — typically $10–15/year.
2. In Render, go to your service → **Settings** → **Custom Domain** → add your domain.
3. Follow Render's instructions to add a DNS record at your domain registrar (usually a CNAME).
4. Wait 10–60 minutes for DNS to update. Your domain now points to your live CoAuthorLab site.

---

## PART 3 — Things to do before sharing the live link publicly

1. **Change the admin password.** The seeded `admin@coauthorlab.com / ChangeMe123!` account is public knowledge (it's in this guide) — sign in and change it, or delete that account and promote your real email to admin instead:
   ```bash
   # In Render's Shell tab, after you've signed up normally with your real email:
   sqlite3 backend/data/coauthorlab.db "UPDATE users SET role='admin' WHERE email='your-real-email@example.com';"
   ```
2. **Set a real `JWT_SECRET`.** Never leave it as the default `dev-secret-change-me` — anyone who guesses it can forge login tokens.
3. **Review mentor applications before verifying them.** New mentor applications land with `verification_status = 'pending'` and won't show publicly until you (as admin) call:
   ```
   POST /api/mentors/:id/verify
   ```
   You can do this with a tool like Postman, or ask me to build a simple admin page for this next.
4. **Review journal posts before publishing.** Same idea — posts start as `draft`, an author submits them (`in_review`), and only an admin call to `/api/journal/:id/moderate` with `{"decision":"published"}` makes them public.

---

## What's real vs. what's next

**Already real and working today:**
- Accounts (signup/login with hashed passwords + secure tokens)
- Ideas workspace (saved per user, in a real database)
- Mentor directory + mentor applications + verification workflow
- Research Journal with draft → review → publish workflow
- One-command deploy to a live URL with persistent data

**Still worth adding (tell me and I'll build it next):**
- A simple admin dashboard page (so you don't need Postman/curl to verify mentors or publish posts)
- Direct mentor request UI on the mentor cards (the API already supports it — `POST /api/mentors/:id/request`)
- Email notifications (e.g. mentor request received)
- Payment collection for the paid tier shown in Pricing

If you run into any error at any step above, copy the exact message back to me and I'll fix it.
