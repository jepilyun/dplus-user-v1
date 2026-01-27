// ✅ 다국어 종료 라벨
export const END_DATE_LABELS: Record<string, string> = {
  en: "End Date",
  ko: "종료일",
  ja: "終了",
  es: "Fin",
  zh: "结束",
};

// ✅ 짧은 날짜 포맷 (년도 없이, 요일 포함)
// 한국어: 1월 20일(화), 영어: Jan. 19 (Mon)
export function formatShortDate(date: Date, langCode: string): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = date.getDay();

  const weekdays: Record<string, string[]> = {
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    ko: ["일", "월", "화", "수", "목", "금", "토"],
    ja: ["日", "月", "火", "水", "木", "金", "土"],
    es: ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"],
    zh: ["日", "一", "二", "三", "四", "五", "六"],
  };

  const monthNames: Record<string, string[]> = {
    en: ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."],
    es: ["ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sep.", "oct.", "nov.", "dic."],
  };

  const wd = (weekdays[langCode] || weekdays.en)[weekday];

  switch (langCode) {
    case "ko":
      return `${month}월 ${day}일(${wd})`;
    case "ja":
      return `${month}月${day}日(${wd})`;
    case "zh":
      return `${month}月${day}日(${wd})`;
    case "en": {
      const monthName = monthNames.en[date.getMonth()];
      return `${monthName} ${day} (${wd})`;
    }
    case "es": {
      const monthName = monthNames.es[date.getMonth()];
      return `${day} ${monthName} (${wd})`;
    }
    default:
      return `${month}/${day} (${wd})`;
  }
}

// ✅ 시작 시간이 지났는지 확인 (UTC 기준)
export function isAfterStartUtc(startAtUtc: string | null | undefined): boolean {
  if (!startAtUtc) return false;
  const now = new Date();
  const start = new Date(startAtUtc);
  return now > start;
}

// ✅ D-Day 계산용 날짜 결정 (UTC 기준으로 비교, 표시용 로컬 날짜 반환)
export function getEffectiveDateForDday(
  startDate: Date | null,
  endDate: Date | null,
  startAtUtc: string | null | undefined,
  endAtUtc: string | null | undefined
): Date | null {
  if (!startDate) return null;

  const now = new Date();

  // UTC 시작 시간이 있으면 UTC로 비교
  if (startAtUtc) {
    const startUtc = new Date(startAtUtc);
    // 아직 시작 전이면 시작일 기준
    if (now <= startUtc) {
      return startDate;
    }
    // 시작 후이고 종료일이 있으면 종료일 기준
    if (endDate) {
      return endDate;
    }
    return startDate;
  }

  // UTC 시작 시간이 없으면 로컬 날짜로 비교 (기존 로직)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

  if (start >= today) {
    return startDate;
  }

  if (endDate) {
    return endDate;
  }

  return startDate;
}

// ✅ 유효한 시간 체크
export function hasValidTime(timeStr: string | null | undefined): boolean {
  return !!timeStr && timeStr.trim() !== '' && timeStr !== '00:00:00';
}
