import {
  DplusGetListDataResponse,
  ResponseCountryDetailForUserFront,
  ResponseDplusAPI,
  TMapCountryEventWithEventInfo,
} from "dplus_common_v1";

import { apiUrlCountry } from "./apiUrlCountry";

/**
 * Country 상세 화면 조회 for User Front
 * @param countryCode
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponseCountryDetailForUserFront>
 */
export const fetchGetCountryDetail = async (
  countryCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCountryDetailForUserFront>> => {
  const res = await fetch(
    apiUrlCountry.detailGet(countryCode, langCode, start, limit),
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
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<DplusGetListDataResponse<TMapCountryEventWithEventInfo>>
 */
export const fetchGetCountryEvents = async (
  countryCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapCountryEventWithEventInfo>>
> => {
  const res = await fetch(
    apiUrlCountry.eventsGet(countryCode, langCode, start, limit),
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
 * @returns ResponseDplusAPI<{ country_code: string }[]>
 */
export const fetchGetCountryCodes = async (): Promise<
  ResponseDplusAPI<{ country_code: string }[]>
> => {
  const res = await fetch(apiUrlCountry.codeListGet(), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 3600,
      tags: [`country-code-list`],
    },
  });

  return res.json();
};

