import {
  DplusGetListDataResponse,
  ResponseDplusAPI,
  ResponseFolderDetailForUserFront,
  TMapFolderEventWithEventInfo,
} from "dplus_common_v1";

import { apiUrlFolder } from "./apiUrlFolder";

/**
 * Folder 상세 화면 조회 for User Front
 * @param folderCode
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const fetchGetFolderDetail = async (
  folderCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseFolderDetailForUserFront>> => {
  const res = await fetch(
    apiUrlFolder.detailGet(folderCode, langCode, start, limit),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`folder-${folderCode}`],
      },
    },
  );

  return res.json();
};

/**
 * Folder 코드 목록 조회 for User Front
 * @param limit
 * @param countryCode
 * @param cityCode
 * @returns ResponseDplusAPI<{ folder_code: string }[]>
 */
export const fetchGetFolderCodeList = async (
  limit: number = 100,
  countryCode: string | null = null,
  cityCode: string | null = null,
): Promise<ResponseDplusAPI<{ folder_code: string }[]>> => {
  const res = await fetch(
    apiUrlFolder.recentCodeListGet(limit, countryCode, cityCode),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 3600,
        tags: [`folder-code-list-${countryCode}-${cityCode}`],
      },
    },
  );

  return res.json();
};

/**
 * Folder 상세 화면 Events 더보기 조회 for User Front
 * @param folderCode
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<DplusGetListDataResponse<TMapFolderEventWithEventInfo>>
 */
export const fetchGetFolderEvents = async (
  folderCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapFolderEventWithEventInfo>>
> => {
  const res = await fetch(
    apiUrlFolder.eventsGet(folderCode, langCode, start, limit),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`folder-events-${folderCode}`],
      },
    },
  );

  return res.json();
};

