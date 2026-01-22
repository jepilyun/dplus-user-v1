import { DplusGetListDataResponse, ResponseDplusAPI, TEventCardForDateDetail } from "dplus_common_v1";
import { APIUrlOptionalParams } from "./api-url";

/**
 * API Routes: Date Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { dateString, start, limit }
 * @returns 경로
 */
const apiUrlDate = (
  type: "detailGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.countryCode &&
        optionalParams?.dateString &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/date/detail/get/${encodeURIComponent(optionalParams?.countryCode)}/${encodeURIComponent(optionalParams?.dateString)}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`,
        );
        console.error(
          `Invalid optional params: [optionalParams?.dateString] ${optionalParams?.dateString}`,
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
 * Date 상세 화면 조회 for User Front
 * @param countryCode
 * @param dateString
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>
 */
export const reqGetDateList = async (
  countryCode: string,
  dateString: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>
> => {
  const res = await fetch(
    apiUrlDate("detailGet", { countryCode, dateString, start, limit }),
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
