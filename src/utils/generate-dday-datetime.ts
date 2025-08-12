import { formatDateTime } from "./format-datetime";

/**
 * @param date - The date of the event
 * @param time - The time of the event ex "16:00:00"
 * @param tz - The timezone of the event ex "Asia/Seoul" (currently unused)
 * @param utcMinutes - The UTC minutes of the event ex 540 (currently unused)
 * @returns The datetime of the event
 */
export const generateDdayDatetime = (
  date: Date, 
  tz: string | null, 
  utcMinutes: number | null, 
  time: string | null = null, 
): string => {
  // 원본 date를 변경하지 않도록 복사
  const baseDateTime = new Date(date);
  
  // time이 있으면 시간 설정, 없으면 00:00:00
  if (time) {
    const [hours, minutes, seconds = 0] = time.split(':').map(Number);
    
    // 유효성 검사
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time format. Expected format: HH:MM or HH:MM:SS');
    }
    
    baseDateTime.setHours(hours, minutes, isNaN(seconds) ? 0 : seconds, 0);
  } else {
    baseDateTime.setHours(0, 0, 0, 0);
  }

  // 시작 시간 반환
  return formatDateTime(baseDateTime);
};

/**
 * Timezone 처리 버전
 * @param date 
 * @param tz 
 * @param utcMinutes 
 * @param time 
 * @returns 
 */
export const generateDdayDatetimeWithTimezone = (
  date: Date, 
  tz: string | null = null, 
  utcMinutes: number | null = null, 
  time: string | null = null, 
): string => {
  let baseDateTime = new Date(date);
  
  // 시간 설정
  if (time) {
    const [hours, minutes, seconds = 0] = time.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
      throw new Error('Invalid time format. Expected format: HH:MM or HH:MM:SS');
    }
    
    baseDateTime.setHours(hours, minutes, isNaN(seconds) ? 0 : seconds, 0);
  } else {
    baseDateTime.setHours(0, 0, 0, 0);
  }

  // 타임존 처리
  if (tz && typeof Intl !== 'undefined') {
    try {
      // 현재 로케일 시간을 지정된 타임존으로 변환
      const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      
      const parts = formatter.formatToParts(baseDateTime);
      const formatted = parts.reduce((acc, part) => {
        acc[part.type] = part.value;
        return acc;
      }, {} as Record<string, string>);
      
      // 타임존이 적용된 새로운 Date 객체 생성
      const tzDateTime = new Date(
        `${formatted.year}-${formatted.month}-${formatted.day}T${formatted.hour}:${formatted.minute}:${formatted.second}`
      );
      
      baseDateTime = tzDateTime;
    } catch (error: unknown) {
      console.error(error);
      console.warn(`Invalid timezone: ${tz}, using local time`);
    }
  } else if (utcMinutes !== null) {
    // utcMinutes가 제공된 경우 UTC 오프셋 적용
    const offsetMilliseconds = utcMinutes * 60 * 1000;
    baseDateTime = new Date(baseDateTime.getTime() - offsetMilliseconds);
  }

  return formatDateTime(baseDateTime);
};
