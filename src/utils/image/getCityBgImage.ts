import { TCityInfoForCountryDetail } from "dplus_common_v1";

import { generateStorageImageUrl } from "./generateImageUrl";

// 우선, 우선순위대로 첫 이미지를 고르는 헬퍼
export function getCityBgUrl(item: TCityInfoForCountryDetail): string | null {
  const candidates = [
    item.thumbnail_square,
    item.thumbnail_horizontal,
    item.thumbnail_vertical,
    item.hero_image_01,
    item.hero_image_02,
    item.hero_image_03,
    item.hero_image_04,
    item.hero_image_05,
  ].filter((v): v is string => !!v && v.trim().length > 0);

  return generateStorageImageUrl("cities", candidates[0]) ?? null;
}
