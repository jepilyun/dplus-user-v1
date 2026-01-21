import { DplusGetListDataResponse, ResponseCountryDetailForUserFront, ResponseDplusAPI, ResponseMetadataForUserFront, TMapCountryEventWithEventInfo } from "dplus_common_v1";
import { apiUrlCountry } from "./api-url";

/**
 * Country 상세 화면 조회 for User Front
 * @param dateString
 * @param langCode
 * @param start
 * @param limit
 * @param langCode
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCountryDetail = async (
  countryCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCountryDetailForUserFront>> => {
  const res = await fetch(
    apiUrlCountry("detailGet", { countryCode, start, limit, langCode }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`country-${countryCode}`],
      },
    },
  );
  return res.json();
};

/**
 * Country 상세 화면 Events 더보기 조회 for User Front
 * @param countryCode
 * @param start
 * @param limit
 * @param langCode
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCountryEvents = async (
  countryCode: string,
  start: number,
  limit: number,
  langCode: string,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapCountryEventWithEventInfo>>
> => {
  const res = await fetch(
    apiUrlCountry("eventsGet", { countryCode, start, limit, langCode }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`country-events-${countryCode}`],
      },
    },
  );
  return res.json();
};

/**
 * Country 코드 목록 조회 for User Front
 * @returns ResponseDplusAPI<string[]>
 */
export const reqGetCountryCodes = async (): Promise<
  ResponseDplusAPI<{ country_code: string }[]>
> => {
  const res = await fetch(apiUrlCountry("getCountryCodes"), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 3600,
      tags: [`country-code-list`],
    },
  });

  return res.json();
};

/**
 * Country 메타데터 조회 for User Front
 * @param countryCode
 * @param langCode
 * @returns ResponseDplusAPI<ResponseMetadataForUserFront>
 */
export const reqGetCountryMetadata = async (
  countryCode: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseMetadataForUserFront>> => {
  const res = await fetch(
    apiUrlCountry("metadataGet", { countryCode, langCode }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 86400,
        tags: [`country-metadata-${countryCode}-${langCode}`],
      },
    },
  );
  return res.json();
};
