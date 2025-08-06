import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator";
import { match } from "@formatjs/intl-localematcher";

const locales = ["en", "cn", "ja", "id", "vi", "th", "tw", "es", "ko", "fr", "it"];
const defaultLocale = "ko";

function getLocale(request: NextRequest): string {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const languages = new Negotiator({ headers }).languages();
  const matched = match(languages, locales, defaultLocale);
  return locales.includes(matched) ? matched : defaultLocale;
}

// 각 경로 유형별로 "langCode가 와야 하는 정확한 위치" 정의
const routePatterns: {
  pattern: RegExp;
  langIndex: number;
}[] = [
  { pattern: /^\/category\/[^/]+(?:\/([^/]+))?$/, langIndex: 2 },
  { pattern: /^\/city\/[^/]+(?:\/([^/]+))?$/, langIndex: 2 },
  { pattern: /^\/date\/[^/]+(?:\/([^/]+))?$/, langIndex: 2 },
  { pattern: /^\/event\/[^/]+(?:\/([^/]+))?$/, langIndex: 2 },
  { pattern: /^\/folder\/[^/]+(?:\/([^/]+))?$/, langIndex: 2 },
  { pattern: /^\/pevent\/[^/]+(?:\/([^/]+))?$/, langIndex: 2 },
  { pattern: /^\/stag\/[^/]+(?:\/([^/]+))?$/, langIndex: 2 },
  { pattern: /^\/tag\/[^/]+(?:\/([^/]+))?$/, langIndex: 2 },
  { pattern: /^\/today(?:\/([^/]+))?$/, langIndex: 1 },
  { pattern: /^\/week\/[^/]+\/[^/]+(?:\/([^/]+))?$/, langIndex: 3 },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. 정적 요청 제외
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const locale = getLocale(request);

  // 2. 루트 → 리디렉션
  if (segments.length === 0) {
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // 3. 각 route 패턴에 대해 검사
  for (const { pattern, langIndex } of routePatterns) {
    const match = pathname.match(pattern);

    if (match) {
      const langCandidate = segments[langIndex];

      // 언어 코드가 없거나, 잘못된 경우 → 리디렉션
      if (!langCandidate || !locales.includes(langCandidate)) {
        const correctedSegments = segments.slice(0, langIndex).concat(locale);
        const correctedPath = "/" + correctedSegments.join("/");

        return NextResponse.redirect(new URL(correctedPath, request.url));
      }

      return NextResponse.next(); // 올바른 언어 코드가 있을 경우
    }
  }

  // 4. /ko, /en 등은 통과
  if (locales.includes(segments[0])) {
    return NextResponse.next();
  }

  // 5. 그 외 루트 → /ko로
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
