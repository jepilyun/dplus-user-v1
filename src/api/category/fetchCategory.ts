import {
  DplusGetListDataResponse,
  ResponseCategoryDetailForUserFront,
  ResponseDplusAPI,
  TMapCategoryEventWithEventInfo,
} from "dplus_common_v1";

import { apiUrlCategory } from "./apiUrlCategory";

/**
 * Category 상세 화면 조회 for User Front
 * @param countryCode
 * @param categoryCode
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponseCategoryDetailForUserFront>
 */
export const fetchGetCategoryDetail = async (
  countryCode: string,
  categoryCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCategoryDetailForUserFront>> => {
  const res = await fetch(
    apiUrlCategory.detailGet(countryCode, categoryCode, langCode, start, limit),
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
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<DplusGetListDataResponse<TMapCategoryEventWithEventInfo>>
 */
export const fetchGetCategoryEvents = async (
  countryCode: string,
  categoryCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapCategoryEventWithEventInfo>>
> => {
  const res = await fetch(
    apiUrlCategory.eventsGet(
      countryCode,
      categoryCode,
      langCode,
      start,
      limit,
    ),
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
 * @param limit
 * @returns ResponseDplusAPI<{ category_code: string }[]>
 */
export const fetchGetCategoryCodes = async (
  limit: number = 200,
): Promise<ResponseDplusAPI<{ category_code: string }[]>> => {
  const res = await fetch(apiUrlCategory.codeListGet(limit), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 3600,
      tags: [`category-code-list`],
    },
  });

  return res.json();
};

