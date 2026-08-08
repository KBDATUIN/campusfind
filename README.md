# CampusFind — School Lost & Found System

A static HTML/CSS/vanilla-JS lost & found portal backed by **Supabase**
(Postgres database + Auth + Storage). No build step — upload the files to
any static host.

## Quick start

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Open the **SQL Editor**, paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
   This creates all tables, security policies, triggers, storage bucket and
   demo data. It is safe to run more than once.

### 2. Configure the app

1. Open **Project Settings → API** in Supabase.
2. Copy the **Project URL** and the **anon public** key.
3. Paste both into [`js/config.js`](js/config.js).

The anon key is **public by design** — it is safe to commit. Never put the
`service_role` key in the browser.

### 3. Run locally

Serve the folder over HTTP (e.g. `npx serve .` or open via VS Code Live
Server). Opening `index.html` directly via `file://` may work but a local
server is recommended.

### 4. Deploy

The app is fully static — deploy the whole folder to Netlify, Vercel,
Cloudflare Pages, GitHub Pages, or any CDN. No server configuration needed.

## Demo accounts (change after first login!)

| Role    | Email                       | Password     | Access |
|---------|-----------------------------|--------------|--------|
| Admin   | `admin@campusfind.edu`      | `admin123`   | Full admin panel |
| Staff   | `elena.rodriguez@campusfind.edu` | `staff123` | Full admin panel (same as admin) |
| Student | `james.carter@campusfind.edu` | `student123` | User dashboard |

Staff accounts have the **same admin-panel access as admins** (per your
configuration). Change these passwords in **Authentication → Users**, or
disable/deactivate the demo users before going live.

## How the data layer works

- The app keeps a synchronous in-memory snapshot of all collections; every
  write is mirrored to Supabase in the background (`js/app.js` → `Store`).
- All reads/writes are secured by **Row Level Security** in the database:
  - Visitors see only published (`verified` / `claim-approved` / `returned`) items.
  - Users see their own reports, claims and notifications.
  - Staff/Admins see everything and can moderate.
- Passwords are bcrypt-hashed **server-side** by Supabase Auth — no
  credential material ever reaches the browser.
- Photos are compressed client-side, uploaded to the `item-images` storage
  bucket, and stored as public URLs.

## Creating staff / admin accounts

Self-signup always creates **student** accounts (roles are never granted by
users). To create staff/admin accounts:

**Option A (easiest):** In Supabase **Authentication → Users → Add user**,
then set the role with:

```sql
update public.users
set role = 'staff', account_type = 'staff'
where email = 'new.staff@campusfind.edu';
```

**Option B:** Insert directly with a bcrypt hash:

```sql
insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
        'staff2@campusfind.edu', crypt('aStrongPassword', gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Jane Staff","school_id":"STF-200"}', now(), now());
```

## Hiding the admin panel

The `admin/` pages are protected by **two layers**:

1. **The real security — Supabase Row Level Security.** Admin pages render
   nothing useful without a valid staff/admin session, and the database
   rejects any request from a student or anonymous visitor. Even if someone
   downloaded the admin HTML, they could not see or change a thing.
2. **Vercel middleware (`middleware.js`).** Runs on the edge before any
   file is served and redirects everyone without a staff/admin session
   cookie away from `/admin/*`. To casual visitors the admin panel simply
   does not exist.

A note on static hosting: files in a static deployment can never be truly
"hidden" — anyone who guesses a URL can download the raw HTML/JS. That is
fine here because those files contain **no secrets and no data**. Security
lives in the database, not in the folder structure. (On Netlify you can
approximate this with redirect rules or a Netlify Function; the middleware
here is Vercel-specific.)

## Configure the site URL (email links must point at your deployed site)

Supabase confirmation/reset emails link back to your site using the
**Site URL** setting — by default it points at `http://localhost:3000`, so
real users would be sent to the wrong place.

1. Supabase Dashboard → **Authentication → URL Configuration**.
2. **Site URL:** `https://campusfind-two.vercel.app` (your deployed URL).
3. **Redirect URLs:** add `https://campusfind-two.vercel.app/**` (and
   `http://localhost:8080/**` if you also test locally).
4. Save.

## Recommended settings before launch

- **Authentication → Providers → Email:** keep password sign-in enabled.
  Decide whether to require email confirmation (recommended for production).
- **Authentication → Emails / SMTP:** configure a sender so confirmation and
  password-reset emails actually deliver. Without SMTP, Supabase's built-in
  email is rate-limited (a few emails/hour).
- Change or remove the demo accounts above.
- Add the admin accounts' emails to the allowlist if you restrict sign-ups.

## Project structure

```
├── index.html            Home (stats + recent items)
├── login.html / register.html
├── lost-items.html / found-items.html / item-details.html
├── report-lost.html / report-found.html / claim.html
├── dashboard.html        User dashboard
├── admin/                Admin panel (dashboard, reports, claims, users, settings)
├── js/                   app.js (Store + Supabase client), auth.js, items.js,
│                         claims.js, dashboard.js, notifications.js, admin.js, config.js
├── css/                  styles
└── supabase/schema.sql   Database schema, RLS, functions, seed data
```

## Notes & known limitations

- Notifications and activity logs are written client-side (fire-and-forget);
  a server-side trigger/RPC would be more robust at scale.
- The "reset demo data" admin button restores the sample dataset (accounts
  are kept).
- `school_id` is not unique at the database level — registration checks for
  duplicates in the app, but adding a unique index (with trigger handling)
  is recommended before a full rollout.
- Notifications/activity logs can be written by any authenticated user (the
  app needs to notify "the finder" server-side via the client); rate
  limiting or server-side writes are a good hardening step.
- For a school rollout, consider adding: rate limiting / abuse protection,
  email notifications via Supabase Edge Functions, and a moderation inbox.

## FAQ

**Why doesn't the app work without Supabase?** All data (users, items,
claims, notifications) is stored in your Supabase project. If `js/config.js`
isn't configured, the app shows an error and renders empty pages.

**Can I still use demo data?** Yes — the schema seeds 8 demo accounts and a
sample dataset. Use them to test, then change passwords or remove them.

**Is the anon key safe in the repo?** Yes. Supabase's `anon` key is designed
for client-side use and is further locked down by the Row Level Security
policies in `schema.sql`. The `service_role` key must NEVER be exposed.

**Why can't staff sign up through the register page?** Self-signup always
creates student accounts to prevent privilege escalation. Staff/admin
accounts are created by the office (see above).

**The app says "Could not find the table 'public.item_contacts' in the
schema cache" — what now?** The database is missing a table the app
expects. This usually happens when `schema.sql` was run on the project
before a newer version of it (that added `item_contacts`) was released,
or when the SQL editor stopped partway through. Fix: open the Supabase
**SQL Editor**, paste the entire current
[`supabase/schema.sql`](supabase/schema.sql), and click **Run**. It is
idempotent (safe to re-run), creates any missing tables, migrates older
`items.contact_info` data into `item_contacts`, and reloads PostgREST's
schema cache so the app picks everything up immediately.
