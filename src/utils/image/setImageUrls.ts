// src/utils/set-image-urls.ts
import {
  TCategoryDetail,
  TCityDetail,
  TCountryDetail,
  TEventDetail,
  TFolderDetail,
  TGroupDetail,
  TStagDetail,
} from "dplus_common_v1";

import { generateStorageImageUrl } from "./generateImageUrl";

/* ========================================
 * 타입 정의
 * ======================================== */

/** 썸네일 이미지 키 */
type ThumbnailKeys =
  | "thumbnail_square"
  | "thumbnail_horizontal"
  | "thumbnail_vertical";

/** Hero 이미지 키 */
type HeroImageKeys = `hero_image_0${1 | 2 | 3 | 4 | 5}`;

/** 메인 썸네일 키 */
type ThumbnailMainKeys = `thumbnail_main_0${1 | 2 | 3 | 4 | 5}`;

/** 수직 썸네일 키 */
type ThumbnailVerticalKeys = `thumbnail_vertical_0${1 | 2 | 3 | 4 | 5}`;

/** 모든 이미지 키 */
type AllImageKeys =
  | ThumbnailKeys
  | HeroImageKeys
  | ThumbnailMainKeys
  | ThumbnailVerticalKeys;

/** 공통 이미지 필드를 가진 타입 */
type WithImageFields = Partial<Record<AllImageKeys, string | null | undefined>>;

/* ========================================
 * 키 순서 정의 (우선순위)
 * ======================================== */

/** 썸네일 우선순위 */
const THUMBNAIL_KEYS: Readonly<ThumbnailKeys[]> = [
  "thumbnail_square",
  "thumbnail_horizontal",
  "thumbnail_vertical",
] as const;

/** Hero 이미지 우선순위 */
const HERO_KEYS: Readonly<HeroImageKeys[]> = [
  "hero_image_01",
  "hero_image_02",
  "hero_image_03",
  "hero_image_04",
  "hero_image_05",
] as const;

/** 메인 썸네일 우선순위 */
const THUMBNAIL_MAIN_KEYS: Readonly<ThumbnailMainKeys[]> = [
  "thumbnail_main_01",
  "thumbnail_main_02",
  "thumbnail_main_03",
  "thumbnail_main_04",
  "thumbnail_main_05",
] as const;

/** OG 이미지 우선순위 (Thumbnail → Hero → Main) */
const OG_IMAGE_KEYS: Readonly<
  (ThumbnailKeys | HeroImageKeys | ThumbnailMainKeys)[]
> = [...THUMBNAIL_KEYS, ...HERO_KEYS, ...THUMBNAIL_MAIN_KEYS] as const;

/** 수직 썸네일 우선순위 */
const THUMBNAIL_VERTICAL_KEYS: Readonly<ThumbnailVerticalKeys[]> = [
  "thumbnail_vertical_01",
  "thumbnail_vertical_02",
  "thumbnail_vertical_03",
  "thumbnail_vertical_04",
  "thumbnail_vertical_05",
] as const;

/** 상세 페이지용 이미지 우선순위 (Hero → Main → Vertical) */
const DETAIL_IMAGE_KEYS: Readonly<
  (HeroImageKeys | ThumbnailMainKeys | ThumbnailVerticalKeys)[]
> = [...HERO_KEYS, ...THUMBNAIL_MAIN_KEYS, ...THUMBNAIL_VERTICAL_KEYS] as const;

/* ========================================
 * 헬퍼 함수
 * ======================================== */

/**
 * 이미지 경로를 절대 URL로 변환
 * @param imagePath - 상대 경로 또는 절대 URL
 * @param bucket - Supabase Storage 버킷 이름
 * @returns 절대 URL 또는 null
 */
function toAbsoluteUrl(imagePath: string, bucket: string): string | null {
  // 이미 절대 URL이면 그대로 반환
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  // 상대 경로면 Supabase Storage URL로 변환 (null 가능)
  return generateStorageImageUrl(bucket, imagePath);
}

/**
 * 엔티티에서 지정된 키들의 이미지 URL을 추출
 * @param entity - 이미지 필드를 가진 엔티티
 * @param keys - 추출할 키 목록 (우선순위 순서)
 * @param bucket - Supabase Storage 버킷 이름
 * @returns null이 제거된 절대 URL 배열
 */
