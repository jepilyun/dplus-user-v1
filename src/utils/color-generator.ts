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
  weekStartsOn?: 0 | 1; // 0: Sun, 1: Mon
  palette?: {
    // 과거
    past: string;            // 기본 과거
    pastMilestone: string;   // 100/200/300...일 단위 과거
    // 오늘~모레
    today: string;
    tomorrow: string;
    dayAfter: string;
    // 미래 구간
    thisWeek: string;
    nextWeek: string;
    thisMonth: string;
    nextMonth: string;
    thisYear: string;
    later: string;
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
    weekStartsOn = 1,
    palette = {
      past: "#45556c",
      pastMilestone: "#0f172b",
      today: "#ec003f",
      tomorrow: "#ff2056",
      dayAfter: "#ff637e",
      thisWeek: "#f54900",
      nextWeek: "#fe9a00",
      thisMonth: "#00c950",
      nextMonth: "#00a6f4",
      thisYear: "#1447e6",
      later: "#4f39f6",
    },
  } = opts;

  const today = startOfDay(new Date(todayInput));
  const target = startOfDay(new Date(date));
  const d = daysBetween(today, target); // target - today (일수)

  // 1) 과거
  if (d < 0) {
    const ad = Math.abs(d);
    return ad % 100 === 0 ? palette.pastMilestone : palette.past;
  }

  // 2) 오늘/내일/내일모레
  if (d === 0) return palette.today;
  if (d === 1) return palette.tomorrow;
  if (d === 2) return palette.dayAfter;

  // 3) 이번주/다음주
  const sw = startOfWeek(today, weekStartsOn);
  const ew = endOfWeek(today, weekStartsOn);
  const nextWStart = addDays(ew, 1);
  const nextWEnd = endOfWeek(nextWStart, weekStartsOn);

  if (target >= sw && target <= ew) return palette.thisWeek;
  if (target >= nextWStart && target <= nextWEnd) return palette.nextWeek;

  // 4) 이번달/다음달
  const tmStart = startOfMonth(today);
  const tmEnd = endOfMonth(today);
  const nmStart = startOfMonth(addMonths(today, 1));
  const nmEnd = endOfMonth(addMonths(today, 1));

  if (target >= tmStart && target <= tmEnd) return palette.thisMonth;
  if (target >= nmStart && target <= nmEnd) return palette.nextMonth;

  // 5) 올해 / 그 외(내년+)
  if (target.getFullYear() === today.getFullYear()) return palette.thisYear;
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
): { bg: string; fg: string } {
  // 1) 명시 색상 우선
  if (explicitBg) {
    const fg = explicitFg ?? readableTextColor(explicitBg);
    return { bg: explicitBg, fg };
  }

  const target = dateStr ? startOfDay(new Date(dateStr)) : startOfDay(new Date());
  const today = startOfDay(new Date());
  const d = daysBetween(today, target);

  const bg = scheduleColorForDate(target, today, {
    weekStartsOn: 1,
  });

  // 과거 또는 D0/D+1/D+2 → 흰색 텍스트 고정
  if (d < 0 || d === 0 || d === 1 || d === 2) {
    return { bg, fg: "#FFFFFF" };
  }

  // 그 외는 대비 기반으로 결정
  const fg = readableTextColor(bg);
  return { bg, fg };
}


