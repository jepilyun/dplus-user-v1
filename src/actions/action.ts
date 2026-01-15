import {
  DplusGetListDataResponse,
  ResponseCategoryDetailForUserFront,
  ResponseCityDetailForUserFront,
  ResponseCountryDetailForUserFront,
  ResponseDplusAPI,
  ResponseEventDetailForUserFront,
  ResponseFolderDetailForUserFront,
  ResponseGroupDetailForUserFront,
  ResponseMetadataForUserFront,
  ResponseStagDetailForUserFront,
  ResponseTagDetailForUserFront,
  TEventCardForDateDetail,
  TMapCategoryEventWithEventInfo,
  TMapCityEventWithEventInfo,
  TMapCountryEventWithEventInfo,
  TMapFolderEventWithEventInfo,
  TMapGroupEventWithEventInfo,
  TMapStagEventWithEventInfo,
  TMapTagEventWithEventInfo,
} from "dplus_common_v1";

import {
  apiUrlCategory,
  apiUrlCity,
  apiUrlCountry,
  apiUrlDate,
  apiUrlEvent,
  apiUrlFolder,
  apiUrlGroup,
  apiUrlStag,
  apiUrlTag,
  apiUrlToday,
} from "./api-url";

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
    next: {
      revalidate: 14400, // ✅ 4시간 캐시
      tags: [`event-${eventCode}`], // ✅ 필요시 특정 이벤트만 revalidate
    },
  });

  return res.json();
};

/**
 * Event 코드 목록 조회 for User Front
 * @param limit
 * @param backDays
 * @param countryCode
 * @param cityCode
 * @returns ResponseDplusAPI<{ event_code: string }[]>
 */
export const reqGetEventCodeList = async (
  limit: number = 300,
  backDays: number = 1,
  countryCode: string | null = null,
  cityCode: string | null = null,
): Promise<ResponseDplusAPI<{ event_code: string }[]>> => {
  const res = await fetch(
    apiUrlEvent("upcomingCodeListGet", {
      limit,
      backDays,
      countryCode,
      cityCode,
    }),
    {
      method: "GET",
      credentials: "include",
    },
  );

  return res.json();
};

/**
 * Event 메타데이터 조회 for User Front
 * @param eventCode
 * @returns ResponseDplusAPI<ResponseMetadataForUserFront>
 */
export const reqGetEventMetadata = async (
  eventCode: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseMetadataForUserFront>> => {
  const res = await fetch(apiUrlEvent("metadataGet", { eventCode, langCode }), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 86400, // ✅ 24시간 캐시
      tags: [`event-metadata-${eventCode}-${langCode}`], // ✅ 필요시 특정 이벤트만 revalidate
    },
  });

  return res.json();
};

/**
 * Folder 상세 화면 조회 for User Front
 * @param folderCode
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetFolderDetail = async (
  folderCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseFolderDetailForUserFront>> => {
  const res = await fetch(
    apiUrlFolder("detailGet", { folderCode, langCode, start, limit }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 7200, // ✅ 2시간 캐시
        tags: [`folder-${folderCode}`], // ✅ 특정 폴더만 revalidate 가능
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
 * @returns ResponseDplusAPI<{ event_code: string }[]>
 */
export const reqGetFolderCodeList = async (
  limit: number = 100,
  countryCode: string | null = null,
  cityCode: string | null = null,
): Promise<ResponseDplusAPI<{ folder_code: string }[]>> => {
  const res = await fetch(
    apiUrlFolder("recentCodeListGet", { limit, countryCode, cityCode }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 3600, // ✅ 1시간 캐시
        tags: [`folder-code-list-${countryCode}-${cityCode}`],
      },
    },
  );

  return res.json();
};

/**
 * Folder 상세 화면 조회 for User Front
 * @param folderCode
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetFolderEvents = async (
  folderCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapFolderEventWithEventInfo>>
> => {
  const res = await fetch(
    apiUrlFolder("eventsGet", { folderCode, langCode, start, limit }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 7200, // ✅ 2시간 캐시
        tags: [`folder-events-${folderCode}`],
      },
    },
  );

  return res.json();
};

/**
 * Folder 메타데이터 조회 for User Front
 * @param folderCode
 * @param langCode
 * @returns ResponseDplusAPI<ResponseMetadataForUserFront>
 */
export const reqGetFolderMetadata = async (
  folderCode: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseMetadataForUserFront>> => {
  const res = await fetch(
    apiUrlFolder("metadataGet", { folderCode, langCode }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 86400, // ✅ 24시간 캐시
        tags: [`folder-metadata-${folderCode}-${langCode}`],
      },
    },
  );
  return res.json();
};

/**
 * Date 상세 화면 조회 for User Front
 * @param countryCode
 * @param dateString
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>
 */
export const reqGetDateList = async (
  countryCode: string,
  dateString: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>
> => {
  const res = await fetch(
    apiUrlDate("detailGet", { countryCode, dateString, start, limit }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 7200, // ✅ 2시간 캐시 (날짜별 데이터는 자주 변경)
        tags: [`date-${dateString}-${countryCode}`],
      },
    },
  );
  return res.json();
};

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
        revalidate: 7200, // ✅ 2시간 캐시
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
        revalidate: 7200, // ✅ 2시간 캐시
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
      revalidate: 3600, // ✅ 1시간 캐시
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
      revalidate: 86400, // ✅ 24시간 캐시
      tags: [`city-metadata-${cityCode}-${langCode}`],
    },
  });
  return res.json();
};

