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
 * Date 객체에 시간을 설정 (HH:MM 또는 HH:MM:SS)
 * null이면 건드리지 않음 (정오 고정은 generateDdayDatetime에서 수행)
 */
export const parseAndSetTime = (date: Date, time: string | null): void => {
  if (!time) return;

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
 * Date 객체를 읽기 쉬운 문자열로 포맷
 * - includeTime이 false면 날짜만
 * - style이 short면 더 짧게
 */
export const formatDateTime = (
  date: Date,
  locale: string = "ko-KR",
  tz?: string | null,
  utcMinutes?: number | null,
  opts?: {
    includeTime?: boolean;
    style?: "long" | "short";
    timeFormat?: "locale" | "12h"; // ★ 추가
    compactTime?: boolean; // ★ 추가
  },
): string => {
  const {
    includeTime = true,
    style = "long",
    timeFormat = "locale",
    compactTime = true,
  } = opts ?? {};

  let targetDate = new Date(date);
  if (typeof utcMinutes === "number") {
    targetDate = new Date(targetDate.getTime() + utcMinutes * 60 * 1000);
  }

  // 언어 코드 추출
  const langCode = locale.toLowerCase().split('-')[0];

  // 날짜 파트
  let dateStr: string;

  if (style === "short") {
    // short 스타일: 숫자 형식
    const dateOptsShort: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const dateFmt = new Intl.DateTimeFormat(locale, {
      ...dateOptsShort,
      ...(tz ? { timeZone: tz } : {}),
    });
    dateStr = dateFmt.format(targetDate);
  } else {
    // long 스타일: 언어별 최적화
    // 한국어, 일본어, 중국어는 긴 형식 유지 (가독성 좋음)
    if (["ko", "ja", "zh", "cn", "tw"].includes(langCode)) {
      const dateOptsLong: Intl.DateTimeFormatOptions = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const dateFmt = new Intl.DateTimeFormat(locale, {
        ...dateOptsLong,
        ...(tz ? { timeZone: tz } : {}),
      });
      dateStr = dateFmt.format(targetDate);
    } else {
      // 영어 및 기타 언어: 축약형 (Thu., Jan. 22, 2026)
      const dateOptsCompact: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      const dateFmt = new Intl.DateTimeFormat(locale, {
        ...dateOptsCompact,
        ...(tz ? { timeZone: tz } : {}),
      });
      dateStr = dateFmt.format(targetDate);
    }
  }

  if (!includeTime) return dateStr;

  // 시간 파트
  let timeStr: string;
  if (timeFormat === "12h") {
    // en-US로 12시간 AM/PM 생성
    const t = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      ...(tz ? { timeZone: tz } : {}),
    }).format(targetDate); // 예: "04:00 PM" / "04:30 PM"

    if (compactTime) {
      // ":00"이면 분 제거, 공백 제거 → "4PM"
      // 분이 있으면 "4:30PM"
      const [hm, ap] = t.split(" "); // ["04:00", "PM"]
      const [h, m] = hm.split(":");
      const hour = String(Number(h)); // 앞의 0 제거
      timeStr = m === "00" ? `${hour}${ap}` : `${hour}:${m}${ap}`;
    } else {
      timeStr = t; // "04:00 PM"
    }
  } else {
    // 기존 로컬 포맷 (ko-KR이면 오후 4:00)
    const use24h = locale.toLowerCase().startsWith("ko");
    timeStr = new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !use24h,
      ...(tz ? { timeZone: tz } : {}),
    }).format(targetDate);
  }

  // 날짜 + 시간 결합
  return `${dateStr} ${timeStr}`;
};

/**
 * 시간만 포맷팅 (날짜 제외)
 * 각 언어별로 자연스러운 형식으로 표시:
 * - 한국어: "오후 5시", "오후 5:30", "오전 4시", "오전 7:20"
 * - 일본어: "午後5時", "午後5時30分", "午前4時", "午前7時20分"
 * - 중국어: "下午5时", "下午5:30", "上午4时", "上午7:20"
 * - 스페인어: "5:00 PM", "5:30 PM", "4:00 AM", "7:20 AM"
 * - 영어: "5 PM", "5:30 PM", "4 AM", "7:20 AM"
 */
export const formatTimeOnly = (
  date: Date,
  locale: string = "ko-KR",
  tz?: string | null,
  utcMinutes?: number | null,
  opts?: {
    timeFormat?: "locale" | "12h";
    compactTime?: boolean;
  },
): string => {
  const {
    timeFormat = "locale",
    compactTime = true,
  } = opts ?? {};

  let targetDate = new Date(date);
  if (typeof utcMinutes === "number") {
    targetDate = new Date(targetDate.getTime() + utcMinutes * 60 * 1000);
  }

  // 시간 값 추출
  const hours = targetDate.getHours();
  const minutes = targetDate.getMinutes();

  // 언어 코드 추출 (ko-KR -> ko)
  const langCode = locale.toLowerCase().split('-')[0];

  if (timeFormat === "12h" || compactTime) {
    // 12시간 형식으로 변환
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const isPM = hours >= 12;

    // 언어별 포맷
    switch (langCode) {
      case "ko": {
        // 한국어: "오후 5시", "오후 5:30"
        const period = isPM ? "오후" : "오전";
        if (minutes === 0) {
          return `${period} ${hour12}시`;
        }
        return `${period} ${hour12}:${minutes.toString().padStart(2, "0")}`;
      }

      case "ja": {
        // 일본어: "午後5時", "午後5時30分"
        const period = isPM ? "午後" : "午前";
        if (minutes === 0) {
          return `${period}${hour12}時`;
        }
        return `${period}${hour12}時${minutes}分`;
      }

      case "zh": {
        // 중국어: "下午5时", "下午5:30"
        const period = isPM ? "下午" : "上午";
        if (minutes === 0) {
          return `${period}${hour12}时`;
        }
        return `${period}${hour12}:${minutes.toString().padStart(2, "0")}`;
      }

      case "es": {
        // 스페인어: "5:00 PM", "5:30 PM"
        const period = isPM ? "PM" : "AM";
        return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
      }

      default: {
        // 영어 및 기타: "5 PM", "5:30 PM"
        const period = isPM ? "PM" : "AM";
        if (minutes === 0) {
          return `${hour12} ${period}`;
        }
        return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
      }
    }
  }

  // locale 기반 시간 (fallback)
  const use24h = locale.toLowerCase().startsWith("ko");
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: !use24h,
    ...(tz ? { timeZone: tz } : {}),
  }).format(targetDate);
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
