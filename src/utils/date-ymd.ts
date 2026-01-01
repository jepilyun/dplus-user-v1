// 날짜 비교/그룹화는 "YYYY-MM-DD" 문자열만" 사용하는 컨벤션을 유지합니다.
// 타임존은 기본값 'Asia/Seoul' 이지만, 매개변수로 주입하거나 브라우저에서 감지 가능.

export type Tz = string;

/**
 * 월 이름 다국어 지원
 */
const MONTH_NAMES = {
  en: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  ko: [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ],
} as const;

const pad2 = (n: number) => String(n).padStart(2, "0");

// 브라우저에서 사용자의 타임존 감지
export function detectBrowserTimeZone(): Tz {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

// 특정 TZ의 'Date' => YYYY-MM-DD
export function ymdFromDateInTz(d: Date, tz: Tz = "Asia/Seoul"): string {
  // trick: 주어진 순간을 tz로 표시한 문자열을 만든 뒤, 그 문자열을 다시 Date로 파싱하여
  // "그 TZ의 달/일/연"을 얻고, 그로부터 YYYY-MM-DD 생성
  const zoned = new Date(d.toLocaleString("en-US", { timeZone: tz }));
  const y = zoned.getFullYear();
  const m = pad2(zoned.getMonth() + 1);
  const day = pad2(zoned.getDate());
  return `${y}-${m}-${day}`;
}

// 오늘의 YYYY-MM-DD (in TZ)
export function todayYmdInTz(tz: Tz = "Asia/Seoul"): string {
  return ymdFromDateInTz(new Date(), tz);
}

// 주어진 YYYY-MM-DD를 해당 TZ에서 "정오(12:00)"로 간주한 'Date' 객체
// (주/월 경계 계산 시 DST 영향 완화용)
function dateAtNoonInTz(ymd: string, tz: Tz): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  // UTC 정오로 만든 뒤 tz로 표시 → 다시 Date 파싱 (로컬TZ 무관하게 안정적)
  const utcNoon = new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0));
  const shownInTz = utcNoon.toLocaleString("en-US", { timeZone: tz });
  return new Date(shownInTz);
}

// ISO 주(월~일) 범위 (YYYY-MM-DD 반환)
export function getIsoWeekBoundsYmd(nowYmd: string, tz: Tz = "Asia/Seoul") {
  const base = dateAtNoonInTz(nowYmd, tz);
  const jsDay = base.getDay(); // 0=Sun,1=Mon,...6=Sat
  const isoDay = jsDay === 0 ? 7 : jsDay; // 1=Mon,...,7=Sun

  const start = new Date(base);
  start.setDate(base.getDate() - (isoDay - 1)); // 월요일
  const end = new Date(start);
  end.setDate(start.getDate() + 6); // 일요일

  return {
    startYmd: ymdFromDateInTz(start, tz),
    endYmd: ymdFromDateInTz(end, tz),
  };
}

// 해당 월의 1일~말일 (YYYY-MM-DD 반환)
export function getMonthBoundsYmd(nowYmd: string, tz: Tz = "Asia/Seoul") {
  const base = dateAtNoonInTz(nowYmd, tz);
  const y = base.getFullYear();
  const m = base.getMonth();

  const monthStart = dateAtNoonInTz(`${y}-${pad2(m + 1)}-01`, tz);
  const monthEnd = new Date(monthStart);
  monthEnd.setMonth(monthStart.getMonth() + 1);
  monthEnd.setDate(0);

  return {
    startYmd: ymdFromDateInTz(monthStart, tz),
    endYmd: ymdFromDateInTz(monthEnd, tz),
  };
}

export function inRangeYmd(
  targetYmd: string,
  startYmd: string,
  endYmd: string,
) {
  // YYYY-MM-DD 문자열 비교 (동일 포맷 전제)
  return targetYmd >= startYmd && targetYmd <= endYmd;
}

/**
 * 날짜 범위를 짧은 형식으로 포맷 (다국어 지원)
 */
export function fmtShortRange(
  startYmd: string,
  endYmd: string,
  lang: "en" | "ko" = "en",
): string {
  const s = new Date(`${startYmd}T00:00:00`);
  const e = new Date(`${endYmd}T00:00:00`);
  const months = MONTH_NAMES[lang];

  const left = `${months[s.getMonth()]} ${s.getDate()}`;
  const right =
    s.getMonth() === e.getMonth()
      ? `${e.getDate()}`
      : `${months[e.getMonth()]} ${e.getDate()}`;

  return `${left}–${right}`;
}

/**
 * 월 이름 가져오기 (다국어 지원)
 */
