-- Add table assignment tracking to reservations
alter table public.reservations
  add column if not exists table_assignment text;
