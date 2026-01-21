import { DplusGetListDataResponse, ResponseDplusAPI, ResponseFolderDetailForUserFront, ResponseMetadataForUserFront, TMapFolderEventWithEventInfo } from "dplus_common_v1";
import { apiUrlFolder } from "./api-url";

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
        revalidate: 3600,
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
        revalidate: 14400,
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
        revalidate: 86400,
        tags: [`folder-metadata-${folderCode}-${langCode}`],
      },
    },
  );
  return res.json();
};