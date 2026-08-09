# 🎒 FindBack — School Lost & Found System

> Lost something on campus? Found something that isn't yours? **FindBack** is the school's digital lost & found — report an item, browse listings, and claim what belongs to you. No lost item should stay lost.

🔗 **Live site: [https://findback.netlify.app](https://findback.netlify.app)**

---

## What is FindBack?

FindBack is a school-wide lost & found platform built for our community. Every year, hundreds of items are lost across campus — textbooks, laptops, ID cards, keys and more. FindBack makes it easy for students and staff to:

- **Report** lost or found items with a photo and description
- **Browse & search** verified listings from anywhere
- **Claim** found items with owner-only details
- **Get matched** when a lost report and a found report look like the same item

Every listing is reviewed by the lost & found office before it goes live, so what you see is accurate and trustworthy.

---

## 🚀 How users access FindBack

No installation, no downloads — FindBack runs in any browser on any device.

1. **Open [findback.netlify.app](https://findback.netlify.app)** (or the URL your school provides)
2. **Create a free account** — sign up with your school email
3. **Confirm your email** using the link we send you
4. **Log in** and start browsing or reporting

> 💡 **Tip:** The site works great on phones, tablets, and desktops. Use the search bar on the home page to quickly find an item, or hit **Report a Lost Item** / **Report a Found Item** right from the homepage.

### Roles

| Role | What you can do |
|------|-----------------|
| **Student** | Report lost/found items, browse listings, submit claims, track everything on your dashboard |
| **Staff** | Everything a student can do, plus moderation tools in the admin panel |
| **Admin** | Verify reports, review claims, manage users, view reports & analytics, and configure site settings |

---

## 🔄 How it works

FindBack follows four simple steps:

1. **Report It** — Lost something or found an item? Submit a report with a photo and details in under two minutes.
2. **We Verify** — Our lost & found office reviews every report to keep listings accurate and trustworthy.
3. **Find Matches** — Our smart matching system compares lost and found reports and flags possible matches.
4. **Claim & Recover** — Submit a claim with owner-only details. Once verified, collect your item from the office.

### Claiming an item

1. Open a found item's details page
2. Click **"Is this your item? · Submit Claim"**
3. Enter your student/staff ID, school email, and a short explanation
4. Add identifying details (scratches, stickers, contents, etc.) so the office can confirm it's really yours
5. Wait for the office to verify — you'll get a notification when your claim is approved

### Safety & privacy

- Only **verified** listings are shown publicly
- Claims must include **owner-only details** — contact information is kept private
- Your reports, claims, and notifications are only visible to you and school staff

---

## ✨ Features

- 🏠 **Home dashboard** — quick search, stats, and recently reported items
- 🔍 **Browse + filter** — search lost/found items by keyword, category, location, and date
- 📸 **Photo reports** — attach a photo when you report an item
- 🔔 **Notifications** — get alerted when there's news on your reports and claims
- 📊 **Personal dashboard** — track your reports, claims, and messages in one place
- 🛡️ **Admin panel** — verify listings, manage claims, users, and site settings
- 🌙 **Dark & light themes** — switch whenever you like

---

## 🛠️ For developers

**Stack:** Static HTML/CSS/vanilla JavaScript · **Supabase** (Postgres + Auth + Storage) · no build step required

### Run locally

```bash
npx serve .
```

### Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Paste the contents of [`supabase/schema.sql`](supabase/schema.sql) into the **SQL Editor** and run it (creates tables, RLS policies, triggers, storage bucket, and demo data — safe to re-run)
3. Copy your **Project URL** and **anon public** key from *Project Settings → API* into [`js/config.js`](js/config.js)
4. Deploy the whole folder to Netlify, Vercel, GitHub Pages, Cloudflare Pages, or any static host

> The anon key is **public by design** — safe to commit. Never put the `service_role` key in the browser.

### Demo accounts (for testing — change before going live!)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@campusfind.edu` | `admin123` |
| Staff | `elena.rodriguez@campusfind.edu` | `staff123` |
| Student | `james.carter@campusfind.edu` | `student123` |

Change these passwords under **Authentication → Users** in Supabase before going live.

---

## 📁 Project structure

```
├── index.html            # Home page
├── lost-items.html       # Browse lost items
├── found-items.html      # Browse found items
├── item-details.html     # Single item view + claims
├── report-lost.html      # Report a lost item
├── report-found.html     # Report a found item
├── how-it-works.html     # Step-by-step guide
├── about.html            # About the project
├── dashboard.html        # User dashboard
├── login.html / register.html
├── admin/                # Admin panel (dashboard, claims, users, reports, settings)
├── css/                  # Styles (style, dashboard, responsive)
├── js/                   # App logic (app, auth, items, claims, dashboard, admin, notifications, config)
└── supabase/schema.sql   # Database schema + RLS
```

---

*FindBack — School Lost & Found System. Built for our school community.*
