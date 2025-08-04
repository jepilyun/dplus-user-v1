/**
 * 개발 환경에서 응답 데이터 크기와 내용을 로깅하는 함수
 * @param apiResponse - 로깅할 응답 데이터
 */
export const devLogResponse = (apiResponse: object) => {
  const jsonStr = JSON.stringify(apiResponse);
  const sizeInBytes = new TextEncoder().encode(jsonStr).length;
  const sizeInKB = (sizeInBytes / 1024).toFixed(2);

  console.log('📦 API Response Size:', sizeInKB + ' KB');
  console.log('📝 API Response:', apiResponse);
}