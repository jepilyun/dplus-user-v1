// utils/generate-image-url.ts
import { SUPABASE_URL } from '@/lib/supabase-config';

/**
 * Storage 이미지 URL 생성
 * @param bucket 버킷 이름
 * @param path 이미지 경로
 * @returns 이미지 URL
 */
export const generateStorageImageUrl = (
  bucket: string,
  path: string | null,
): string | null => {
  if (!path) return null;
  
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
};