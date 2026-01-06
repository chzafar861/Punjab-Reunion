import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.warn('Supabase environment variables not set. Authentication may not work.');
}

export const supabase = supabaseClient || createClient(
  'https://placeholder.supabase.co',
  'placeholder-key'
);

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);
