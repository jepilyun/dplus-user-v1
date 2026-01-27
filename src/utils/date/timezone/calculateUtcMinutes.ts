// utils/timezone/calculate-utc-minutes.ts
import { getTimezoneOffset } from 'date-fns-tz';
import { parseISO, isValid } from 'date-fns';

export function calculateUtcMinutes(
  date: string | null | undefined,
  time: string | null | undefined,
  timezone: string | null | undefined
): number {
  if (!date || !timezone) {
    console.warn('calculateUtcMinutes: Missing required parameters');
    return 0;
  }
  
  try {
    const normalizedTime = time?.trim() || '00:00:00';
    const dateTimeStr = `${date}T${normalizedTime}`;
    const eventDateTime = parseISO(dateTimeStr);
    
    if (!isValid(eventDateTime)) {
      console.warn('calculateUtcMinutes: Invalid date/time');
      return 0;
    }
    
    // ✅ 부호 제거 - getTimezoneOffset이 이미 올바른 부호 반환
    const offsetMs = getTimezoneOffset(timezone, eventDateTime);
    const offsetMinutes = offsetMs / (1000 * 60);

    return Math.round(offsetMinutes);
  } catch (error) {
    console.error('calculateUtcMinutes error:', error);
    return 0;
  }
}