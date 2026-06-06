import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;
let authClient: SupabaseClient | null = null;

/**
 * Retourne le client Supabase standard (sans session persistante).
 * Utilisé pour les opérations data basiques.
 */
export function getSupabaseClient(): SupabaseClient {
  if (client) return client;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase credentials not configured. " +
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
    );
  }

  client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return client;
}

/**
 * Client Supabase avec session persistante (localStorage).
 * Utilisé exclusivement pour l'authentification admin (login/logout/session).
 * Stocke le refresh token pour maintenir la session entre les tabs.
 */
export function getAuthClient(): SupabaseClient {
  if (authClient) return authClient;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase credentials not configured. " +
      "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
    );
  }

  authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: "fpay-admin-auth",
    },
  });

  return authClient;
}

export type { SupabaseClient };
