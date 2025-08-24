import { ISODateInput } from "@/types";

/**
 * ISODateInput(Date | string)을 안전하게 Date 객체로 변환합니다.
 */
export const toDate = (d: ISODateInput): Date =>
  d instanceof Date ? new Date(d.getTime()) : new Date(d);

/**
 * 특정 분(minute)만큼 더한 새로운 Date 객체를 반환합니다.
 */
export const addMinutes = (d: Date, m: number): Date =>
  new Date(d.getTime() + m * 60 * 1000);

/**
 * 특정 일(days)만큼 더한 새로운 Date 객체를 반환합니다.
 * setDate를 사용하므로 월/연도 경계를 자동 처리합니다.
 */
export const addDaysToDate = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Date 객체에 시간을 설정합니다. (HH:MM 또는 HH:MM:SS)
 * null이면 00:00:00으로 초기화합니다.
 */
export const parseAndSetTime = (date: Date, time: string | null): void => {
  if (!time) {
    date.setHours(0, 0, 0, 0);
    return;
  }

  const [hours, minutes, seconds = 0] = time.split(":").map(Number);
  if (
    isNaN(hours) ||
    isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error("Invalid time format. Expected format: HH:MM or HH:MM:SS");
  }

  date.setHours(hours, minutes, isNaN(seconds) ? 0 : seconds, 0);
};

/**
 * Date 객체를 읽기 쉬운 형태의 문자열로 포맷합니다.
 * locale, timezone, UTC offset 모두 지원합니다.
 */
export const formatDateTime = (
  date: Date,
  locale: string = "ko-KR",
  tz?: string | null,
  utcMinutes?: number | null
): string => {
  let targetDate = new Date(date);

  // 1) UTC offset 적용
  if (typeof utcMinutes === "number") {
    targetDate = new Date(targetDate.getTime() + utcMinutes * 60 * 1000);
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    hourCycle: "h12",
  };
  if (tz) options.timeZone = tz;

  return new Intl.DateTimeFormat(locale, options).format(targetDate);
};

/**
 * 종일 이벤트용 날짜를 YYYYMMDD 형식으로 포맷합니다.
 */
export const formatDateAllDay = (date: ISODateInput): string => {
  const d = toDate(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
};

/**
 * 초 단위를 MM:SS 또는 HH:MM:SS 문자열로 변환합니다.
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
};

/**
 * Date/ISO 문자열을 ICS(iCalendar) 포맷(UTC, YYYYMMDDTHHmmssZ)으로 변환합니다.
 * 이미 ICS 포맷이면 그대로 반환합니다.
 */
export const formatDateToICS = (date: string | Date): string => {
  if (date instanceof Date) {
    return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  }

  // 이미 ICS 포맷인 경우
  if (/^\d{8}T\d{6}Z$/.test(date)) {
    return date;
  }

  const d = new Date(date);
  if (isNaN(d.getTime())) {
    throw new Error("Invalid date: " + date);
  }

  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};
