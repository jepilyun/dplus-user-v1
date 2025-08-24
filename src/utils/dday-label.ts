/**
 * 오늘 날짜와 비교하여 D-Day 라벨 생성
 * @param dday 오늘 날짜와 비교할 날짜
 * @returns D-Day 라벨
 */
export const getDdayLabel = (dday: number) => {
  if (dday === 0) return 'Today';
  if (dday > 0) return `D - ${dday}`;
  if (dday < 0) return `+ ${Math.abs(dday)}`;
}