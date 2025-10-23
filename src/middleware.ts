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
  "category",
]);

const ALLOWED_COUNTRIES = ["AA", "KR"];

function getCountryCode(request: NextRequest): string {
  const ipCountry = request.headers.get("cf-ipcountry")?.toUpperCase();
  const acceptLang = request.headers.get("accept-language") || "";
  if (ipCountry === "KR") return "KR";
  if (acceptLang.toLowerCase().startsWith("ko")) return "KR";
  return "AA";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const segs = pathname.split("/").filter(Boolean);
  const firstSeg = segs[0];

  // 루트 → /{country}
  if (!firstSeg) {
    let country = getCountryCode(request).toUpperCase();
    if (!ALLOWED_COUNTRIES.includes(country)) country = "AA";
    return NextResponse.redirect(new URL(`/${country}`, request.url));
  }

  // ✅ /<2-letter> 형태도 국가코드로 간주해서 필터링
  if (segs.length === 1 && /^[A-Za-z]{2}$/.test(firstSeg)) {
    const code = firstSeg.toUpperCase();
    if (!ALLOWED_COUNTRIES.includes(code)) {
      return NextResponse.redirect(new URL(`/AA`, request.url));
    }
    return NextResponse.next();
  }

  // /date/:date  → /date/:date/:country(AA|KR)
  if (firstSeg === "date" && segs.length === 2) {
    const date = segs[1];
    let country = getCountryCode(request).toUpperCase();
    if (!ALLOWED_COUNTRIES.includes(country)) country = "AA";
    return NextResponse.redirect(
      new URL(`/date/${date}/${country}`, request.url),
    );
  }

  // ✅ /date/:date/:country → 국가코드 검증/정규화
  if (firstSeg === "date" && segs.length >= 3) {
    const date = segs[1];
    const current = (segs[2] || "").toUpperCase();
    const isTwoLetters = /^[A-Z]{2}$/.test(current);
    const target =
      isTwoLetters && ALLOWED_COUNTRIES.includes(current) ? current : "AA";

    if (current !== target) {
      return NextResponse.redirect(
        new URL(`/date/${date}/${target}`, request.url),
      );
    }
    return NextResponse.next();
  }

  // /category/:category  → /category/:category/:country(AA|KR)
  if (firstSeg === "category" && segs.length === 2) {
    const category = segs[1];
    let country = getCountryCode(request).toUpperCase();
    if (!ALLOWED_COUNTRIES.includes(country)) country = "AA";
    return NextResponse.redirect(
      new URL(`/category/${category}/${country}`, request.url),
    );
  }

  // ✅ /category/:category/:country  → 국가코드 검증/정규화
  if (firstSeg === "category" && segs.length >= 3) {
    const category = segs[1];
    const current = (segs[2] || "").toUpperCase();

    // 2글자 아니면/허용 외면 AA로
    const isTwoLetters = /^[A-Z]{2}$/.test(current);
    const target =
      isTwoLetters && ALLOWED_COUNTRIES.includes(current) ? current : "AA";

    // 이미 올바르면 통과, 아니면 리다이렉트
    if (current !== target) {
      return NextResponse.redirect(
        new URL(`/category/${category}/${target}`, request.url),
      );
    }
    return NextResponse.next();
  }

  // /country/:code → 허용 외 코드면 /country/AA
  if (firstSeg === "country" && segs.length === 2) {
    const code = segs[1].toUpperCase();
    if (!ALLOWED_COUNTRIES.includes(code)) {
      return NextResponse.redirect(new URL(`/country/AA`, request.url));
    }
    return NextResponse.next();
  }

  // /today → /today/:country
  if (firstSeg === "today" && segs.length === 1) {
    let country = getCountryCode(request).toUpperCase();
    if (!ALLOWED_COUNTRIES.includes(country)) country = "AA";
    return NextResponse.redirect(new URL(`/today/${country}`, request.url));
  }

  if (SUPPORTED_PATH_PREFIXES.has(firstSeg)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
