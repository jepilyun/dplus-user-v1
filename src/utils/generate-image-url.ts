
/**
 * Event 이미지 URL 생성
 * @param path 이미지 경로
 * @returns 이미지 URL
 */
export const generateEventImageUrl = (path: string | null) => {
  if (!path) return null;
  return `https://gzfnhzdqyqzfytxkzceu.supabase.co/storage/v1/object/public/events/${path}`;
};
