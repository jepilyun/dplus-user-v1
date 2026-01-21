import { DplusGetListDataResponse, ResponseDplusAPI, TEventCardForDateDetail } from "dplus_common_v1";
import { apiUrlToday } from "./api-url";

/**
 * Today 상세 화면 조회 for User Front
 * @param countryCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetTodayList = async (
  countryCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>
> => {
  const res = await fetch(
    apiUrlToday("detailGet", { countryCode, start, limit }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`today-${countryCode}`],
      },
    },
  );
  return res.json();
};
