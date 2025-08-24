import {
  ResponseDplusAPI,
  ResponseEventDetailForUserFront,
} from "dplus_common_v1";
import { apiUrlEvent } from "./api-url";

/**
 * Event 상세 화면 조회 for User Front
 * @param eventId
 * @returns ResponseDplusAPI<ResponseEventDetailForUserFront>
 */
export const reqGetEventDetail = async (
  eventId: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseEventDetailForUserFront>> => {
  const res = await fetch(apiUrlEvent("detailGet", { eventId, langCode }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};
