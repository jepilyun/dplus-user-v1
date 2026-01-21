import { DplusGetListDataResponse, ResponseCityDetailForUserFront, ResponseDplusAPI, ResponseMetadataForUserFront, TMapCityEventWithEventInfo } from "dplus_common_v1";
import { apiUrlCity } from "./api-url";

/**
 * City 상세 화면 조회 for User Front
 * @param dateString
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCityDetail = async (
  cityCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCityDetailForUserFront>> => {
  const res = await fetch(
    apiUrlCity("detailGet", { cityCode, langCode, start, limit }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`city-${cityCode}-${langCode}`],
      },
    },
  );
  return res.json();
};

/**
 * City 상세 화면 조회 for User Front
 * @param cityCode
 * @param start
 * @param limit
 * @param langCode
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCityEvents = async (
  cityCode: string,
  start: number,
  limit: number,
  langCode: string,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapCityEventWithEventInfo>>
> => {
  const res = await fetch(
    apiUrlCity("eventsGet", { cityCode, start, limit, langCode }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`city-events-${cityCode}`],
      },
    },
  );
  return res.json();
};

/**
 * City 코드 목록 조회 for User Front
 * @returns ResponseDplusAPI<string[]>
 */
export const reqGetCityCodes = async (
  limit: number = 100,
): Promise<ResponseDplusAPI<{ city_code: string }[]>> => {
  const res = await fetch(apiUrlCity("getCityCodes", { limit }), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 3600,
      tags: [`city-code-list`],
    },
  });

  return res.json();
};

/**
 * City 메타데이터 조회 for User Front
 * @param cityCode
 * @param langCode
 * @returns ResponseDplusAPI<ResponseMetadataForUserFront>
 */
export const reqGetCityMetadata = async (
  cityCode: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseMetadataForUserFront>> => {
  const res = await fetch(apiUrlCity("metadataGet", { cityCode, langCode }), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 86400,
      tags: [`city-metadata-${cityCode}-${langCode}`],
    },
  });
  return res.json();
};
