// Muhun Leather — Supabase Client
// Singleton client instance using the public anon key.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Create and export a single Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
