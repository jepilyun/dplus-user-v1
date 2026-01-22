import { DplusGetListDataResponse, ResponseDplusAPI, TEventCardForDateDetail } from "dplus_common_v1";
import { APIUrlOptionalParams } from "./api-url";


/**
 * API Routes: Today Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { countryCode, start, limit }
 * @returns 경로
 */
const apiUrlToday = (
  type: "detailGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.countryCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/today/detail/get/${encodeURIComponent(optionalParams?.countryCode)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`,
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
