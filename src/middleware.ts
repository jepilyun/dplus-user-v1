import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";

const locales = ["en", "cn", "ja", "id", "vi", "th", "tw"];
const defaultLocale = "en";
const defaultCity = "seoul";

/**
 * 현재 요청의 언어 코드를 반환
 * @param request 요청 객체
 * @returns 언어 코드
 */
function getLocale(request: NextRequest): string {
  const headers: Record<string, string> = {};

  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const languages = new Negotiator({ headers }).languages();
  const matched = match(languages, locales, defaultLocale);

  // 명시적으로 fallback 처리
  if (!locales.includes(matched)) {
    return defaultLocale;
  }

  return matched;
}

/**
 * 미들웨어 함수
 * @param request 요청 객체
 * @returns 응답 객체
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 정적 경로 제외
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // favicon.ico, .css 등
  ) {
    return NextResponse.next();
  }

  const locale = getLocale(request);

  // 2. / → /{langCode}
  if (pathname === "/") {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // 3. /city → /city/seoul/{langCode}
  if (pathname === "/city") {
    return NextResponse.redirect(new URL(`/city/${defaultCity}/${locale}`, request.url));
  }

  // 4. /city/seoul → /city/seoul/{langCode}
  const cityMatch = pathname.match(/^\/city\/([^/]+)(\/)?$/);

  if (cityMatch) {
    const cityCode = cityMatch[1];
    return NextResponse.redirect(new URL(`/city/${cityCode}/${locale}`, request.url));
  }

  // 5. /city/seoul/en → 유효하면 통과, 아니면 리디렉션
  const cityLangMatch = pathname.match(/^\/city\/([^/]+)\/([^/]+)/);

  if (cityLangMatch) {
    const cityCode = cityLangMatch[1];
    const langCode = cityLangMatch[2];

    if (locales.includes(langCode)) {
      return NextResponse.next();
    }

    // 언어 코드가 유효하지 않으면 리디렉션
    return NextResponse.redirect(new URL(`/city/${cityCode}/${defaultLocale}`, request.url));
  }

  // 6. /en, /ja 등 메인 페이지 접근 → OK
  if (locales.some((lng) => pathname === `/${lng}` || pathname.startsWith(`/${lng}/`))) {
    return NextResponse.next();
  }

  // 7. 예외 처리
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
