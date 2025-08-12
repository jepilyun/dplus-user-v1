
export const formatDateTime = (date: Date, locale: string = 'ko-KR'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    hourCycle: 'h12' // 추가: 명시적 12시간 사이클
  }).format(date);
}
