# SSC CGL Tracker

A private, single-user study planner for SSC CGL preparation.

- **Calendar planner** — add tasks per day, colour-coded by subject (Quant, Reasoning, English, General Awareness, General), tick them off, edit or move them to another date.
- **Syllabus tracker** — a pre-seeded SSC CGL topic list you can cycle through *Not started → Studying → Revised*, with per-subject progress bars and add/remove topics.
- **Supabase auth** — one email + password account; Row Level Security means only your user can read or write your rows.
- **Free hosting** — static build on GitHub Pages, backend on Supabase's free tier.

---

## 1. Create the Supabase project

1. Sign in at [supabase.com](https://supabase.com) and create a new project (any name; pick the region closest to you).
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates:
   - `tasks` — planner tasks (`title`, `subject`, `notes`, `due_date`, `completed`)
   - `syllabus_topics` — syllabus topics (`subject`, `topic`, `status`, `sort_order`)
   - indexes, `updated_at` triggers, and RLS policies that restrict every row to its owner.
3. Create your account: **Authentication → Users → Add user → Create new user**. Enter your email and a password and enable **Auto Confirm User** so you can log in immediately.
4. Lock the door: **Authentication → Sign In / Providers → Email** and turn off **Allow new users to sign up**. The app has no signup screen, but this makes the Supabase API itself reject new accounts too.
5. Copy your credentials from **Project Settings → API**:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon / public key** → `VITE_SUPABASE_ANON_KEY`

> The `anon` key is meant to be public. It is safe in a frontend bundle because RLS policies decide what it can access. Never put the `service_role` key in this app.

## 2. Run locally

```bash
cp .env.example .env     # fill in the two values from step 1.5
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173/calender_project/`), sign in with the account from step 1.3, and you're done. The syllabus page seeds the starter topic list on first visit.

## 3. Deploy to GitHub Pages

1. Push this repository to GitHub (the remote already points at `Amritpal985/calender_project`).
2. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. In the repo: **Settings → Secrets and variables → Actions → New repository secret**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually from the Actions tab).
5. The site goes live at `https://amritpal985.github.io/calender_project/`.

Deployment is handled by [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml): install → build with the two secrets injected → publish `dist` to Pages.

### If you rename the repository

GitHub Pages serves the site from a sub-path, so the Vite `base` must match the repo name. It is currently set in [`vite.config.ts`](vite.config.ts):

```ts
base: '/calender_project/',
```

Change it to `'/<new-repo-name>/'` if you rename the repo. The app uses a **hash router** (`/#/syllabus`), so page refreshes and direct links work on Pages without extra rewrite rules.

## 4. Data model

```
tasks
  id uuid pk · user_id uuid → auth.users · title text · subject text
  notes text|null · due_date date · completed bool
  created_at timestamptz · updated_at timestamptz

syllabus_topics
  id uuid pk · user_id uuid → auth.users · subject text · topic text
  status enum text: not_started | studying | revised
  sort_order int · created_at · updated_at
  unique (user_id, subject, topic)
```

All access goes through RLS policies of the form `auth.uid() = user_id` for `select`, `insert`, `update`, and `delete`.

## 5. Notes & troubleshooting

- **Supabase free-tier projects pause after ~7 days without activity.** Your data is retained — open the Supabase dashboard and click **Restore** to wake the project. Logging into the app regularly keeps it active.
- **Blank page / setup screen after deploying** — the repository secrets are missing or were added after the last build. Re-run the deploy workflow.
- **`Invalid login credentials`** — the user does not exist or the password is wrong. Create/reset it under **Authentication → Users**.
- **`permission denied for table tasks`** while signed in — table privileges were not granted automatically. Run the `grant ...` statements at the end of `supabase/schema.sql` in the SQL Editor. RLS filters rows; these grants decide whether the role may touch the table at all.
- **"New users are not allowed"** while creating a user — signups are disabled (as intended); use **Authentication → Users → Add user** instead.
- **Syllabus appears empty on a brand-new account** — the seed runs on first visit. Reload the page once if the insert was interrupted.
- Local env values live in `.env`, which is git-ignored. Production values come from GitHub Actions secrets.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Preview the production build locally |
