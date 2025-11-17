/**
 * ✅ 데이터 버전 생성 함수 (2시간 블록)
 * - revalidate 2시간(7200초)과 동기화
 */
export function getSessionDataVersion(): string {
  const now = Date.now();
  const twoHourBlock = Math.floor(now / (2 * 60 * 60 * 1000));
  return twoHourBlock.toString();
}