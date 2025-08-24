import { NextRequest, NextResponse } from "next/server";
import Negotiator from "negotiator";
import { match as localeMatch } from "@formatjs/intl-localematcher";

// 지원하는 언어 목록
const locales = ["en", "cn", "ja", "id", "vi", "th", "tw", "es", "ko", "fr", "it"];
const defaultLocale = "ko";
const LOCALE_COOKIE = "full-locale";

/**
 * Accept-Language 헤더를 기반으로 기본 언어 코드를 추출
 * @param request - NextRequest 객체
 * @returns 기본 언어 코드 (예: "ko", "en")
 */
const getBaseLocale = (request: NextRequest): string => {
  // 쿠키에서 언어 설정 확인 (사용자가 명시적으로 선택한 언어가 있다면 우선 사용)
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale) {
    try {
      const baseFromCookie = new Intl.Locale(cookieLocale).language;
      if (locales.includes(baseFromCookie)) {
        return baseFromCookie;
      }
    } catch {
      // 쿠키 값이 유효하지 않은 경우 무시하고 헤더로 진행
    }
  }

  // Accept-Language 헤더에서 언어 추출
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => (headers[key] = value));
  const languages = new Negotiator({ headers }).languages();
  const matched = localeMatch(languages, locales, defaultLocale);

  return locales.includes(matched) ? matched : defaultLocale;
}

/**
 * Accept-Language 헤더에서 전체 로케일 정보 추출 (언어-지역 코드)
 * @param request - NextRequest 객체
 * @returns 전체 로케일 코드 (예: "ko-KR", "en-US")
 */
const getFullLocale = (request: NextRequest): string => {
  // 쿠키에서 전체 로케일 확인
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale) {
    try {
      return new Intl.Locale(cookieLocale).toString();
    } catch {
      // 쿠키 값이 유효하지 않은 경우 헤더로 진행
    }
  }

  // Accept-Language 헤더에서 전체 로케일 추출
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => (headers[key] = value));
  const languages = new Negotiator({ headers }).languages(); // 예: ["ko-KR","en-US",...]
  const first = languages[0] || "ko-KR";
  
  try {
    // 정규화 (예: "ko-kr" → "ko-KR")
    return new Intl.Locale(first).toString();
  } catch {
    return first;
  }
}

/**
 * 요청 헤더에 로케일 정보를 추가하여 새로운 헤더 객체 생성
 * @param request - 원본 NextRequest 객체
 * @param fullLocale - 전체 로케일 코드
 * @param baseLocale - 기본 언어 코드
 * @returns 로케일 헤더가 추가된 Headers 객체
 */
const buildRequestHeaders = (request: NextRequest, fullLocale: string, baseLocale: string): Headers => {
  const headers = new Headers(request.headers);
  headers.set("x-full-locale", fullLocale);  // 전체 로케일 (ko-KR, en-US 등)
  headers.set("x-lang", baseLocale);         // 기본 언어 (ko, en 등)
  headers.set("x-locale-source", "header");  // 로케일 소스 표시 (디버깅용)
  return headers;
}

/**
 * 미들웨어 메인 함수
 * URL 경로는 그대로 유지하고 헤더에만 로케일 정보를 추가
 */
export const middleware = (request: NextRequest): NextResponse => {
  const { pathname } = request.nextUrl;

  // 정적 파일, API 엔드포인트, Next.js 내부 경로는 미들웨어 처리 제외
  if (
    pathname.startsWith("/_next") ||     // Next.js 내부 파일
    pathname.startsWith("/api") ||       // API 라우트
    pathname.includes(".") ||            // 정적 파일 (이미지, CSS, JS 등)
    pathname.startsWith("/favicon")      // 파비콘
  ) {
    return NextResponse.next();
  }

  // 브라우저의 Accept-Language 헤더 또는 쿠키에서 로케일 정보 추출
  const baseLocale = getBaseLocale(request);  // 예: "ko"
  const fullLocale = getFullLocale(request);  // 예: "ko-KR"

  // 요청 헤더에 로케일 정보 추가하여 페이지/API에서 사용할 수 있도록 설정
  const requestHeaders = buildRequestHeaders(request, fullLocale, baseLocale);
  
  // 응답 생성 (URL 경로는 변경하지 않고 헤더만 추가)
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // 사용자의 로케일 설정을 쿠키에 저장 (30일 유지)
  response.cookies.set(LOCALE_COOKIE, fullLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production", // 프로덕션에서만 secure 쿠키
  });

  return response;
}

// 미들웨어가 실행될 경로 패턴 설정
export const config = {
  matcher: [
    // 다음 경로들을 제외한 모든 경로에서 미들웨어 실행
    "/((?!_next|favicon.ico|.*\\..*|api).*)"
  ],
};