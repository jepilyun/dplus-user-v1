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

export function proxy(request: NextRequest) {
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

  // ✅ /today → /today/:country (먼저 체크!)
  if (firstSeg === "today" && segs.length === 1) {
    let country = getCountryCode(request).toUpperCase();
    if (!ALLOWED_COUNTRIES.includes(country)) country = "AA";
    return NextResponse.redirect(new URL(`/today/${country}`, request.url));
  }

  // ✅ /today/:country → 국가코드 검증/정규화
  if (firstSeg === "today" && segs.length >= 2) {
    const current = (segs[1] || "").toUpperCase();
    const isTwoLetters = /^[A-Z]{2}$/.test(current);
    const target =
      isTwoLetters && ALLOWED_COUNTRIES.includes(current) ? current : "AA";

    if (current !== target) {
      return NextResponse.redirect(new URL(`/today/${target}`, request.url));
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

    const isTwoLetters = /^[A-Z]{2}$/.test(current);
    const target =
      isTwoLetters && ALLOWED_COUNTRIES.includes(current) ? current : "AA";

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

  // ✅ 첫 세그먼트가 1개일 때 (루트 레벨 경로)
  if (segs.length === 1) {
    const lowerFirst = firstSeg.toLowerCase();

    // ✅ 지원되는 경로면 통과 (date, event, folder 등)
    if (SUPPORTED_PATH_PREFIXES.has(lowerFirst)) {
      return NextResponse.next();
    }

    const isTwoLetters = /^[A-Za-z]{2}$/.test(firstSeg);

    // ✅ 2글자 영문이면서 지원되는 prefix가 아닌 경우 → 국가 코드로 간주
    if (isTwoLetters) {
      const code = firstSeg.toUpperCase();
      // 허용된 국가 코드면 통과, 아니면 AA로 리다이렉트
      if (!ALLOWED_COUNTRIES.includes(code)) {
        return NextResponse.redirect(new URL(`/AA`, request.url));
      }
      return NextResponse.next();
    }

    // ✅ 2글자 영문도 아니고 지원되는 경로도 아님 → AA로 리다이렉트
    return NextResponse.redirect(new URL(`/AA`, request.url));
  }

  // ✅ 그 외 지원되는 경로면 통과 (event/xxx, folder/xxx 등)
  if (SUPPORTED_PATH_PREFIXES.has(firstSeg.toLowerCase())) {
    return NextResponse.next();
  }

  // ✅ 여기까지 왔다면 알 수 없는 경로 → AA로 리다이렉트
  return NextResponse.redirect(new URL(`/AA`, request.url));
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
