import { DplusGetListDataResponse, ResponseCategoryDetailForUserFront, ResponseDplusAPI, ResponseMetadataForUserFront, TMapCategoryEventWithEventInfo } from "dplus_common_v1";
import { apiUrlCategory } from "./api-url";

/**
 * Category 상세 화면 조회 for User Front
 * @param countryCode
 * @param categoryCode
 * @param start
 * @param limit
 * @param langCode
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCategoryDetail = async (
  countryCode: string,
  categoryCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCategoryDetailForUserFront>> => {
  const res = await fetch(
    apiUrlCategory("detailGet", {
      countryCode,
      categoryCode,
      langCode,
      start,
      limit,
    }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`category-${countryCode}-${categoryCode}`],
      },
    },
  );

  return res.json();
};

/**
 * Category 상세 화면 Events 더보기 조회 for User Front
 * @param countryCode
 * @param categoryCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCategoryEvents = async (
  countryCode: string,
  categoryCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapCategoryEventWithEventInfo>>
> => {
  const res = await fetch(
    apiUrlCategory("eventsGet", { countryCode, categoryCode, start, limit }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`category-events-${countryCode}-${categoryCode}`],
      },
    },
  );
  return res.json();
};

/**
 * Category 코드 목록 조회 for User Front
 * @returns ResponseDplusAPI<string[]>
 */
export const reqGetCategoryCodes = async (
  limit: number = 200,
): Promise<ResponseDplusAPI<{ category_code: string }[]>> => {
  const res = await fetch(apiUrlCategory("getCategoryCodes", { limit }), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 3600,
      tags: [`category-code-list`],
    },
  });

  return res.json();
};

/**
 * Category 메타데터 조회 for User Front
 * @param categoryCode
 * @param langCode
 * @returns ResponseDplusAPI<ResponseMetadataForUserFront>
 */
export const reqGetCategoryMetadata = async (
  categoryCode: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseMetadataForUserFront>> => {
  const res = await fetch(
    apiUrlCategory("metadataGet", { categoryCode, langCode }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 86400,
        tags: [`category-metadata-${categoryCode}-${langCode}`],
      },
    },
  );

  return res.json();
};
