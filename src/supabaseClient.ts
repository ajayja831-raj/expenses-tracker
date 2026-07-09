import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Checking if credentials are valid and present
export const isSupabaseConfigured = 
  supabaseUrl !== '' && 
  supabaseAnonKey !== '' && 
  supabaseUrl !== 'https://your-supabase-project.supabase.co' && 
  supabaseAnonKey !== 'your-supabase-anon-public-key';

export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
);
