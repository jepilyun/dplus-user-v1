import { LIST_LIMIT } from "dplus_common_v1";

/**
 * API URL 옵션 파라미터 타입
 */
export type APIUrlOptionalParams = {
  dateString?: string | null;
  langCode?: string | null;
  categoryCode?: string | null;
  countryCode?: string | null;
  cityCode?: string | null;
  stagCode?: string | null;
  groupCode?: string | null;
  tagId?: number | null;
  tagCode?: string | null;
  eventCode?: string | null;
  folderCode?: string | null;
  keywordCode?: string | null;
  year?: number | null;
  weekNo?: number | null;
  date?: string | null;
  page?: number | null;
  size?: number | null;
  start?: number | null;
  limit?: number | null;
  tz?: string | null;

  // langCode?: string | null;
  // categoryCode?: string | null;
  // countryCode?: string | null;
  // cityCode?: string | null;
  // streetCode?: string | null;
  // stagCode?: string | null;
  // contentCode?: string | null;
  // slugName?: string | null;
  // photoUri?: string | null;
  // keyword?: string | null;
  // page?: number | null;
  // size?: number | null;
  // videoId?: string | null;
  // channelId?: string | null;
  // primaryKey?: string | null;  
  // tag?: string | null;
  // keywordCode?: string | null;
  // timeline?: string | null;
  // aid?: string | null;
  // id?: string | null;
  // hashCode?: string | null;
  // instaHashCode?: string | null;
};


/**
 * API Routes: Event Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { eventId, langCode }
 * @returns 경로
 */
export const apiUrlEvent = (
  type: "detailGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (optionalParams?.eventCode && optionalParams?.langCode) {
        path = `/api/event/detail/get/${optionalParams?.eventCode}/${optionalParams?.langCode}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.eventCode] ${optionalParams?.eventCode}`);
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};




/**
 * API Routes: Folder Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { folderId, langCode }
 * @returns 경로
 */
export const apiUrlFolder = (
  type: "detailGet" | "eventsGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet": 
      if (optionalParams?.folderCode && typeof optionalParams?.start === "number" &&  typeof optionalParams?.limit === "number") {
        path =`/api/folder/detail/get/${encodeURIComponent(optionalParams?.folderCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.folderCode] ${optionalParams?.folderCode}`);
      }
      break;
    case "eventsGet":
      if (optionalParams?.folderCode && typeof optionalParams?.start === "number" &&  typeof optionalParams?.limit === "number") {
        path =`/api/folder/events/get/${encodeURIComponent(optionalParams?.folderCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.folderCode] ${optionalParams?.folderCode}`);
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};






/**
 * API Routes: Date Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { dateString, start, limit }
 * @returns 경로
 */
export const apiUrlDate = (
  type: "detailGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet": 
      if (optionalParams?.countryCode && optionalParams?.dateString && typeof optionalParams?.start === "number" &&  typeof optionalParams?.limit === "number") {
        path =`/api/date/detail/get/${encodeURIComponent(optionalParams?.countryCode)}/${encodeURIComponent(optionalParams?.dateString)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`);
        console.error(`Invalid optional params: [optionalParams?.dateString] ${optionalParams?.dateString}`);
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};






/**
 * API Routes: City Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { cityCode, start, limit }
 * @returns 경로
 */
export const apiUrlCity = (
  type: "detailGet" | "eventsGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet": 
      if (optionalParams?.cityCode && typeof optionalParams?.start === "number" &&  typeof optionalParams?.limit === "number") {
        path =`/api/city/detail/get/${encodeURIComponent(optionalParams?.cityCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.cityCode] ${optionalParams?.cityCode}`);
      }
      break;
    case "eventsGet":
      if (optionalParams?.cityCode && typeof optionalParams?.start === "number" &&  typeof optionalParams?.limit === "number") {
        path =`/api/city/events/get/${encodeURIComponent(optionalParams?.cityCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.cityCode] ${optionalParams?.cityCode}`);
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};






