/**
 * 도시 이미지 URL 생성
 * @param cityCode 도시 코드
 * @param path 이미지 경로
 * @returns 이미지 URL
 */
export const generateCityImageUrl = (path: string | null) => {
  if (!path) return null;
  return `https://aheyxxwhjwzgakynwmxj.supabase.co/storage/v1/object/public/cities/${path}`;
};

/**
 * 거리 이미지 URL 생성
 * @param path 이미지 경로
 * @returns 이미지 URL
 */
export const generateStreetImageUrl = (path: string | null) => {
  if (!path) return null;
  return `https://aheyxxwhjwzgakynwmxj.supabase.co/storage/v1/object/public/streets/${path}`;
};

/**
 * 카테고리 이미지 URL 생성
 * @param path 이미지 경로
 * @returns 이미지 URL
 */
export const generateCategoryImageUrl = (path: string | null) => {
  if (!path) return null;
  return `https://aheyxxwhjwzgakynwmxj.supabase.co/storage/v1/object/public/categories/${path}`;
};

/**
 * 스테이지 이미지 URL 생성
 * @param path 이미지 경로
 * @returns 이미지 URL
 */
export const generateStagImageUrl = (path: string | null) => {
  if (!path) return null;
  return `https://aheyxxwhjwzgakynwmxj.supabase.co/storage/v1/object/public/stags/${path}`;
};

/**
 * 콘텐츠 이미지 URL 생성
 * @param path 이미지 경로
 * @returns 이미지 URL
 */
export const generateContentImageUrl = (path: string | null) => {
  if (!path) return null;
  return `https://aheyxxwhjwzgakynwmxj.supabase.co/storage/v1/object/public/contents/${path}`;
};
