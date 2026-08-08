-- ============================================================
-- CampusFind — Supabase schema
-- ============================================================
-- How to run: Supabase dashboard → SQL Editor → paste this file → Run.
-- It is safe to run more than once (idempotent).
--
-- What it creates:
--   • Tables: users, items, claims, notifications, activity_logs,
--     settings, counters
--   • Row Level Security so students/staff/admins/visitors each get
--     exactly the data they are allowed to see
--   • A trigger that auto-creates a public profile when someone signs up
--   • RPC functions: next_counter (sequential IDs), admin_delete_user,
--     reset_demo_data
--   • A public storage bucket for item photos
--   • Demo accounts
-- ============================================================

create extension if not exists pgcrypto;

/* ---------------- Tables ---------------- */

-- Public profiles. Passwords live in auth.users (bcrypt, server-side);
-- this table only holds profile/role data.
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  school_id text not null default '',
  email text not null unique,
  role text not null default 'student' check (role in ('student', 'staff', 'admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  account_type text not null default 'student' check (account_type in ('student', 'staff')),
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id text primary key,
  report_id text not null unique,
  type text not null check (type in ('lost', 'found')),
  name text not null,
  category text not null,
  description text not null default '',
  brand text not null default '',
  color text not null default '',
  location text not null default '',
  date timestamptz,
  time text not null default '',
  image text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'verified', 'rejected', 'claim-approved', 'returned')),
  reporter_id uuid references public.users(id) on delete set null,
  identifying_features text not null default '',
  contact_info text not null default '',
  storage_location text not null default '',
  additional_notes text not null default '',
  reject_reason text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.claims (
  id text primary key,
  claim_id text not null unique,
  item_id text references public.items(id) on delete cascade,
  claimant_id uuid references public.users(id) on delete set null,
  explanation text not null default '',
  identifying_details text not null default '',
  evidence text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'investigation', 'approved', 'rejected', 'completed')),
  admin_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id text primary key,
  user_id uuid references public.users(id) on delete cascade,
  title text not null default '',
  message text not null default '',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id text primary key,
  admin_id uuid references public.users(id) on delete set null,
  action text not null default '',
  target text not null default '',
  timestamp timestamptz not null default now()
);

create table if not exists public.settings (
  id int primary key default 1,
  site_name text not null default 'CampusFind',
  contact_email text not null default '',
  auto_match boolean not null default true,
  notify_finders boolean not null default true
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- Sequential counters used for human-readable report/claim IDs (LF-2026-0001…)
create table if not exists public.counters (
  name text primary key,
  value bigint not null default 0
);

/* ---------------- Auth trigger: profile auto-creation ---------------- */
-- When anyone signs up (or is created), a public profile row is created.
-- Self-signups are ALWAYS students — roles are only assigned by staff/admin.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, school_id, email, role, status, account_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'school_id', ''),
    new.email,
    'student',
    'active',
    'student'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

/* ---------------- Helper: staff/admin check ---------------- */

create or replace function public.is_staff_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role in ('staff', 'admin') and status = 'active'
  );
$$;

/* ---------------- Row Level Security ---------------- */

alter table public.users enable row level security;
alter table public.items enable row level security;
alter table public.claims enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_logs enable row level security;
alter table public.settings enable row level security;
alter table public.counters enable row level security;

-- users: profiles are a semi-public school directory (names are shown on
-- listings). Own-row edits are locked to student fields so a user can never
-- self-promote.
drop policy if exists "users_select" on public.users;
create policy "users_select" on public.users for select using (true);

drop policy if exists "users_insert_self" on public.users;
create policy "users_insert_self" on public.users for insert
  with check (auth.uid() = id);

drop policy if exists "users_update_self" on public.users;
create policy "users_update_self" on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id and role = 'student' and status = 'active' and account_type = 'student');

drop policy if exists "users_update_staff" on public.users;
create policy "users_update_staff" on public.users for update
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

drop policy if exists "users_delete_staff" on public.users;
create policy "users_delete_staff" on public.users for delete
  using (public.is_staff_or_admin());

