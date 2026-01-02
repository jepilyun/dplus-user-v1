// lib/supabase.ts
import { SupabaseClient, createClient } from "@supabase/supabase-js";

import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./supabase-config";

let supabaseClient: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn("⚠️ SUPABASE_URL or SUPABASE_ANON_KEY is not defined");
}

export default supabaseClient;
