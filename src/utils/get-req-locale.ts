import "server-only";
import { headers, cookies } from "next/headers";

export function getRequestLocale() {
  const h = headers();
  const c = cookies();

  const fullLocale = h.get("x-full-locale") ?? c.get("full-locale")?.value ?? "ko-KR";
  const baseFromHeader = h.get("x-lang") ?? fullLocale.split("-")[0].toLowerCase();

  // zh 분기 → cn/tw 맵핑 (원하던 규칙)
  const lower = fullLocale.toLowerCase();
  const langCode =
    lower.startsWith("zh")
      ? (lower.includes("tw") || lower.includes("hk") || lower.includes("mo") ? "tw" : "cn")
      : baseFromHeader;

  return { fullLocale, langCode, baseLang: baseFromHeader };
}