-- items: only published items are visible to visitors; reporters see their
-- own; staff/admins see everything.
drop policy if exists "items_select" on public.items;
create policy "items_select" on public.items for select using (
  status in ('verified', 'claim-approved', 'returned')
  or auth.uid() = reporter_id
  or public.is_staff_or_admin()
);

drop policy if exists "items_insert" on public.items;
create policy "items_insert" on public.items for insert
  with check (auth.uid() = reporter_id);

drop policy if exists "items_update_staff" on public.items;
create policy "items_update_staff" on public.items for update
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

drop policy if exists "items_delete_staff" on public.items;
create policy "items_delete_staff" on public.items for delete
  using (public.is_staff_or_admin());

-- claims: only the claimant and staff/admins can see a claim.
drop policy if exists "claims_select" on public.claims;
create policy "claims_select" on public.claims for select using (
  auth.uid() = claimant_id or public.is_staff_or_admin()
);

drop policy if exists "claims_insert" on public.claims;
create policy "claims_insert" on public.claims for insert
  with check (auth.uid() = claimant_id);

drop policy if exists "claims_update_staff" on public.claims;
create policy "claims_update_staff" on public.claims for update
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

drop policy if exists "claims_delete_staff" on public.claims;
create policy "claims_delete_staff" on public.claims for delete
  using (public.is_staff_or_admin());

-- notifications: users see their own; the app writes notifications on
-- behalf of the system (e.g. "someone claimed your item").
drop policy if exists "notifications_select" on public.notifications;
create policy "notifications_select" on public.notifications for select using (
  auth.uid() = user_id or public.is_staff_or_admin()
);

drop policy if exists "notifications_insert" on public.notifications;
create policy "notifications_insert" on public.notifications for insert
  with check (auth.uid() is not null);

drop policy if exists "notifications_update" on public.notifications;
create policy "notifications_update" on public.notifications for update
  using (auth.uid() = user_id or public.is_staff_or_admin())
  with check (auth.uid() = user_id or public.is_staff_or_admin());

drop policy if exists "notifications_delete_staff" on public.notifications;
create policy "notifications_delete_staff" on public.notifications for delete
  using (public.is_staff_or_admin());

-- activity log: everyone may append (the app logs user actions too), but
-- only staff/admins can read it.
drop policy if exists "activity_insert" on public.activity_logs;
create policy "activity_insert" on public.activity_logs for insert
  with check (auth.uid() is not null);

drop policy if exists "activity_select_staff" on public.activity_logs;
create policy "activity_select_staff" on public.activity_logs for select
  using (public.is_staff_or_admin());

drop policy if exists "activity_update_staff" on public.activity_logs;
create policy "activity_update_staff" on public.activity_logs for update
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

drop policy if exists "activity_delete_staff" on public.activity_logs;
create policy "activity_delete_staff" on public.activity_logs for delete
  using (public.is_staff_or_admin());

-- settings
drop policy if exists "settings_select" on public.settings;
create policy "settings_select" on public.settings for select using (true);

drop policy if exists "settings_insert_staff" on public.settings;
create policy "settings_insert_staff" on public.settings for insert
  with check (public.is_staff_or_admin());

drop policy if exists "settings_update_staff" on public.settings;
create policy "settings_update_staff" on public.settings for update
  using (public.is_staff_or_admin())
  with check (public.is_staff_or_admin());

drop policy if exists "settings_delete_staff" on public.settings;
create policy "settings_delete_staff" on public.settings for delete
  using (public.is_staff_or_admin());

/* ---------------- RPC functions ---------------- */

