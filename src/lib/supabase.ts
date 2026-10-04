import { createClient } from '@supabase/supabase-js';

// The anon (publishable) key is meant to ship in the browser; row-level security
// in supabase/schema.sql is what protects the data.
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://aamkkfymwjedtyhgsmca.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qUUd3GXwGiSkvddI-6TmHw_ZEZ4INy3';

export const isSupabaseConfigured = SUPABASE_ANON_KEY.length > 0;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || 'missing-anon-key', {
  // PKCE lets the Android app finish Google sign-in from a deep link.
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
});
