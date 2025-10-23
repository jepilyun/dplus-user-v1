/**
 * 입력된 날짜와 오늘 날짜의 차이를 일 단위로 계산합니다.
 * @param targetDate - 비교할 날짜 (Date 객체, 문자열, 또는 숫자)
 * @returns 날짜 차이 (양수: 미래, 0: 오늘, 음수: 과거)
 */
export const calculateDaysFromToday = (
  targetDate: Date | string | number,
): number => {
  // 오늘 날짜 (시간은 00:00:00으로 설정)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 입력받은 날짜를 Date 객체로 변환하고 시간을 00:00:00으로 설정
  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  // 날짜가 유효한지 확인
  if (isNaN(target.getTime())) {
    throw new Error("유효하지 않은 날짜입니다.");
  }

  // 밀리초 단위 차이를 일 단위로 변환
  const diffInMilliseconds = target.getTime() - today.getTime();
  const diffInDays = Math.round(diffInMilliseconds / (1000 * 60 * 60 * 24));

  return diffInDays;
};

// // 사용 예시
// console.log('=== 날짜 차이 계산 예시 ===');

// const today = new Date();
// console.log(`오늘 날짜: ${today.toLocaleDateString()}`);

// // 다양한 날짜 형식으로 테스트
// const testDates = [
//   new Date(today.getTime() - 24 * 60 * 60 * 1000), // 어제
//   new Date(), // 오늘
//   new Date(today.getTime() + 24 * 60 * 60 * 1000), // 내일
//   new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // 모레
//   '2024-12-25', // 문자열 형식
//   '2024-01-01', // 과거 날짜
// ];

// testDates.forEach(date => {
//   try {
//     const days = calculateDaysFromToday(date);
//     const dateStr = new Date(date).toLocaleDateString();
//     console.log(`${dateStr}: ${days}일 ${days > 0 ? '후' : days < 0 ? '전' : '(오늘)'}`);
//   } catch (error) {
//     console.error(`날짜 계산 오류: ${error}`);
//   }
// });

// // 더 많은 사용 예시
// console.log('\n=== 추가 예시 ===');
// console.log(`내일: ${calculateDaysFromToday(addDays(new Date(), 1))}일`);
// console.log(`일주일 후: ${calculateDaysFromToday(addDays(new Date(), 7))}일`);
// console.log(`한 달 전: ${calculateDaysFromToday(addDays(new Date(), -30))}일`);
