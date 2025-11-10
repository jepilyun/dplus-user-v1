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

/** hero_image_01 ~ hero_image_05 키 유니온 */
type HeroImageKeys = `hero_image_0${1 | 2 | 3 | 4 | 5}`;

/** 각 타입이 공통으로 가지는 히어로 이미지 필드의 서브셋 타입 */
type WithHeroImages = Partial<Record<HeroImageKeys, string | null | undefined>>;

/** 키 목록(순서 고정) */
const HERO_KEYS: Readonly<HeroImageKeys[]> = [
  "hero_image_01",
  "hero_image_02",
  "hero_image_03",
  "hero_image_04",
  "hero_image_05",
] as const;

/**
 * 공통 이미지 추출 유틸
 * - c가 null/undefined여도 안전하게 [] 반환
 * - 값이 존재하는 키만 필터링해서 순서대로 반환
 * - 필요하면 limit 파라미터로 최대 개수 제한 가능
 */
export function getImageUrls<T extends WithHeroImages>(
  c?: T | null,
  limit: number = HERO_KEYS.length
): string[] {
  if (!c) return [];
  return HERO_KEYS.slice(0, limit)
    .map((k) => c[k])
    .filter((v): v is string => typeof v === "string" && v.length > 0);
}

/** 아래 래퍼들은 타입만 명시하고 전부 공통 유틸로 위임 */
export const getEventImageUrls = (c?: TEventDetail | null) =>
  getImageUrls<TEventDetail>(c);

export const getFolderImageUrls = (c?: TFolderDetail | null) =>
  getImageUrls<TFolderDetail>(c);

export const getCountryImageUrls = (c?: TCountryDetail | null) =>
  getImageUrls<TCountryDetail>(c);

export const getCityImageUrls = (c?: TCityDetail | null) =>
  getImageUrls<TCityDetail>(c);

export const getCategoryImageUrls = (c?: TCategoryDetail | null) =>
  getImageUrls<TCategoryDetail>(c);

export const getStagImageUrls = (c?: TStagDetail | null) =>
  getImageUrls<TStagDetail>(c);

export const getGroupImageUrls = (c?: TGroupDetail | null) =>
  getImageUrls<TGroupDetail>(c);
