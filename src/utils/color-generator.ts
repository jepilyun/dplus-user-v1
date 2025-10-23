/**
 * 브랜드/선명 팔레트 기반 일정 컬러 선택기
 * - D-Day(0): 브랜드 컬러 (#FD00B5)
 * - D+1, D+2: 브랜드 컬러를 점점 더 밝게
 * - 이번주: 선명한 색상 A
 * - 다음주: A보다 약간 더 밝은 톤
 * - 이번달: 선명한 색상 B
 * - 다음달: 선명한 색상 C
 * - 다다음달: 선명한 색상 D
 * - 그 외: 동일한 중립 컬러
 */
export type TScheduleColorOptions = {
  brandHex?: string; // D-Day 기준 컬러
  weekStartsOn?: 0 | 1; // 0: Sunday, 1: Monday (기본 1)
  tweaks?: {
    // 밝기 조정(포인트, 0~100)
    tomorrowLPlus?: number; // D+1
    dayAfterLPlus?: number; // D+2
    nextWeekLPlus?: number; // 다음주(이번주 대비)
  };
  palette?: {
    thisWeek: string; // 이번주
    thisMonth: string; // 이번달
    nextMonth: string; // 다음달
    monthPlus2: string; // 다다음달
    later: string; // 그 외
  };
};

/**
 * Generate a schedule color for a given date
 * @param date - The date to generate a color for
 * @param todayInput - The today's date
 * @param opts - The options for the color generation
 * @returns The schedule color
 */
export function scheduleColorForDate(
  date: Date | string | number,
  todayInput: Date | string | number = new Date(),
  opts: TScheduleColorOptions = {},
): string {
  const {
    brandHex = "#FD00B5",
    weekStartsOn = 1,
    palette = {
      thisWeek: "#00C2FF",
      thisMonth: "#00E05C",
      nextMonth: "#FF9800",
      monthPlus2: "#8E44FF",
      later: "#9AA0A6",
    },
  } = opts;

  // ✅ tweaks 필드별 기본값을 확정해두고 사용
  const {
    tomorrowLPlus = 10,
    dayAfterLPlus = 18,
    nextWeekLPlus = 12,
  } = opts.tweaks ?? {};

  const today = startOfDay(new Date(todayInput));
  const target = startOfDay(new Date(date));
  const d = daysBetween(today, target);

  if (d === 0) return brandHex;
  if (d === 1) return adjustHslLightness(brandHex, tomorrowLPlus);
  if (d === 2) return adjustHslLightness(brandHex, dayAfterLPlus);

  // 주/월 경계 계산
  const sw = startOfWeek(today, weekStartsOn);
  const ew = endOfWeek(today, weekStartsOn);
  const nextWStart = addDays(ew, 1);
  const nextWEnd = endOfWeek(nextWStart, weekStartsOn);

  const tmStart = startOfMonth(today);
  const tmEnd = endOfMonth(today);
  const nmStart = startOfMonth(addMonths(today, 1));
  const nmEnd = endOfMonth(addMonths(today, 1));
  const pm2Start = startOfMonth(addMonths(today, 2));
  const pm2End = endOfMonth(addMonths(today, 2));

  // 2) 이번주
  if (target >= sw && target <= ew) {
    return palette.thisWeek;
  }

  // 3) 다음주 (이번주 컬러보다 밝게)
  if (target >= nextWStart && target <= nextWEnd) {
    return adjustHslLightness(palette.thisWeek, nextWeekLPlus);
  }

  // 4) 이번달 (이번주/다음주 제외)
  if (target >= tmStart && target <= tmEnd) {
    return palette.thisMonth;
  }

  // 5) 다음달
  if (target >= nmStart && target <= nmEnd) {
    return palette.nextMonth;
  }

  // 6) 다다음달
  if (target >= pm2Start && target <= pm2End) {
    return palette.monthPlus2;
  }

  // 7) 나머지(그 외 먼 미래/과거)
  return palette.later;
}

/**
 * 텍스트 가독성 색상 (배경 대비)
 * - 배경이 밝으면 짙은 회색, 어두우면 흰색
 * @param bg - The background color
 * @param fallback - The fallback color
 * @returns The readable text color
 */
export function readableTextColor(bg: string, fallback: string = "#111827") {
  try {
    const { r, g, b } = toRGB(bg);
    const L = relLuminance(r, g, b);
    return L > 0.55 ? "#111827" : "#FFFFFF";
  } catch {
    return fallback;
  }
}

/**
 * Convert a color to RGB
 * @param input - The color to convert
 * @returns The RGB color
 */
