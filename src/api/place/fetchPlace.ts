import {
  DplusGetListDataResponse,
  ResponseDplusAPI,
  ResponsePlaceDetailForUserFront,
  TMapPlaceEventWithEventInfo,
} from "dplus_common_v1";

import { apiUrlPlace } from "./apiUrlPlace";

/**
 * Place 상세 화면 조회 for User Front
 * @param placeId
 * @param langCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponsePlaceDetailForUserFront>
 */
export const fetchGetPlaceDetail = async (
  placeId: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponsePlaceDetailForUserFront>> => {
  const res = await fetch(
    apiUrlPlace.detailGet(placeId, langCode, start, limit),
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
 * @returns ResponseDplusAPI<DplusGetListDataResponse<TMapPlaceEventWithEventInfo>>
 */
export const fetchGetPlaceEvents = async (
  placeId: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapPlaceEventWithEventInfo>>
> => {
  const res = await fetch(
    apiUrlPlace.eventsGet(placeId, langCode, start, limit),
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
