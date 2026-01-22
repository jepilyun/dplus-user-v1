import { DplusGetListDataResponse, ResponseCityDetailForUserFront, ResponseDplusAPI, ResponseMetadataForUserFront, TMapCityEventWithEventInfo } from "dplus_common_v1";
import { APIUrlOptionalParams } from "./api-url";

/**
 * API Routes: City Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { cityCode, start, limit }
 * @returns 경로
 */
const apiUrlCity = (
  type: "detailGet" | "eventsGet" | "getCityCodes" | "metadataGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.cityCode &&
        optionalParams?.langCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/city/detail/get/${encodeURIComponent(optionalParams?.cityCode)}/${optionalParams?.langCode}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.cityCode] ${optionalParams?.cityCode}`,
        );
      }
      break;
    case "eventsGet":
      if (
        optionalParams?.cityCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number" &&
        optionalParams?.langCode
      ) {
        path = `/api/city/events/get/${encodeURIComponent(optionalParams?.cityCode)}/${optionalParams?.langCode}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.cityCode] ${optionalParams?.cityCode}`,
        );
      }
      break;
    case "getCityCodes":
      const qp = new URLSearchParams();
      if (
        typeof optionalParams?.limit === "number" &&
        Number.isFinite(optionalParams.limit)
      ) {
        qp.set("limit", String(optionalParams.limit));
      }
      const qs = qp.toString();
      path = `/api/city/get/code/list${qs ? `?${qs}` : ""}`;
      break;
    case "metadataGet":
      if (optionalParams?.cityCode && optionalParams?.langCode) {
        path = `/api/city/metadata/get/${encodeURIComponent(optionalParams?.cityCode)}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.cityCode] ${optionalParams?.cityCode}`,
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
        revalidate: 14400,
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
        revalidate: 14400,
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
      revalidate: 3600,
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
      revalidate: 86400,
      tags: [`city-metadata-${cityCode}-${langCode}`],
    },
  });
  return res.json();
};
