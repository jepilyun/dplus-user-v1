import { DplusGetListDataResponse, ResponseDplusAPI, ResponseFolderDetailForUserFront, ResponseMetadataForUserFront, TMapFolderEventWithEventInfo } from "dplus_common_v1";
import { APIUrlOptionalParams } from "./api-url";


/**
 * API Routes: Folder Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { folderId, langCode }
 * @returns 경로
 */
const apiUrlFolder = (
  type: "detailGet" | "eventsGet" | "recentCodeListGet" | "metadataGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.folderCode &&
        optionalParams?.langCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/folder/detail/get/${encodeURIComponent(optionalParams?.folderCode)}/${optionalParams?.langCode}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.folderCode] ${optionalParams?.folderCode}`,
        );
      }
      break;
    case "eventsGet":
      if (
        optionalParams?.folderCode &&
        optionalParams?.langCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/folder/events/get/${encodeURIComponent(optionalParams?.folderCode)}/${optionalParams?.langCode}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.folderCode] ${optionalParams?.folderCode}`,
        );
      }
      break;
    case "recentCodeListGet":
      const qp = new URLSearchParams();

      // limit: 숫자면 추가 (원하면 clampInt로 범위 제한)
      if (
        typeof optionalParams?.limit === "number" &&
        Number.isFinite(optionalParams.limit)
      ) {
        // const lim = clampInt(optionalParams.limit, 100, 1, 1000); // 범위 제한이 필요하면 사용
        qp.set("limit", String(optionalParams.limit));
      }

      // countryCode: 2자 대문자만 허용
      if (typeof optionalParams?.countryCode === "string") {
        const cc = optionalParams.countryCode.trim().toUpperCase();
        if (/^[A-Z]{2}$/.test(cc)) qp.set("countryCode", cc);
      }

      // cityCode: 공백 아닌 문자열만
      if (typeof optionalParams?.cityCode === "string") {
        const city = optionalParams.cityCode.trim();
        if (city) qp.set("cityCode", city);
      }

      const qs = qp.toString();
      path = `/api/folder/get/codes/recent${qs ? `?${qs}` : ""}`;
      break;
    case "metadataGet":
      if (optionalParams?.folderCode && optionalParams?.langCode) {
        path = `/api/folder/metadata/get/${encodeURIComponent(optionalParams?.folderCode)}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.folderCode] ${optionalParams?.folderCode}`,
          `Invalid optional params: [optionalParams?.langCode] ${optionalParams?.langCode}`,
        );
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
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