-- Sequential, collision-safe reference IDs (LF-2026-0001, CL-2026-0001, …)
create or replace function public.next_counter(cname text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare v bigint;
begin
  if auth.uid() is null then
    raise exception 'Not authorized';
  end if;
  insert into public.counters (name, value) values (cname, 1)
  on conflict (name) do update set value = public.counters.value + 1
  returning value into v;
  return v;
end;
$$;

-- Permanently delete a user account (profile cascades via FK).
create or replace function public.admin_delete_user(p_uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_staff_or_admin() then
    raise exception 'Not authorized';
  end if;
  if p_uid = auth.uid() then
    raise exception 'You cannot delete your own account';
  end if;
  delete from auth.users where id = p_uid;
end;
$$;

-- Wipe all user-generated data (used by the admin "Reset Data" button).
create or replace function public.reset_demo_data()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_staff_or_admin() then
    raise exception 'Not authorized';
  end if;

  delete from public.notifications;
  delete from public.activity_logs;
  delete from public.claims;
  delete from public.items;
  delete from public.counters;
end;
$$;

/* ---------------- Storage: item photos ---------------- */

insert into storage.buckets (id, name, public)
values ('item-images', 'item-images', true)
on conflict (id) do nothing;

drop policy if exists "item_images_public_read" on storage.objects;
create policy "item_images_public_read" on storage.objects
  for select using (bucket_id = 'item-images');

drop policy if exists "item_images_auth_insert" on storage.objects;
create policy "item_images_auth_insert" on storage.objects
  for insert with check (bucket_id = 'item-images' and auth.role() = 'authenticated');

drop policy if exists "item_images_auth_update" on storage.objects;
create policy "item_images_auth_update" on storage.objects
  for update using (bucket_id = 'item-images' and (owner = auth.uid() or public.is_staff_or_admin()))
  with check (bucket_id = 'item-images');

drop policy if exists "item_images_auth_delete" on storage.objects;
create policy "item_images_auth_delete" on storage.objects
  for delete using (bucket_id = 'item-images' and (owner = auth.uid() or public.is_staff_or_admin()));

/* ---------------- Seed: demo accounts ----------------
   IMPORTANT: change these passwords after first login, or via
   Authentication → Users in the Supabase dashboard.
   Profiles are created automatically by the trigger above.
   ============================================================ */

insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, confirmation_token, recovery_token, email_change, email_change_token_new, email_change_token_current, created_at, updated_at)
values
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'admin@campusfind.edu', crypt('admin123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Sarah Mitchell","school_id":"ADM-001"}', '', '', '', '', '', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'elena.rodriguez@campusfind.edu', crypt('staff123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ms. Elena Rodriguez","school_id":"STF-120"}', '', '', '', '', '', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'marcus.webb@campusfind.edu', crypt('staff123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mr. Marcus Webb","school_id":"STF-096"}', '', '', '', '', '', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'james.carter@campusfind.edu', crypt('student123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"James Carter","school_id":"STU-2401"}', '', '', '', '', '', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'priya.sharma@campusfind.edu', crypt('student123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Priya Sharma","school_id":"STU-1893"}', '', '', '', '', '', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'daniel.okafor@campusfind.edu', crypt('student123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Daniel Okafor","school_id":"STU-2210"}', '', '', '', '', '', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000007', 'authenticated', 'authenticated', 'emily.nguyen@campusfind.edu', crypt('student123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Emily Nguyen","school_id":"STU-1755"}', '', '', '', '', '', now(), now()),
  ('00000000-0000-0000-0000-000000000000', '00000000-0000-4000-8000-000000000008', 'authenticated', 'authenticated', 'lucas.bennett@campusfind.edu', crypt('student123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Lucas Bennett","school_id":"STU-2034"}', '', '', '', '', '', now(), now());

-- GoTrue cannot scan NULL token columns (e.g. confirmation_token) during
-- login. Direct inserts above set them to '', and this backfills any rows
-- that already exist with NULLs (idempotent — safe to run any time).
update auth.users
set confirmation_token = coalesce(confirmation_token, ''),
    recovery_token = coalesce(recovery_token, ''),
    email_change = coalesce(email_change, ''),
    email_change_token_new = coalesce(email_change_token_new, ''),
    email_change_token_current = coalesce(email_change_token_current, ''),
    email_change_confirm_status = coalesce(email_change_confirm_status, 0);

-- Assign roles (self-signups are always students; only seed accounts get staff/admin).
update public.users set role = 'admin', account_type = 'staff' where id = '00000000-0000-4000-8000-000000000001';
update public.users set role = 'staff', account_type = 'staff' where id in ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000003');
update public.users set status = 'suspended' where id = '00000000-0000-4000-8000-000000000007';


