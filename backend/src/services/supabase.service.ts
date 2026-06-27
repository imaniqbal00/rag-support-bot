import { createClient } from '@supabase/supabase-js';
import { config } from '../config';

// Service-role client — bypasses RLS, used only in backend
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseServiceRoleKey,
  { auth: { persistSession: false } }
);
