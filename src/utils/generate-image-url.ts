/**
 * Event 이미지 URL 생성
 * @param bucket 버킷 이름
 * @param path 이미지 경로
 * @returns 이미지 URL
 */
export const generateStorageImageUrl = (
  bucket: string,
  path: string | null,
) => {
  if (!path) return null;
  return `https://gzfnhzdqyqzfytxkzceu.supabase.co/storage/v1/object/public/${bucket}/${path}`;
};
