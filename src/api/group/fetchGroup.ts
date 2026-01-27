import {
  DplusGetListDataResponse,
  ResponseDplusAPI,
  ResponseGroupDetailForUserFront,
  ResponseMetadataForUserFront,
  TMapGroupEventWithEventInfo,
} from "dplus_common_v1";

import { apiUrlGroup } from "./apiUrlGroup";

/**
 * Group 상세 화면 조회 for User Front
 * @param groupCode
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponseGroupDetailForUserFront>
 */
export const fetchGetGroupDetail = async (
  groupCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseGroupDetailForUserFront>> => {
  const res = await fetch(
    apiUrlGroup.detailGet(groupCode, langCode, start, limit),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`group-${groupCode}`],
      },
    },
  );
  return res.json();
};

/**
 * Group 상세 화면 Events 더보기 조회 for User Front
 * @param groupCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<DplusGetListDataResponse<TMapGroupEventWithEventInfo>>
 */
export const fetchGetGroupEvents = async (
  groupCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapGroupEventWithEventInfo>>
> => {
  const res = await fetch(apiUrlGroup.eventsGet(groupCode, start, limit), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 14400,
      tags: [`group-events-${groupCode}`],
    },
  });
  return res.json();
};

/**
 * Group 코드 목록 조회 for User Front
 * @param limit
 * @returns ResponseDplusAPI<{ group_code: string }[]>
 */
export const fetchGetGroupCodes = async (
  limit: number = 100,
): Promise<ResponseDplusAPI<{ group_code: string }[]>> => {
  const res = await fetch(apiUrlGroup.codeListGet(limit), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 3600,
      tags: [`group-code-list`],
    },
  });

  return res.json();
};

/**
 * Group 메타데이터 조회 for User Front
 * @param groupCode
 * @param langCode
 * @returns ResponseDplusAPI<ResponseMetadataForUserFront>
 */
export const fetchGetGroupMetadata = async (
  groupCode: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseMetadataForUserFront>> => {
  const res = await fetch(apiUrlGroup.metadataGet(groupCode, langCode), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 86400,
      tags: [`group-metadata-${groupCode}-${langCode}`],
    },
  });
  return res.json();
};
