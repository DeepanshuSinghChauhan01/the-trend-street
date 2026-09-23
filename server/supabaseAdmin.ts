import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Load .env here too (not just in server.ts): ESM import statements evaluate
// before the importing file's own top-level code, so server.ts's dotenv.config()
// would otherwise run AFTER this module has already read process.env.
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseAdminConfigured = Boolean(
  supabaseUrl &&
  serviceRoleKey &&
  !supabaseUrl.includes('your-project') &&
  !serviceRoleKey.includes('your-service-role-key')
);

// Server-only client using the service-role key. This bypasses RLS, so every
// route that uses it (server/db.ts, requireAdmin) is responsible for its own
// authorization checks. NEVER import this file from src/ (frontend bundle).
export const supabaseAdmin: SupabaseClient = createClient(
  isSupabaseAdminConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseAdminConfigured ? serviceRoleKey : 'placeholder-service-role-key',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super('Supabase is not configured. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.');
    this.name = 'SupabaseNotConfiguredError';
  }
}

export function assertSupabaseConfigured() {
  if (!isSupabaseAdminConfigured) {
    throw new SupabaseNotConfiguredError();
  }
}
