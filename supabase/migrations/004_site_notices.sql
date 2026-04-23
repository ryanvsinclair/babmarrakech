create table if not exists public.site_notices (
  id        int primary key default 1 check (id = 1), -- singleton row
  message   text not null default '',
  active    boolean not null default false,
  updated_at timestamptz not null default now()
);

-- seed the single row so managers never need to INSERT, only UPDATE
insert into public.site_notices (id, message, active)
values (1, '', false)
on conflict (id) do nothing;

alter table public.site_notices enable row level security;

-- anyone can read (homepage fetches this publicly)
create policy "public read site_notices"
  on public.site_notices for select
  using (true);

-- only authenticated managers can update
create policy "manager update site_notices"
  on public.site_notices for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
