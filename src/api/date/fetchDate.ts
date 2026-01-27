import {
  DplusGetListDataResponse,
  ResponseDplusAPI,
  TEventCardForDateDetail,
} from "dplus_common_v1";

import { apiUrlDate } from "./apiUrlDate";

/**
 * Date 상세 화면 조회 for User Front
 * @param countryCode
 * @param dateString
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>
 */
export const fetchGetDateList = async (
  countryCode: string,
  dateString: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>
> => {
  const res = await fetch(
    apiUrlDate.detailGet(countryCode, dateString, start, limit),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`date-${dateString}-${countryCode}`],
      },
    },
  );
  return res.json();
};
