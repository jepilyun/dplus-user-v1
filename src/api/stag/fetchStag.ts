import {
  DplusGetListDataResponse,
  ResponseDplusAPI,
  ResponseStagDetailForUserFront,
  TMapStagEventWithEventInfo,
} from "dplus_common_v1";

import { apiUrlStag } from "./apiUrlStag";

/**
 * Stag 상세 화면 조회 for User Front
 * @param stagCode
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponseStagDetailForUserFront>
 */
export const fetchGetStagDetail = async (
  stagCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseStagDetailForUserFront>> => {
  const res = await fetch(
    apiUrlStag.detailGet(stagCode, langCode, start, limit),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`stag-${stagCode}-${langCode}`],
      },
    },
  );
  return res.json();
};

/**
 * Stag 코드 목록 조회 for User Front
 * @param limit
 * @returns ResponseDplusAPI<{ stag_code: string }[]>
 */
export const fetchGetStagCodes = async (
  limit: number = 100,
): Promise<ResponseDplusAPI<{ stag_code: string }[]>> => {
  const res = await fetch(apiUrlStag.codeListGet(limit), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 3600,
      tags: [`stag-code-list`],
    },
  });
  return res.json();
};

/**
 * Stag 상세 화면 Events 더보기 조회 for User Front
 * @param stagCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<DplusGetListDataResponse<TMapStagEventWithEventInfo>>
 */
export const fetchGetStagEvents = async (
  stagCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapStagEventWithEventInfo>>
> => {
  const res = await fetch(apiUrlStag.eventsGet(stagCode, start, limit), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 14400,
      tags: [`stag-events-${stagCode}`],
    },
  });
  return res.json();
};

