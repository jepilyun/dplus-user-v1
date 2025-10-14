import { parseAndSetTime, formatDateTime } from "./date-utils";

/**
 * D-Day 표시용 날짜/시간 문자열을 생성합니다.
 * 시간이 있으면 적용하고, 없으면 자정으로 초기화합니다.
 */
/**
 * D-Day 표시용 날짜/시간 문자열 생성
 * - time이 없으면 날짜만 출력
 * - style: 'long' | 'short' (기본 long)
 * - tz, utcMinutes로 타임존 제어 가능
 */
export const generateDdayDatetime = (
  date: Date,
  locale: string = "ko-KR",
  time: string | null = null,
  options?: {
    tz?: string | null;
    utcMinutes?: number | null;
    style?: "long" | "short";
    timeFormat?: "locale" | "12h";   // ★ 추가
    compactTime?: boolean;           // ★ 추가
  }
): string => {
  const { tz = null, utcMinutes = null, style = "long", timeFormat = "locale", compactTime = true } = options ?? {};
  const hasTime = !!time;

  const baseDateTime = new Date(date);
  if (hasTime) {
    parseAndSetTime(baseDateTime, time);
  } else {
    baseDateTime.setHours(12, 0, 0, 0); // 날짜-only 어긋남 방지
  }

  return formatDateTime(baseDateTime, locale, tz, utcMinutes, {
    includeTime: hasTime,
    style,
    timeFormat,
    compactTime,
  });
};


/**
 * 타임존/UTC 오프셋을 적용한 D-Day 날짜/시간 문자열을 생성합니다.
 */
export const generateDdayDatetimeWithTimezone = (
  date: Date,
  locale: string = "ko-KR",
  tz: string | null = null,
  utcMinutes: number | null = null,
  time: string | null = null
): string => {
  const baseDateTime = new Date(date);
  parseAndSetTime(baseDateTime, time);

  // 포맷할 때 tz/utcMinutes 직접 반영
  return formatDateTime(baseDateTime, locale, tz, utcMinutes);
};
