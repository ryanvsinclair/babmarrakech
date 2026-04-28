create table if not exists public.large_party_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  used boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.large_party_codes enable row level security;

-- Anyone can read (needed to validate codes on public booking page)
create policy "public_select" on public.large_party_codes
  for select using (true);

-- Only authenticated (manager) can create codes
create policy "auth_insert" on public.large_party_codes
  for insert with check (auth.role() = 'authenticated');

-- Authenticated can update/delete (manager management)
create policy "auth_update" on public.large_party_codes
  for update using (auth.role() = 'authenticated');

create policy "auth_delete" on public.large_party_codes
  for delete using (auth.role() = 'authenticated');

-- Public booking page can flip used = false → true (consume the code)
create policy "public_consume" on public.large_party_codes
  for update using (used = false) with check (used = true);
