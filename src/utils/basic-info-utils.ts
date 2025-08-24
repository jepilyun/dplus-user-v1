/**
 * 절대 경로로 변환
 * @param input 경로
 * @returns 절대 경로
 */
export const toAbsoluteUrl = (input: string) =>
  /^https?:\/\//i.test(input) ? input : `https://${input}`;

/**
 * 유튜브 채널 링크 생성
 * @param id 유튜브 채널 ID
 * @returns 유튜브 채널 링크
 */
export const toYoutubeChannelUrl = (id: string) => {
  if (!id) return "";
  if (/^https?:\/\//i.test(id)) return id;
  if (id.startsWith("@")) return `https://www.youtube.com/${id}`;
  return `https://www.youtube.com/channel/${id}`;
};

/**
 * 인스타그램 링크 생성
 * @param id 인스타그램 ID
 * @returns 인스타그램 링크
 */
export const toInstagramUrl = (id: string) => {
  if (!id) return "";
  if (/^https?:\/\//i.test(id)) return id;
  return `https://www.instagram.com/${id.replace(/^@/, "")}`;
};

/**
 * 전화번호 링크 생성
 * @param phone 전화번호
 * @returns 전화번호 링크
 */
export const toTelUrl = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;

/**
 * 이메일 링크 생성
 * @param email 이메일
 * @returns 이메일 링크
 */
export const toMailUrl = (email: string) => `mailto:${email}`;
