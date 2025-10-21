import {
  DplusGetListDataResponse,
  ResponseCategoryDetailForUserFront,
  ResponseCityDetailForUserFront,
  ResponseCountryDetailForUserFront,
  ResponseDplusAPI,
  ResponseEventDetailForUserFront,
  ResponseFolderDetailForUserFront,
  ResponseGroupDetailForUserFront,
  ResponseStagDetailForUserFront,
  ResponseTagDetailForUserFront,
  TEventCardForDateDetail,
} from "dplus_common_v1";
import { apiUrlCategory, apiUrlCity, apiUrlCountry, apiUrlDate, apiUrlEvent, apiUrlFolder, apiUrlGroup, apiUrlStag, apiUrlTag, apiUrlToday } from "./api-url";

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
 * @param countryCode
 * @param dateString
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetDateList = async (
  countryCode: string,
  dateString: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>> => {
  const res = await fetch(apiUrlDate("detailGet", { countryCode, dateString, start, limit }), {
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





/**
 * Stag 상세 화면 조회 for User Front
 * @param stagCode
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetStagDetail = async (
  stagCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseStagDetailForUserFront>> => {
  const res = await fetch(apiUrlStag("detailGet", { stagCode, start, limit }), {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};


/**
 * Stag 상세 화면 Events 더보기 조회 for User Front
 * @param stagCode
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetStagEvents = async (
  stagCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseStagDetailForUserFront>> => {
  const res = await fetch(apiUrlStag("eventsGet", { stagCode, start, limit }), {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};





/**
 * Group 상세 화면 조회 for User Front
 * @param groupCode
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetGroupDetail = async (
  groupCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseGroupDetailForUserFront>> => {
  const res = await fetch(apiUrlGroup("detailGet", { groupCode, start, limit }), {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};


/**
 * Group 상세 화면 Events 더보기 조회 for User Front
 * @param groupCode
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetGroupEvents = async (
  groupCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseGroupDetailForUserFront>> => {
  const res = await fetch(apiUrlGroup("eventsGet", { groupCode, start, limit }), {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};





/**
 * Tag 상세 화면 조회 for User Front
 * @param tagCode
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetTagDetail = async (
  tagCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseTagDetailForUserFront>> => {
  const res = await fetch(apiUrlTag("detailGet", { tagCode, start, limit }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};


/**
 * Tag 상세 화면 Events 더보기 조회 for User Front
 * @param tagId
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetTagEvents = async (
  tagId: number,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseTagDetailForUserFront>> => {
  const res = await fetch(apiUrlTag("eventsGet", { tagId, start, limit }), {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};







/**
 * Category 상세 화면 조회 for User Front
 * @param countryCode
 * @param categoryCode
 * @param start 
 * @param limit
 * @param langCode
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCategoryDetail = async (
  countryCode: string,
  categoryCode: string,
  start: number,
  limit: number,
  langCode: string = "en",
): Promise<ResponseDplusAPI<ResponseCategoryDetailForUserFront>> => {
  const res = await fetch(apiUrlCategory("detailGet", { countryCode, categoryCode, start, limit, langCode }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};


/**
 * Category 상세 화면 Events 더보기 조회 for User Front
 * @param countryCode
 * @param categoryCode
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCategoryEvents = async (
  countryCode: string,
  categoryCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCategoryDetailForUserFront>> => {
  const res = await fetch(apiUrlCategory("eventsGet", { countryCode, categoryCode, start, limit }), {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};





/**
 * Today 상세 화면 조회 for User Front
 * @param countryCode
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetTodayList = async (
  countryCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>> => {
  const res = await fetch(apiUrlToday("detailGet", { countryCode, start, limit }), {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};




/**
 * Country 상세 화면 조회 for User Front
 * @param dateString
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCountryDetail = async (
  countryCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCountryDetailForUserFront>> => {
  const res = await fetch(apiUrlCountry("detailGet", { countryCode, start, limit }), {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};


/**
 * Country 상세 화면 Events 더보기 조회 for User Front
 * @param countryCode
 * @param start 
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCountryEvents = async (
  countryCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCountryDetailForUserFront>> => {
  const res = await fetch(apiUrlCountry("eventsGet", { countryCode, start, limit }), {
    method: "GET",
    credentials: "include",
  });
  return res.json();
};

