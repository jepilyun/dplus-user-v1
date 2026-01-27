// lib/supabase-client.ts
import { SupabaseClient, createClient } from "@supabase/supabase-js";

/**
 * Supabase 설정
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 필수 환경변수 체크 (서버에서만)
if (typeof window === "undefined") {
  if (!SUPABASE_URL) {
    console.warn("⚠️ SUPABASE_URL is not defined");
  }
  if (!SUPABASE_ANON_KEY) {
    console.warn("⚠️ SUPABASE_ANON_KEY is not defined");
  }
}

// Supabase Client
let supabaseClient: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn("⚠️ SUPABASE_URL or SUPABASE_ANON_KEY is not defined");
}

export default supabaseClient;
