import { DplusGetListDataResponse, ResponseDplusAPI, ResponseGroupDetailForUserFront, ResponseMetadataForUserFront, TMapGroupEventWithEventInfo } from "dplus_common_v1";
import { APIUrlOptionalParams } from "./api-url";

/**
 * API Routes: Group Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { groupCode, start, limit }
 * @returns 경로
 */
const apiUrlGroup = (
  type: "detailGet" | "eventsGet" | "getGroupCodes" | "metadataGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.groupCode &&
        optionalParams?.langCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/group/detail/get/${encodeURIComponent(optionalParams?.groupCode)}/${optionalParams?.langCode}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.groupCode] ${optionalParams?.groupCode}`,
        );
      }
      break;
    case "eventsGet":
      if (
        optionalParams?.groupCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/group/events/get/${encodeURIComponent(optionalParams?.groupCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.groupCode] ${optionalParams?.groupCode}`,
        );
      }
      break;
    case "getGroupCodes":
      const qp = new URLSearchParams();
      if (
        typeof optionalParams?.limit === "number" &&
        Number.isFinite(optionalParams.limit)
      ) {
        qp.set("limit", String(optionalParams.limit));
      }
      const qs = qp.toString();
      path = `/api/group/get/code/list${qs ? `?${qs}` : ""}`;
      break;
    case "metadataGet":
      if (optionalParams?.stagCode && optionalParams?.langCode) {
        path = `/api/group/metadata/get/${encodeURIComponent(optionalParams?.stagCode)}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.groupCode] ${optionalParams?.groupCode}`,
        );
        console.error(
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
        revalidate: 14400,
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
export const reqGetGroupMetadata = async (
  groupCode: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseMetadataForUserFront>> => {
  const res = await fetch(apiUrlGroup("metadataGet", { groupCode, langCode }), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 86400,
      tags: [`group-metadata-${groupCode}-${langCode}`],
    },
  });
  return res.json();
};
