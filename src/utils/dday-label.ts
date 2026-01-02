type SupportedLocale =
  | "en"
  | "id"
  | "ja"
  | "ko"
  | "th"
  | "tw"
  | "vi"
  | "zh"
  | "cn";

/**
 * 오늘 날짜와 비교하여 D-Day 라벨 생성
 * @param dday 오늘 날짜와 비교할 날짜
 * @param langCode 언어 코드 (en, id, ja, ko, th, tw, vi, zh, cn)
 * @param time 시간 (선택적, 24시간 형식 예: "17:00")
 * @returns D-Day 라벨
 */
export const getDdayLabel = (
  dday: number,
  langCode: SupportedLocale = "ko",
  time?: string,
) => {
  const labels = {
    today: {
      en: "Today",
      id: "Hari ini",
      ja: "今日",
      ko: "오늘",
      th: "วันนี้",
      tw: "今天",
      vi: "Hôm nay",
      zh: "今天",
      cn: "今天",
    },
    tomorrow: {
      en: "Tomorrow",
      id: "Besok",
      ja: "明日",
      ko: "내일",
      th: "พรุ่งนี้",
      tw: "明天",
      vi: "Ngày mai",
      zh: "明天",
      cn: "明天",
    },
    timeFormat: {
      en: (time: string) => `at ${time}`,
      id: (time: string) => `pukul ${time}`,
      ja: (time: string) => `${time}`,
      ko: (time: string) => `${time}`,
      th: (time: string) => `เวลา ${time}`,
      tw: (time: string) => `${time}`,
      vi: (time: string) => `lúc ${time}`,
      zh: (time: string) => `${time}`,
      cn: (time: string) => `${time}`,
    },
  };

  // 시간 포맷팅 헬퍼 함수
  const formatTime = (timeStr: string): string => {
    if (!timeStr) return "";

    const [hours, minutes] = timeStr.split(":").map(Number);

    switch (langCode) {
      case "en":
        const period = hours >= 12 ? "PM" : "AM";
        const hour12 = hours % 12 || 12;
        return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;

      case "ko":
        const periodKo = hours >= 12 ? "오후" : "오전";
        const hour12Ko = hours % 12 || 12;
        return `${periodKo} ${hour12Ko}시`;

      case "ja":
        const periodJa = hours >= 12 ? "午後" : "午前";
        const hour12Ja = hours % 12 || 12;
        return `${periodJa}${hour12Ja}時`;

      case "zh":
      case "cn":
        const periodZh = hours >= 12 ? "下午" : "上午";
        const hour12Zh = hours % 12 || 12;
        return `${periodZh}${hour12Zh}點`;

      case "tw":
        const periodTw = hours >= 12 ? "下午" : "上午";
        const hour12Tw = hours % 12 || 12;
        return `${periodTw}${hour12Tw}點`;

      case "id":
      case "th":
      case "vi":
      default:
        return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
    }
  };

  // D-Day === 0 (오늘)
  if (dday === 0) {
    const todayLabel = labels.today[langCode] || labels.today.en;
    if (time) {
      const formattedTime = formatTime(time);
      const timeFormatter = labels.timeFormat[langCode] || labels.timeFormat.en;
      return `${todayLabel} ${timeFormatter(formattedTime)}`;
    }
    return todayLabel;
  }

  // D-Day === 1 (내일)
  if (dday === 1) {
    const tomorrowLabel = labels.tomorrow[langCode] || labels.tomorrow.en;
    if (time) {
      const formattedTime = formatTime(time);
      const timeFormatter = labels.timeFormat[langCode] || labels.timeFormat.en;
      return `${tomorrowLabel} ${timeFormatter(formattedTime)}`;
    }
    return tomorrowLabel;
  }

  // D-Day > 1 (미래)
  if (dday > 1) {
    return `D - ${dday}`;
  }

  // D-Day < 0 (과거)
  if (dday < 0) {
    return `+ ${Math.abs(dday)}`;
  }

  return "";
};
