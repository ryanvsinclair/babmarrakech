import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MenuItem = {
  id: string;
  category: string;
  name: string;
  price: string;
  description: string | null;
  image_url: string | null;
  available: boolean;
  sort_order: number;
  created_at: string;
};

export type SiteNotice = {
  id: number;
  message: string;
  active: boolean;
  updated_at: string;
};

export type Reservation = {
  id: string;
  name: string;
  email: string;
  phone: string;
  party_size: number;
  date: string;      // ISO date string e.g. "2025-05-10"
  time: string;      // time string e.g. "14:30:00"
  allergies: string | null;
  notes: string | null;
  table_assignment: string | null;
  status: string | null;   // null = active, 'cancelled', 'completed'
  created_at: string;
};
