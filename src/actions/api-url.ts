import { LIST_LIMIT } from "dplus_common_v1";

/**
 * API URL 옵션 파라미터 타입
 */
export type APIUrlOptionalParams = {
  langCode?: string | null;
  categoryCode?: string | null;
  countryCode?: string | null;
  cityCode?: string | null;
  stagCode?: string | null;
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
  type: "detailGet",
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
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};










