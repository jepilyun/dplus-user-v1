import { DplusGetListDataResponse, ResponseDplusAPI, ResponseTagDetailForUserFront, TMapTagEventWithEventInfo } from "dplus_common_v1";
import { APIUrlOptionalParams } from "./apiUrl";

/**
 * API Routes: Tag Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { tagCode, start, limit }
 * @returns 경로
 */
const apiUrlTag = (
  type: "detailGet" | "eventsGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.tagCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/tag/detail/get/${encodeURIComponent(optionalParams?.tagCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.tagCode] ${optionalParams?.tagCode}`,
        );
      }
      break;
    case "eventsGet":
      if (
        optionalParams?.tagCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/tag/events/get/${encodeURIComponent(optionalParams?.tagCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.tagCode] ${optionalParams?.tagCode}`,
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
      revalidate: 14400,
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
      revalidate: 14400,
      tags: [`tag-events-${tagCode}`],
    },
  });
  return res.json();
};