function toRGB(input: string): { r: number; g: number; b: number } {
  const s = String(input).trim().toLowerCase();

  // hsl(h s% l%) or hsl(h, s%, l%)
  const hsl = s.match(/hsl\(\s*([\d.]+)[,\s]+([\d.]+)%[,\s]+([\d.]+)%\s*\)/);
  if (hsl) {
    const h = parseFloat(hsl[1]);
    const S = parseFloat(hsl[2]) / 100;
    const L = parseFloat(hsl[3]) / 100;
    const C = (1 - Math.abs(2 * L - 1)) * S;
    const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = L - C / 2;
    let r1 = 0,
      g1 = 0,
      b1 = 0;
    if (h < 60) [r1, g1, b1] = [C, X, 0];
    else if (h < 120) [r1, g1, b1] = [X, C, 0];
    else if (h < 180) [r1, g1, b1] = [0, C, X];
    else if (h < 240) [r1, g1, b1] = [0, X, C];
    else if (h < 300) [r1, g1, b1] = [X, 0, C];
    else [r1, g1, b1] = [C, 0, X];
    return {
      r: Math.round((r1 + m) * 255),
      g: Math.round((g1 + m) * 255),
      b: Math.round((b1 + m) * 255),
    };
  }

  const rgb = s.match(/rgb\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)\s*\)/);
  if (rgb) {
    return {
      r: clamp(parseFloat(rgb[1])),
      g: clamp(parseFloat(rgb[2])),
      b: clamp(parseFloat(rgb[3])),
    };
  }

  let hex = s.startsWith("#") ? s.slice(1) : s;
  if (hex.length === 3)
    hex = hex
      .split("")
      .map((ch) => ch + ch)
      .join("");
  const num = parseInt(hex, 16);
  if (!Number.isNaN(num) && hex.length === 6) {
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  // 실패 시 브랜드 컬러 사용
  return toRGB("#FD00B5");
}

/**
 * Convert RGB to HSL
 * @param r - The red component
 * @param g - The green component
 * @param b - The blue component
 * @returns The HSL color
 */
function rgbToHsl(
  r: number,
  g: number,
  b: number,
): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

/**
 * Convert HSL to hex
 * @param h - The hue component
 * @param s - The saturation component
 * @param l - The lightness component
 * @returns The hex color
 */
function hslToHex(h: number, s: number, l: number): string {
  // h:[0,360), s,l:[0,1]
  const C = (1 - Math.abs(2 * l - 1)) * s;
  const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - C / 2;
  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (h < 60) [r1, g1, b1] = [C, X, 0];
  else if (h < 120) [r1, g1, b1] = [X, C, 0];
  else if (h < 180) [r1, g1, b1] = [0, C, X];
  else if (h < 240) [r1, g1, b1] = [0, X, C];
  else if (h < 300) [r1, g1, b1] = [X, 0, C];
  else [r1, g1, b1] = [C, 0, X];
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Adjust the lightness of a color
 * @param hexOrHslOrRgb - The color to adjust
 * @param deltaLPercent - The amount to adjust the lightness
 * @returns The adjusted color
 */
function adjustHslLightness(
  hexOrHslOrRgb: string,
  deltaLPercent: number,
): string {
  const { r, g, b } = toRGB(hexOrHslOrRgb);
  const { h, s, l } = rgbToHsl(r, g, b);
  const newL = clamp01(l * 100 + deltaLPercent) / 100;
  // 채도는 살짝 보정해 선명도 유지(너무 밝으면 desat됨)
  const newS = clamp01(s * 100 + (deltaLPercent > 0 ? -2 : 0)) / 100;
  return hslToHex(h, newS, newL);
}

/**
 * Calculate the relative luminance of a color
 * @param r - The red component
 * @param g - The green component
 * @param b - The blue component
 * @returns The relative luminance
 */
function relLuminance(r: number, g: number, b: number): number {
  const lin = [r, g, b].map((v) =>
    (v /= 255) <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function clamp01(n: number) {
  return Math.max(0, Math.min(100, n));
}
function toHex(n: number) {
  return n.toString(16).padStart(2, "0");
}

// -------- 날짜 유틸 --------
function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function startOfWeek(d: Date, weekStartsOn: 0 | 1) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0=Sun
  const diff = weekStartsOn === 1 ? (day === 0 ? -6 : 1 - day) : -day;
  return addDays(x, diff);
}
function endOfWeek(d: Date, weekStartsOn: 0 | 1) {
  return addDays(startOfWeek(d, weekStartsOn), 6);
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, d.getDate());
}
function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

type BadgeColors = { bg: string; fg: string };

/**
 * Compute the badge colors for a given date
 * @param dateStr - The date to generate a color for
 * @param explicitBg - The explicit background color
 * @param explicitFg - The explicit foreground color
 * @returns The badge colors
 */
export function computeBadgeColors(
  dateStr?: string | null,
  explicitBg?: string | null,
  explicitFg?: string | null,
): BadgeColors {
  // 1) 명시 색상 우선
  if (explicitBg) {
    const fg = explicitFg ?? readableTextColor(explicitBg);
    return { bg: explicitBg, fg };
  }
  // 2) 규칙 기반 배경색
  const bg = scheduleColorForDate(
    dateStr ? new Date(dateStr) : new Date(), // 대상 날짜
    new Date(), // 오늘
    {
      brandHex: "#FD00B5", // D-Day 기준 브랜드 컬러
      weekStartsOn: 1, // 월요일 시작 (원하면 0으로)
      // 필요 시 palette/tweaks 커스터마이즈 가능
    },
  );
  const fg = readableTextColor(bg);
  return { bg, fg };
}
