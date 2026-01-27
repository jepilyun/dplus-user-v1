import { DplusGetListDataResponse, ResponseDplusAPI, ResponsePlaceDetailForUserFront, TMapPlaceEventWithEventInfo } from "dplus_common_v1";
import { APIUrlOptionalParams } from "./apiUrl";

/**
 * API Routes: Place Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { placeId, langCode, start, limit }
 * @returns 경로
 */
const apiUrlPlace = (
  type: "detailGet" | "eventsGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.placeId &&
        optionalParams?.langCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/place/detail/get/${encodeURIComponent(optionalParams?.placeId)}/${optionalParams?.langCode}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.placeId] ${optionalParams?.placeId}`,
        );
      }
      break;
    case "eventsGet":
      if (
        optionalParams?.placeId &&
        optionalParams?.langCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/place/events/get/${encodeURIComponent(optionalParams?.placeId)}/${optionalParams?.langCode}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.placeId] ${optionalParams?.placeId}`,
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
 * Place 상세 화면 조회 for User Front
 * @param placeId
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponsePlaceDetailForUserFront>
 */
export const reqGetPlaceDetail = async (
  placeId: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponsePlaceDetailForUserFront>> => {
  const res = await fetch(
    apiUrlPlace("detailGet", { placeId, langCode, start, limit }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`place-${placeId}`],
      },
    },
  );

  return res.json();
};

/**
 * Place 이벤트 콘텐츠 더보기 조회 for User Front
 * @param placeId
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<TEventCardWithLocation[]>
 */
export const reqGetPlaceEvents = async (
  placeId: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapPlaceEventWithEventInfo>>
> => {
  const res = await fetch(
    apiUrlPlace("eventsGet", { placeId, langCode, start, limit }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`place-events-${placeId}`],
      },
    },
  );

  return res.json();
};
