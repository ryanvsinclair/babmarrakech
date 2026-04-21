-- Restaurant tables (seating)
create table if not exists public.restaurant_tables (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  seats      smallint not null check (seats between 1 and 20),
  x          real not null default 100,
  y          real not null default 100,
  shape      text not null default 'round' check (shape in ('round', 'rect')),
  created_at timestamptz not null default now()
);

alter table public.restaurant_tables enable row level security;

create policy "public read tables"
  on public.restaurant_tables for select using (true);

create policy "managers insert tables"
  on public.restaurant_tables for insert to authenticated with check (true);

create policy "managers update tables"
  on public.restaurant_tables for update to authenticated using (true);

create policy "managers delete tables"
  on public.restaurant_tables for delete to authenticated using (true);

-- Floor elements (walls, doors, windows, bars, pillars, plants, labels)
create table if not exists public.floor_elements (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('wall','door','window','bar','pillar','plant','label')),
  x1         real not null default 0,
  y1         real not null default 0,
  x2         real,          -- end point for line elements (wall/door/window)
  y2         real,
  label      text,          -- text content for label elements
  created_at timestamptz not null default now()
);

alter table public.floor_elements enable row level security;

create policy "public read elements"
  on public.floor_elements for select using (true);

create policy "managers insert elements"
  on public.floor_elements for insert to authenticated with check (true);

create policy "managers update elements"
  on public.floor_elements for update to authenticated using (true);

create policy "managers delete elements"
  on public.floor_elements for delete to authenticated using (true);
