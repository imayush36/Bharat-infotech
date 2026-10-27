-- Bharat Infotechs shared live sync: run this in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table if not exists public.page_visits (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  session_id text not null,
  visited_at timestamptz not null default now()
);
create index if not exists page_visits_visited_at_idx on public.page_visits(visited_at desc);
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  service text not null,
  message text,
  page_url text,
  created_at timestamptz not null default now()
);
create index if not exists enquiries_created_at_idx on public.enquiries(created_at desc);
create table if not exists public.marketing_banners (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  target_url text,
  media_url text,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
create table if not exists public.seo_metadata (
  page text primary key,
  title text not null default '',
  description text not null default '',
  canonical_url text not null default '',
  keywords text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create or replace function public.is_bi_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_bi_admin() from public;
grant execute on function public.is_bi_admin() to anon, authenticated;

alter table public.admin_users enable row level security;
alter table public.page_visits enable row level security;
alter table public.enquiries enable row level security;
alter table public.marketing_banners enable row level security;
alter table public.seo_metadata enable row level security;

drop policy if exists "admin can read own admin flag" on public.admin_users;
create policy "admin can read own admin flag" on public.admin_users for select to authenticated using (user_id = auth.uid());
drop policy if exists "public can record page visits" on public.page_visits;
create policy "public can record page visits" on public.page_visits for insert to anon, authenticated with check (length(page) <= 500 and length(session_id) <= 100);
drop policy if exists "admins can read visits" on public.page_visits;
create policy "admins can read visits" on public.page_visits for select to authenticated using (public.is_bi_admin());
drop policy if exists "public can submit enquiries" on public.enquiries;
create policy "public can submit enquiries" on public.enquiries for insert to anon, authenticated with check (length(name) between 1 and 100 and length(service) between 1 and 160 and coalesce(length(message),0) <= 2000);
drop policy if exists "admins can read enquiries" on public.enquiries;
create policy "admins can read enquiries" on public.enquiries for select to authenticated using (public.is_bi_admin());
drop policy if exists "public can read enabled banners" on public.marketing_banners;
create policy "public can read enabled banners" on public.marketing_banners for select to anon, authenticated using (enabled = true or public.is_bi_admin());
drop policy if exists "admins manage banners" on public.marketing_banners;
create policy "admins manage banners" on public.marketing_banners for all to authenticated using (public.is_bi_admin()) with check (public.is_bi_admin());
drop policy if exists "admins manage seo metadata" on public.seo_metadata;
create policy "admins manage seo metadata" on public.seo_metadata for all to authenticated using (public.is_bi_admin()) with check (public.is_bi_admin());

-- Enable Realtime for live admin updates (ignore duplicate-publication errors if already added).
do $$ begin
  alter publication supabase_realtime add table public.page_visits;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.enquiries;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.marketing_banners;
exception when duplicate_object then null; when undefined_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.seo_metadata;
exception when duplicate_object then null; when undefined_object then null; end $$;


-- Safe upgrades for projects that already ran an earlier version of this SQL.
alter table public.marketing_banners add column if not exists media_url text;

-- Shared career applications; only approved admins can read/update applications.
create table if not exists public.career_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  role text not null,
  portfolio_url text,
  resume_url text,
  message text,
  status text not null default 'new' check (status in ('new','reviewing','shortlisted','rejected','hired')),
  created_at timestamptz not null default now()
);
create index if not exists career_applications_created_at_idx on public.career_applications(created_at desc);
alter table public.career_applications enable row level security;
drop policy if exists "public can submit career applications" on public.career_applications;
create policy "public can submit career applications" on public.career_applications
 for insert to anon, authenticated with check (
  length(name) between 1 and 100 and length(email) between 3 and 160 and length(role) between 1 and 160
  and coalesce(length(message),0)<=2000 and coalesce(length(portfolio_url),0)<=500 and coalesce(length(resume_url),0)<=1000
 );
drop policy if exists "admins can read career applications" on public.career_applications;
create policy "admins can read career applications" on public.career_applications for select to authenticated using (public.is_bi_admin());
drop policy if exists "admins can update career applications" on public.career_applications;
create policy "admins can update career applications" on public.career_applications for update to authenticated using (public.is_bi_admin()) with check (public.is_bi_admin());
do $$ begin alter publication supabase_realtime add table public.career_applications;
exception when duplicate_object then null; when undefined_object then null; end $$;