function getMonthName(ymd: string, lang: "en" | "ko" = "en"): string {
  const date = new Date(`${ymd}T00:00:00`);
  const months = MONTH_NAMES[lang];
  return months[date.getMonth()];
}

/**
 * 브라우저 언어 감지
 */
export function detectBrowserLanguage(): string {
  if (typeof window === "undefined") return "en";

  const browserLang = navigator.language || navigator.languages?.[0] || "en";
  // "ko-KR" -> "ko", "en-US" -> "en"
  return browserLang.split("-")[0].toLowerCase();
}

/**
 * 섹션 레이블 다국어 지원
 */
const SECTION_LABELS = {
  en: {
    "this-week": "THIS WEEK",
    "next-week": "NEXT WEEK",
    "this-month": "THIS MONTH",
    "next-month": "NEXT MONTH",
    "this-year": "THIS YEAR",
    "next-year": "NEXT YEAR",
    later: "LATER",
  },
  ko: {
    "this-week": "이번 주",
    "next-week": "다음 주",
    "this-month": "이번 달",
    "next-month": "다음 달",
    "this-year": "올해",
    "next-year": "내년",
    later: "이후",
  },
} as const;

// type SectionKey = keyof typeof SECTION_LABELS.en;
// type Language = "en" | "ko";

/**
 * 날짜에 해당하는 섹션 정보 반환 (다국어 지원)
 */
export function getSectionForDate(
  ymd: string,
  nowYmd: string,
  tz: Tz = "Asia/Seoul",
  lang: "en" | "ko" = "en",
): { key: string; label: string; sub: string } {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(ymd)) {
    return {
      key: "later",
      label: SECTION_LABELS[lang]["later"],
      sub: "",
    };
  }

  // This Week
  const { startYmd: thisWStart, endYmd: thisWEnd } = getIsoWeekBoundsYmd(
    nowYmd,
    tz,
  );
  if (inRangeYmd(ymd, thisWStart, thisWEnd)) {
    return {
      key: "this-week",
      label: SECTION_LABELS[lang]["this-week"],
      sub: `(${fmtShortRange(thisWStart, thisWEnd)})`,
    };
  }

  // Next Week
  const nextWeekBase = new Date(`${thisWStart}T12:00:00`);
  nextWeekBase.setDate(nextWeekBase.getDate() + 7);
  const { startYmd: nextWStart, endYmd: nextWEnd } = getIsoWeekBoundsYmd(
    ymdFromDateInTz(nextWeekBase, tz),
    tz,
  );
  if (inRangeYmd(ymd, nextWStart, nextWEnd)) {
    return {
      key: "next-week",
      label: SECTION_LABELS[lang]["next-week"],
      sub: `(${fmtShortRange(nextWStart, nextWEnd, lang)})`,
    };
  }

  // This Month
  const { startYmd: thisMStart, endYmd: thisMEnd } = getMonthBoundsYmd(
    nowYmd,
    tz,
  );
  if (inRangeYmd(ymd, thisMStart, thisMEnd)) {
    // const monthName = new Date(`${thisMStart}T00:00:00`)
    //   .toLocaleString("en-US", { month: "short" })
    //   .toUpperCase();
    return {
      key: "this-month",
      label: SECTION_LABELS[lang]["this-month"],
      sub: `(${getMonthName(thisMStart, lang)})`, // ✅ 다국어 월 이름
    };
  }

  // Next Month
  const nextMonthBase = new Date(`${thisMStart}T12:00:00`);
  nextMonthBase.setMonth(nextMonthBase.getMonth() + 1);
  const { startYmd: nextMStart, endYmd: nextMEnd } = getMonthBoundsYmd(
    ymdFromDateInTz(nextMonthBase, tz),
    tz,
  );
  if (inRangeYmd(ymd, nextMStart, nextMEnd)) {
    return {
      key: "next-month",
      label: SECTION_LABELS[lang]["next-month"],
      sub: `(${getMonthName(nextMStart, lang)})`, // ✅ 다국어 월 이름
    };
  }

  // This Year / Next Year / Later
  const thisYear = nowYmd.slice(0, 4);
  const targetYear = ymd.slice(0, 4);

  if (targetYear === thisYear) {
    return {
      key: "this-year",
      label: SECTION_LABELS[lang]["this-year"],
      sub: `(${thisYear})`,
    };
  }
  if (+targetYear === +thisYear + 1) {
    return {
      key: "next-year",
      label: SECTION_LABELS[lang]["next-year"],
      sub: `(${+thisYear + 1})`,
    };
  }

  return {
    key: "later",
    label: SECTION_LABELS[lang]["later"],
    sub: "",
  };
}
