-- Individual seat objects on the floor plan
create table if not exists public.restaurant_seats (
  id         uuid primary key default gen_random_uuid(),
  table_id   uuid references public.restaurant_tables(id) on delete cascade,
  x          real not null default 0,
  y          real not null default 0,
  created_at timestamptz not null default now()
);

alter table public.restaurant_seats enable row level security;

create policy "public read seats"
  on public.restaurant_seats for select using (true);

create policy "managers insert seats"
  on public.restaurant_seats for insert to authenticated with check (true);

create policy "managers update seats"
  on public.restaurant_seats for update to authenticated using (true);

create policy "managers delete seats"
  on public.restaurant_seats for delete to authenticated using (true);
