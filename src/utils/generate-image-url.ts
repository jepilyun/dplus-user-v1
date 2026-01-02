// utils/generate-image-url.ts
import { SUPABASE_URL } from "@/lib/supabase-config";

/**
 * 이미지 경로를 절대 URL로 변환 (헬퍼)
 */
export function ensureAbsoluteUrl(
  path: string | null | undefined,
  bucket: string,
): string | null {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return generateStorageImageUrl(bucket, path);
}

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
