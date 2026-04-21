-- Create reservations table
create table if not exists public.reservations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text not null,
  party_size  smallint not null check (party_size between 1 and 20),
  date        date not null,
  time        time not null,
  allergies   text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- Enable RLS
alter table public.reservations enable row level security;

-- Anyone (anon) can insert a reservation
create policy "Allow public inserts"
  on public.reservations
  for insert
  to anon
  with check (true);

-- Only authenticated managers can read / update / delete
create policy "Allow manager select"
  on public.reservations
  for select
  to authenticated
  using (true);

create policy "Allow manager update"
  on public.reservations
  for update
  to authenticated
  using (true);

create policy "Allow manager delete"
  on public.reservations
  for delete
  to authenticated
  using (true);

-- Authenticated users can also insert (for manual manager bookings)
create policy "Allow manager inserts"
  on public.reservations
  for insert
  to authenticated
  with check (true);
