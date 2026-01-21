import { ResponseDplusAPI, ResponseEventDetailForUserFront, ResponseMetadataForUserFront } from "dplus_common_v1";
import { apiUrlEvent } from "./api-url";

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
      revalidate: 14400,
      tags: [`event-${eventCode}`],
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
      revalidate: 86400,
      tags: [`event-metadata-${eventCode}-${langCode}`],
    },
  });

  return res.json();
};