/**
 * API Routes: Stag Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { stagCode, start, limit }
 * @returns 경로
 */
export const apiUrlStag = (
  type: "detailGet" | "eventsGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet": 
      if (optionalParams?.stagCode && typeof optionalParams?.start === "number" &&  typeof optionalParams?.limit === "number") {
        path =`/api/stag/detail/get/${encodeURIComponent(optionalParams?.stagCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.stagCode] ${optionalParams?.stagCode}`);
      }
      break;
    case "eventsGet":
      if (optionalParams?.stagCode && typeof optionalParams?.start === "number" &&  typeof optionalParams?.limit === "number") {
        path =`/api/stag/events/get/${encodeURIComponent(optionalParams?.stagCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.stagCode] ${optionalParams?.stagCode}`);
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};




/**
 * API Routes: Group Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { groupCode, start, limit }
 * @returns 경로
 */
export const apiUrlGroup = (
  type: "detailGet" | "eventsGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet": 
      if (optionalParams?.groupCode && typeof optionalParams?.start === "number" &&  typeof optionalParams?.limit === "number") {
        path =`/api/group/detail/get/${encodeURIComponent(optionalParams?.groupCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.groupCode] ${optionalParams?.groupCode}`);
      }
      break;
    case "eventsGet":
      if (optionalParams?.groupCode && typeof optionalParams?.start === "number" &&  typeof optionalParams?.limit === "number") {
        path =`/api/group/events/get/${encodeURIComponent(optionalParams?.groupCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.groupCode] ${optionalParams?.groupCode}`);
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};





/**
 * API Routes: Tag Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { tagId, start, limit }
 * @returns 경로
 */
export const apiUrlTag = (
  type: "detailGet" | "eventsGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet": 
      if (optionalParams?.tagCode && typeof optionalParams?.start === "number" &&  typeof optionalParams?.limit === "number") {
        path =`/api/tag/detail/get/${encodeURIComponent(optionalParams?.tagCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.tagCode] ${optionalParams?.tagCode}`);
      }
      break;
    case "eventsGet":
      if (typeof optionalParams?.tagId === "number" && typeof optionalParams?.start === "number" &&  typeof optionalParams?.limit === "number") {
        path =`/api/tag/events/get/${optionalParams?.tagId}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.tagId] ${optionalParams?.tagId}`);
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};





/**
 * API Routes: Category Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { countryCode, categoryCode, start, limit }
 * @returns 경로
 */
export const apiUrlCategory = (
  type: "detailGet" | "eventsGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet": 
      if (optionalParams?.countryCode && optionalParams?.categoryCode && typeof optionalParams?.start === "number" &&  typeof optionalParams?.limit === "number" && optionalParams?.langCode) {
        path =`/api/category/detail/get/${encodeURIComponent(optionalParams?.countryCode)}/${encodeURIComponent(optionalParams?.categoryCode)}/${optionalParams?.start}/${optionalParams?.limit}/${optionalParams?.langCode}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`);
        console.error(`Invalid optional params: [optionalParams?.categoryCode] ${optionalParams?.categoryCode}`);
      }
      break;
    case "eventsGet":
      if (optionalParams?.countryCode && optionalParams?.categoryCode && typeof optionalParams?.start === "number" &&  typeof optionalParams?.limit === "number") {
        path =`/api/category/events/get/${encodeURIComponent(optionalParams?.countryCode)}/${encodeURIComponent(optionalParams?.categoryCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`);
        console.error(`Invalid optional params: [optionalParams?.categoryCode] ${optionalParams?.categoryCode}`);
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};




/**
 * API Routes: Today Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { countryCode, start, limit }
 * @returns 경로
 */
export const apiUrlToday = (
  type: "detailGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet": 
      if (optionalParams?.countryCode && typeof optionalParams?.start === "number" &&  typeof optionalParams?.limit === "number") {
        path =`/api/today/detail/get/${encodeURIComponent(optionalParams?.countryCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`);
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};