function extractImageUrls<T extends WithImageFields>(
  entity: T | null | undefined,
  keys: readonly string[],
  bucket: string,
): string[] {
  if (!entity) return [];

  const validPaths: string[] = [];

  // 1단계: 유효한 문자열 경로만 추출
  for (const key of keys) {
    const value = entity[key as keyof T];
    if (typeof value === "string" && value.length > 0) {
      validPaths.push(value);
    }
  }

  // 2단계: 절대 URL로 변환 (null 제거)
  const urls: string[] = [];
  for (const path of validPaths) {
    const url = toAbsoluteUrl(path, bucket);
    if (url !== null) {
      urls.push(url);
    }
  }

  return urls;
}

/* ========================================
 * 공개 API: 범용 함수
 * ======================================== */

/**
 * 썸네일 이미지 URL 추출
 * - thumbnail_square → thumbnail_horizontal → thumbnail_vertical 순서
 */
export function getThumbnailImageUrls<T extends WithImageFields>(
  entity: T | null | undefined,
  bucket: string,
): string[] {
  return extractImageUrls(entity, THUMBNAIL_KEYS, bucket);
}

/**
 * Hero 이미지 URL 추출
 * - hero_image_01 ~ hero_image_05 순서
 */
export function getHeroImageUrls<T extends WithImageFields>(
  entity: T | null | undefined,
  bucket: string,
): string[] {
  return extractImageUrls(entity, HERO_KEYS, bucket);
}

/**
 * 상세 페이지용 이미지 URL 추출
 * - hero_image_* → thumbnail_main_* → thumbnail_vertical_* 순서
 */
export function getDetailImageUrls<T extends WithImageFields>(
  entity: T | null | undefined,
  bucket: string,
): string[] {
  return extractImageUrls(entity, DETAIL_IMAGE_KEYS, bucket);
}

/**
 * 수직 썸네일 이미지 URL 추출
 * - thumbnail_vertical_01 ~ thumbnail_vertical_05 순서
 */
export function getDetailVerticalImageUrls<T extends WithImageFields>(
  entity: T | null | undefined,
  bucket: string,
): string[] {
  return extractImageUrls(entity, THUMBNAIL_VERTICAL_KEYS, bucket);
}

/**
 * OG 이미지 URL 추출 (단일)
 * - thumbnail_square/horizontal/vertical → hero_image_* → thumbnail_main_* 순서
 * - 가장 먼저 발견된 이미지 하나만 반환
 */
export function getOgImageUrl<T extends WithImageFields>(
  entity: T | null | undefined,
  bucket: string,
): string | null {
  if (!entity) return null;

  for (const key of OG_IMAGE_KEYS) {
    const value = entity[key as keyof T];
    if (typeof value === "string" && value.length > 0) {
      const url = toAbsoluteUrl(value, bucket);
      if (url !== null) {
        return url;
      }
    }
  }

  return null;
}

/* ========================================
 * 엔티티별 래퍼 함수
 * ======================================== */

// ===== EVENT =====
export const getEventThumbnailImageUrls = (entity?: TEventDetail | null) =>
  getThumbnailImageUrls(entity, "events");

export const getEventHeroImageUrls = (entity?: TEventDetail | null) =>
  getHeroImageUrls(entity, "events");

export const getEventDetailImageUrls = (entity?: TEventDetail | null) =>
  getDetailImageUrls(entity, "events");

export const getEventDetailVerticalImageUrls = (entity?: TEventDetail | null) =>
  getDetailVerticalImageUrls(entity, "events");

export const getEventOgImageUrl = (entity?: TEventDetail | null) =>
  getOgImageUrl(entity, "events");

// ===== CITY =====
export const getCityThumbnailImageUrls = (entity?: TCityDetail | null) =>
  getThumbnailImageUrls(entity, "cities");

export const getCityHeroImageUrls = (entity?: TCityDetail | null) =>
  getHeroImageUrls(entity, "cities");

export const getCityDetailImageUrls = (entity?: TCityDetail | null) =>
  getDetailImageUrls(entity, "cities");

export const getCityDetailVerticalImageUrls = (entity?: TCityDetail | null) =>
  getDetailVerticalImageUrls(entity, "cities");

