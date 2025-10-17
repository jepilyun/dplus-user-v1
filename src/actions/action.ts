import {
  DplusGetListDataResponse,
  ResponseCityDetailForUserFront,
  ResponseDplusAPI,
  ResponseEventDetailForUserFront,
  ResponseFolderDetailForUserFront,
  TEventCardForDateDetail,
} from "dplus_common_v1";
import { apiUrlCity, apiUrlDate, apiUrlEvent, apiUrlFolder } from "./api-url";

/**
 * Event 상세 화면 조회 for User Front
 * @param eventCode
 * @returns ResponseDplusAPI<ResponseEventDetailForUserFront>
 */
export const reqGetEventDetail = async (
  eventCode: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseEventDetailForUserFront>> => {
  const res = await fetch(apiUrlEvent("detailGet", { eventCode, langCode }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};

/**
 * Folder 상세 화면 조회 for User Front
 * @param folderCode
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetFolderDetail = async (
  folderCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseFolderDetailForUserFront>> => {
  const res = await fetch(apiUrlFolder("detailGet", { folderCode, start, limit }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};


/**
 * Folder 상세 화면 조회 for User Front
 * @param folderCode
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetFolderEvents = async (
  folderCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseFolderDetailForUserFront>> => {
  const res = await fetch(apiUrlFolder("eventsGet", { folderCode, start, limit }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};



/**
 * Date 상세 화면 조회 for User Front
 * @param dateString
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetDateDetail = async (
  dateString: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>> => {
  const res = await fetch(apiUrlDate("detailGet", { dateString, start, limit }), {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};



/**
 * City 상세 화면 조회 for User Front
 * @param dateString
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCityDetail = async (
  cityCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCityDetailForUserFront>> => {
  const res = await fetch(apiUrlCity("detailGet", { cityCode, start, limit }), {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};


/**
 * City 상세 화면 조회 for User Front
 * @param cityCode
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCityEvents = async (
  cityCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCityDetailForUserFront>> => {
  const res = await fetch(apiUrlCity("eventsGet", { cityCode, start, limit }), {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};
