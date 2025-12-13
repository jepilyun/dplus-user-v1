/**
 * 입력된 날짜와 현재 시각의 차이를 일 단위로 계산합니다 (사용자 타임존 기준)
 * @param targetDate - 비교할 날짜 (Date 객체, 문자열, 또는 숫자)
 * @param includeTime - 시간까지 포함할지 여부 (기본값: false)
 * @returns 날짜 차이 (양수: 미래, 0: 오늘, 음수: 과거)
 */
export const calculateDaysFromToday = (
  targetDate: Date | string | number,
  includeTime: boolean = false,
): number => {
  // 현재 시각 (사용자의 로컬 타임존)
  const now = new Date();
  
  // 입력받은 날짜를 Date 객체로 변환
  const target = new Date(targetDate);

  // 날짜가 유효한지 확인
  if (isNaN(target.getTime())) {
    throw new Error("유효하지 않은 날짜입니다.");
  }

  // 시간을 포함하지 않을 경우 00:00:00으로 설정
  if (!includeTime) {
    now.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
  }

  // 밀리초 단위 차이를 일 단위로 변환
  const diffInMilliseconds = target.getTime() - now.getTime();
  const diffInDays = Math.round(diffInMilliseconds / (1000 * 60 * 60 * 24));

  return diffInDays;
};

/**
 * UTC 시간을 사용자의 로컬 타임존으로 변환하여 시간 문자열 반환
 * @param utcDateString - UTC 시간 문자열 (ISO 8601 형식)
 * @returns 로컬 시간 문자열 (HH:MM 형식), 00:00이면 undefined
 */
export const getLocalTimeFromUTC = (utcDateString: string): string | undefined => {
  if (!utcDateString) return undefined;
  
  const date = new Date(utcDateString);
  if (isNaN(date.getTime())) return undefined;
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  // ✅ 00:00이면 시간 정보 없음으로 처리
  if (hours === 0 && minutes === 0) {
    return undefined;
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * UTC 시간이 오늘인지 내일인지 판단
 * @param utcDateString - UTC 시간 문자열
 * @returns D-Day 숫자 (0: 오늘, 1: 내일, 2+: 그 이후)
 */
export const getDdayFromUTC = (utcDateString: string): number => {
  if (!utcDateString) return 0;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  const target = new Date(utcDateString);
  target.setHours(0, 0, 0, 0);
  
  const diffInMilliseconds = target.getTime() - now.getTime();
  const diffInDays = Math.round(diffInMilliseconds / (1000 * 60 * 60 * 24));
  
  return diffInDays;
};