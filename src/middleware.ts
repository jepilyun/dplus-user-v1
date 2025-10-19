import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_PATH_PREFIXES = new Set([
  "date",
  "event",
  "folder",
  "city",
  "country",
  "stag",
  "tag",
  "today",
  "week",
  "search",
  "nearby",
  "category"
]);

/**
 * Get the country code from the request
 * @param request - NextRequest
 * @returns 
 */
function getCountryCode(request: NextRequest): string {
  const ipCountry = request.headers.get("cf-ipcountry")?.toUpperCase();
  const acceptLang = request.headers.get("accept-language") || "";
  if (ipCountry === "KR") return "KR";
  if (acceptLang.toLowerCase().startsWith("ko")) return "KR";
  return "KR";
}

/**
 * Middleware function
 * @param request - NextRequest
 * @returns 
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const segs = pathname.split("/").filter(Boolean);
  const firstSeg = segs[0];

  if (!firstSeg) {
    const country = getCountryCode(request);
    return NextResponse.redirect(new URL(`/${country}`, request.url));
  }

  if (firstSeg === "date" && segs.length === 2) {
    const date = segs[1];
    const country = getCountryCode(request);
    return NextResponse.redirect(new URL(`/date/${date}/${country}`, request.url));
  }

  if (firstSeg === "category" && segs.length === 2) {
    const category = segs[1];
    const country = getCountryCode(request);
    return NextResponse.redirect(new URL(`/category/${category}/${country}`, request.url));
  }

  if (firstSeg === "today" && segs.length === 1) {
    const country = getCountryCode(request);
    return NextResponse.redirect(new URL(`/today/${country}`, request.url));
  }

  if (firstSeg === "city") {
    return NextResponse.next();
  }

  if (SUPPORTED_PATH_PREFIXES.has(firstSeg)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
