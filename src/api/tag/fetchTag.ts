import {
  DplusGetListDataResponse,
  ResponseDplusAPI,
  ResponseTagDetailForUserFront,
  TMapTagEventWithEventInfo,
} from "dplus_common_v1";

import { apiUrlTag } from "./apiUrlTag";

/**
 * Tag 상세 화면 조회 for User Front
 * @param tagCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponseTagDetailForUserFront>
 */
export const fetchGetTagDetail = async (
  tagCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseTagDetailForUserFront>> => {
  const res = await fetch(apiUrlTag.detailGet(tagCode, start, limit), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 14400,
      tags: [`tag-${tagCode}`],
    },
  });

  return res.json();
};

/**
 * Tag 상세 화면 Events 더보기 조회 for User Front
 * @param tagCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<DplusGetListDataResponse<TMapTagEventWithEventInfo>>
 */
export const fetchGetTagEvents = async (
  tagCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapTagEventWithEventInfo>>
> => {
  const res = await fetch(apiUrlTag.eventsGet(tagCode, start, limit), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 14400,
      tags: [`tag-events-${tagCode}`],
    },
  });
  return res.json();
};
