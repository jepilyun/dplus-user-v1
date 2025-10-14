import {
  ResponseDplusAPI,
  ResponseEventDetailForUserFront,
  ResponseFolderDetailForUserFront,
} from "dplus_common_v1";
import { apiUrlEvent, apiUrlFolder } from "./api-url";

/**
 * Event 상세 화면 조회 for User Front
 * @param eventId
 * @returns ResponseDplusAPI<ResponseEventDetailForUserFront>
 */
export const reqGetEventDetail = async (
  eventId: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseEventDetailForUserFront>> => {
  const res = await fetch(apiUrlEvent("detailGet", { eventId, langCode }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};

/**
 * Folder 상세 화면 조회 for User Front
 * @param folderId
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetFolderDetail = async (
  folderId: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseFolderDetailForUserFront>> => {
  const res = await fetch(apiUrlFolder("detailGet", { folderId, start, limit }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};