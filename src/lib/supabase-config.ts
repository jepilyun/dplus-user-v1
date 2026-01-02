// lib/supabase-config.ts

/**
 * Supabase 설정
 * NEXT_PUBLIC_SUPABASE_URL을 우선 사용하고, 없으면 SUPABASE_URL 사용 (하위 호환성)
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// 필수 환경변수 체크
if (typeof window === "undefined") {
  // 서버에서만 체크
  if (!SUPABASE_URL) {
    console.warn("⚠️ SUPABASE_URL is not defined");
  }
  if (!SUPABASE_ANON_KEY) {
    console.warn("⚠️ SUPABASE_ANON_KEY is not defined");
  }
}
