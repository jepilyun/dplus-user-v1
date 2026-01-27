import { cookies, headers } from "next/headers";

import "server-only";

/**
 * Get the request locale
 * Priority:
 * 1) explicit param overrides (optional)
 * 2) x-full-locale / cookie(full-locale)
 * 3) Accept-Language
 * 4) default: ko-KR
 */
export async function getRequestLocale(override?: {
  langCode?: string;
  fullLocale?: string;
  countryCode?: string;
}): Promise<{
  fullLocale: string;
  langCode: string;
  baseLang: string;
  countryCode: string;
}> {
  const h = await headers();
  const c = await cookies();

  const acceptLanguage = h.get("accept-language") ?? "";

  // --- helpers ---
  const firstSeg = (v?: string | null) =>
    (v ?? "")
      .split(",")[0]
      .trim()
      .split(";")[0]
      .trim()
      .split("-")[0]
      .toLowerCase() || undefined;

  const normFull = (v?: string | null) => {
    if (!v) return undefined;
    const [lang, region] = v.split(/[-_]/);
    const L = (lang || "").toLowerCase();
    const R = (region || "").toUpperCase();
    return R ? `${L}-${R}` : L; // ex) 'en-US' or 'en'
  };

  const fromAcceptLanguage = () => {
    // very light parse: pick first token like "en-US,en;q=0.9" -> "en-US"
    const token = acceptLanguage.split(",")[0]?.trim().split(";")[0]?.trim();
    return normFull(token);
  };

  const sanitizeCountry = (v?: string | null) => {
    if (!v) return undefined;
    const up = v.toUpperCase();
    return /^[A-Z]{2}$/.test(up) ? up : undefined;
  };

  // --- base fullLocale ---
  const fullLocaleRaw =
    override?.fullLocale ??
    h.get("x-full-locale") ??
    c.get("full-locale")?.value ??
    fromAcceptLanguage() ??
    "ko-KR";

  const fullLocale = normFull(fullLocaleRaw) ?? "ko-KR";

  // --- baseLang / lang from headers ---
  const xLangRaw = h.get("x-lang") ?? c.get("lang")?.value;
  const xLang = firstSeg(xLangRaw);
  const baseFromFull = firstSeg(fullLocale) ?? "ko";

  // --- zh mapping to tw/cn ---
  const lowerFull = fullLocale.toLowerCase();
  const zhMapped = lowerFull.startsWith("zh")
    ? lowerFull.includes("-tw") ||
      lowerFull.includes("-hk") ||
      lowerFull.includes("-mo")
      ? "tw"
      : "cn"
    : undefined;

  // --- final langCode (allow explicit override first) ---
  const langCode =
    override?.langCode?.toLowerCase() ??
    zhMapped ??
    xLang ??
    baseFromFull ??
    "ko";

  const baseLang = firstSeg(langCode) ?? "ko";

  // --- country ---
  const countryFromHeaders =
    override?.countryCode ??
    h.get("x-country") ??
    c.get("country")?.value ??
    (fullLocale.includes("-") ? fullLocale.split("-")[1] : undefined);

  const countryCode = sanitizeCountry(countryFromHeaders) ?? "KR";

  return { fullLocale, langCode, baseLang, countryCode };
}
