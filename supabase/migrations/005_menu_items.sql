create table if not exists public.menu_items (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,
  name        text not null,
  price       text not null,
  description text,
  image_url   text,
  available   boolean not null default true,
  sort_order  int     not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.menu_items enable row level security;

create policy "public read menu_items"
  on public.menu_items for select using (true);

create policy "manager write menu_items"
  on public.menu_items for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Seed initial available items
insert into public.menu_items (category, name, price, available, sort_order) values
  ('tajine',   'Lamb Shank',  '$30', true, 1),
  ('tajine',   'Beef',        '$29', true, 2),
  ('tajine',   'Chicken',     '$27', true, 3),
  ('couscous', 'Vegetarian',  '$25', true, 1),
  ('couscous', 'Chicken',     '$28', true, 2),
  ('couscous', 'Beef',        '$30', true, 3),
  ('couscous', 'Lamb',        '$32', true, 4),
  ('bastilla', 'Chicken',     '$13', true, 1),
  ('bastilla', 'Seafood',     '$15', true, 2);

-- Storage bucket for menu photos
insert into storage.buckets (id, name, public)
  values ('menu-photos', 'menu-photos', true)
  on conflict do nothing;

create policy "public read menu-photos"
  on storage.objects for select
  using (bucket_id = 'menu-photos');

create policy "manager upload menu-photos"
  on storage.objects for insert
  with check (bucket_id = 'menu-photos' and auth.role() = 'authenticated');

create policy "manager delete menu-photos"
  on storage.objects for delete
  using (bucket_id = 'menu-photos' and auth.role() = 'authenticated');