/**
 * Stag 상세 화면 조회 for User Front
 * @param stagCode
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetStagDetail = async (
  stagCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseStagDetailForUserFront>> => {
  const res = await fetch(
    apiUrlStag("detailGet", { stagCode, langCode, start, limit }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 7200, // ✅ 2시간 캐시
        tags: [`stag-${stagCode}-${langCode}`],
      },
    },
  );
  return res.json();
};

/**
 * Stag 코드 목록 조회 for User Front
 * @returns ResponseDplusAPI<string[]>
 */
export const reqGetStagCodes = async (
  limit: number = 100,
): Promise<ResponseDplusAPI<{ stag_code: string }[]>> => {
  const res = await fetch(apiUrlStag("getStagCodes", { limit }), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 3600, // ✅ 1시간 캐시
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
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetStagEvents = async (
  stagCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapStagEventWithEventInfo>>
> => {
  const res = await fetch(apiUrlStag("eventsGet", { stagCode, start, limit }), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 7200, // ✅ 2시간 캐시
      tags: [`stag-events-${stagCode}`],
    },
  });
  return res.json();
};

/**
 * Stag 메타데이터 조회 for User Front
 * @param stagCode
 * @param langCode
 * @returns ResponseDplusAPI<ResponseMetadataForUserFront>
 */
export const reqGetStagMetadata = async (
  stagCode: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseMetadataForUserFront>> => {
  const res = await fetch(apiUrlStag("metadataGet", { stagCode, langCode }), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 86400, // ✅ 24시간 캐시
      tags: [`stag-metadata-${stagCode}-${langCode}`],
    },
  });
  return res.json();
};

/**
 * Group 상세 화면 조회 for User Front
 * @param groupCode
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetGroupDetail = async (
  groupCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseGroupDetailForUserFront>> => {
  const res = await fetch(
    apiUrlGroup("detailGet", { groupCode, langCode, start, limit }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 7200, // ✅ 2시간 캐시
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
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetGroupEvents = async (
  groupCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapGroupEventWithEventInfo>>
> => {
  const res = await fetch(
    apiUrlGroup("eventsGet", { groupCode, start, limit }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 7200, // ✅ 2시간 캐시 (더보기는 짧게)
        tags: [`group-events-${groupCode}`],
      },
    },
  );
  return res.json();
};

/**
 * Group 코드 목록 조회 for User Front
 * @returns ResponseDplusAPI<ResponseGroupDetailForUserFront>
 */
export const reqGetGroupCodes = async (
  limit: number = 100,
): Promise<ResponseDplusAPI<{ group_code: string }[]>> => {
  const res = await fetch(apiUrlGroup("getGroupCodes", { limit }), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 3600, // ✅ 1시간 캐시
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
export const reqGetGroupMetadata = async (
  groupCode: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseMetadataForUserFront>> => {
  const res = await fetch(apiUrlGroup("metadataGet", { groupCode, langCode }), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 86400, // ✅ 24시간 캐시
      tags: [`group-metadata-${groupCode}-${langCode}`],
    },
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
    next: {
      revalidate: 7200, // ✅ 2시간 캐시
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
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetTagEvents = async (
  tagCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapTagEventWithEventInfo>>
> => {
  const res = await fetch(apiUrlTag("eventsGet", { tagCode, start, limit }), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 7200, // ✅ 2시간 캐시
      tags: [`tag-events-${tagCode}`],
    },
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
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCategoryDetailForUserFront>> => {
  const res = await fetch(
    apiUrlCategory("detailGet", {
      countryCode,
      categoryCode,
      langCode,
      start,
      limit,
    }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 7200, // ✅ 2시간 캐시
        tags: [`category-${countryCode}-${categoryCode}`],
      },
    },
  );

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
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapCategoryEventWithEventInfo>>
> => {
  const res = await fetch(
    apiUrlCategory("eventsGet", { countryCode, categoryCode, start, limit }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 7200, // ✅ 2시간 캐시
        tags: [`category-events-${countryCode}-${categoryCode}`],
      },
    },
  );
  return res.json();
};

/**
 * Category 코드 목록 조회 for User Front
 * @returns ResponseDplusAPI<string[]>
 */
export const reqGetCategoryCodes = async (
  limit: number = 200,
): Promise<ResponseDplusAPI<{ category_code: string }[]>> => {
  const res = await fetch(apiUrlCategory("getCategoryCodes", { limit }), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 3600, // ✅ 1시간 캐시
      tags: [`category-code-list`],
    },
  });

  return res.json();
};

/**
 * Category 메타데터 조회 for User Front
 * @param categoryCode
 * @param langCode
 * @returns ResponseDplusAPI<ResponseMetadataForUserFront>
 */
export const reqGetCategoryMetadata = async (
  categoryCode: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseMetadataForUserFront>> => {
  const res = await fetch(
    apiUrlCategory("metadataGet", { categoryCode, langCode }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 86400, // ✅ 24시간 캐시
        tags: [`category-metadata-${categoryCode}-${langCode}`],
      },
    },
  );

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
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>
> => {
  const res = await fetch(
    apiUrlToday("detailGet", { countryCode, start, limit }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 7200, // ✅ 2시간 캐시
        tags: [`today-${countryCode}`],
      },
    },
  );
  return res.json();
};

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
        revalidate: 7200, // ✅ 2시간 캐시
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
        revalidate: 7200, // ✅ 2시간 캐시
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
      revalidate: 3600, // ✅ 1시간 캐시
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
        revalidate: 86400, // ✅ 24시간 캐시
        tags: [`country-metadata-${countryCode}-${langCode}`],
      },
    },
  );
  return res.json();
};
