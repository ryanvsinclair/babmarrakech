-- Add status tracking to reservations
-- Values: null (active), 'cancelled', 'completed' (attended)
alter table public.reservations
  add column if not exists status text
  check (status in ('cancelled', 'completed'));
