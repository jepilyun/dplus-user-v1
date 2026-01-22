import { ResponseDplusAPI, ResponseEventDetailForUserFront, ResponseMetadataForUserFront } from "dplus_common_v1";
import { APIUrlOptionalParams } from "./api-url";


/**
 * API Routes: Event Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { eventId, langCode }
 * @returns 경로
 */
const apiUrlEvent = (
  type: "detailGet" | "upcomingCodeListGet" | "metadataGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (optionalParams?.eventCode && optionalParams?.langCode) {
        path = `/api/event/detail/get/${optionalParams?.eventCode}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.eventCode] ${optionalParams?.eventCode}`,
        );
      }
      break;
    case "upcomingCodeListGet":
      const qp = new URLSearchParams();

      // limit: 숫자면 추가 (원하면 clampInt로 범위 제한)
      if (
        typeof optionalParams?.limit === "number" &&
        Number.isFinite(optionalParams.limit)
      ) {
        qp.set("limit", String(optionalParams.limit));
      }

      // backDays: 숫자면 추가
      if (
        typeof optionalParams?.backDays === "number" &&
        Number.isFinite(optionalParams.backDays)
      ) {
        qp.set("backDays", String(optionalParams.backDays));
      }

      // countryCode: 문자열이면 2자 대문자만 허용
      if (typeof optionalParams?.countryCode === "string") {
        const cc = optionalParams.countryCode.trim().toUpperCase();
        if (/^[A-Z]{2}$/.test(cc)) qp.set("countryCode", cc);
      }

      // cityCode: 문자열이면 공백 아닌 경우만
      if (typeof optionalParams?.cityCode === "string") {
        const city = optionalParams.cityCode.trim();
        if (city) qp.set("cityCode", city);
      }

      const qs = qp.toString();
      path = `/api/event/get/codes/upcoming${qs ? `?${qs}` : ""}`;
      break;
    case "metadataGet":
      if (optionalParams?.eventCode && optionalParams?.langCode) {
        path = `/api/event/metadata/get/${optionalParams?.eventCode}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.eventCode] ${optionalParams?.eventCode}`,
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
