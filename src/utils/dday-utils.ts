import { parseAndSetTime, formatDateTime } from "./date-utils";

/**
 * D-Day 표시용 날짜/시간 문자열을 생성합니다.
 * 시간이 있으면 적용하고, 없으면 자정으로 초기화합니다.
 */
export const generateDdayDatetime = (
  date: Date,
  locale: string = "ko-KR",
  time: string | null = null
): string => {
  const baseDateTime = new Date(date);
  parseAndSetTime(baseDateTime, time);
  return formatDateTime(baseDateTime, locale);
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