export const getCityOgImageUrl = (entity?: TCityDetail | null) =>
  getOgImageUrl(entity, "cities");

// ===== CATEGORY =====
export const getCategoryThumbnailImageUrls = (
  entity?: TCategoryDetail | null,
) => getThumbnailImageUrls(entity, "categories");

export const getCategoryHeroImageUrls = (entity?: TCategoryDetail | null) =>
  getHeroImageUrls(entity, "categories");

export const getCategoryDetailImageUrls = (entity?: TCategoryDetail | null) =>
  getDetailImageUrls(entity, "categories");

export const getCategoryDetailVerticalImageUrls = (
  entity?: TCategoryDetail | null,
) => getDetailVerticalImageUrls(entity, "categories");

export const getCategoryOgImageUrl = (entity?: TCategoryDetail | null) =>
  getOgImageUrl(entity, "categories");

// ===== STAG =====
export const getStagThumbnailImageUrls = (entity?: TStagDetail | null) =>
  getThumbnailImageUrls(entity, "stags");

export const getStagHeroImageUrls = (entity?: TStagDetail | null) =>
  getHeroImageUrls(entity, "stags");

export const getStagDetailImageUrls = (entity?: TStagDetail | null) =>
  getDetailImageUrls(entity, "stags");

export const getStagDetailVerticalImageUrls = (entity?: TStagDetail | null) =>
  getDetailVerticalImageUrls(entity, "stags");

export const getStagOgImageUrl = (entity?: TStagDetail | null) =>
  getOgImageUrl(entity, "stags");

// ===== FOLDER =====
export const getFolderThumbnailImageUrls = (entity?: TFolderDetail | null) =>
  getThumbnailImageUrls(entity, "folders");

export const getFolderHeroImageUrls = (entity?: TFolderDetail | null) =>
  getHeroImageUrls(entity, "folders");

export const getFolderDetailImageUrls = (entity?: TFolderDetail | null) =>
  getDetailImageUrls(entity, "folders");

export const getFolderDetailVerticalImageUrls = (
  entity?: TFolderDetail | null,
) => getDetailVerticalImageUrls(entity, "folders");

export const getFolderOgImageUrl = (entity?: TFolderDetail | null) =>
  getOgImageUrl(entity, "folders");

// ===== GROUP =====
export const getGroupThumbnailImageUrls = (entity?: TGroupDetail | null) =>
  getThumbnailImageUrls(entity, "groups");

export const getGroupHeroImageUrls = (entity?: TGroupDetail | null) =>
  getHeroImageUrls(entity, "groups");

export const getGroupDetailImageUrls = (entity?: TGroupDetail | null) =>
  getDetailImageUrls(entity, "groups");

export const getGroupDetailVerticalImageUrls = (entity?: TGroupDetail | null) =>
  getDetailVerticalImageUrls(entity, "groups");

export const getGroupOgImageUrl = (entity?: TGroupDetail | null) =>
  getOgImageUrl(entity, "groups");

// ===== COUNTRY (Hero만 있음) =====
export const getCountryHeroImageUrls = (entity?: TCountryDetail | null) =>
  getHeroImageUrls(entity, "countries");

export const getCountryOgImageUrl = (entity?: TCountryDetail | null) =>
  getOgImageUrl(entity, "countries");

/* ========================================
 * 레거시 호환성 (기존 코드와의 호환)
 * ======================================== */

/** @deprecated getEventDetailImageUrls 사용 권장 */
export const getEventImageUrls = getEventDetailImageUrls;

/** @deprecated getCityDetailImageUrls 사용 권장 */
export const getCityImageUrls = getCityDetailImageUrls;

/** @deprecated getCategoryDetailImageUrls 사용 권장 */
export const getCategoryImageUrls = getCategoryDetailImageUrls;

/** @deprecated getStagDetailImageUrls 사용 권장 */
export const getStagImageUrls = getStagDetailImageUrls;

/** @deprecated getFolderDetailImageUrls 사용 권장 */
export const getFolderImageUrls = getFolderDetailImageUrls;

/** @deprecated getGroupDetailImageUrls 사용 권장 */
export const getGroupImageUrls = getGroupDetailImageUrls;

/** @deprecated getCountryHeroImageUrls 사용 권장 */
export const getCountryImageUrls = getCountryHeroImageUrls;
