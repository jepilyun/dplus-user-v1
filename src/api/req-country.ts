import { DplusGetListDataResponse, ResponseCountryDetailForUserFront, ResponseDplusAPI, ResponseMetadataForUserFront, TMapCountryEventWithEventInfo } from "dplus_common_v1";
import { APIUrlOptionalParams } from "./apiUrl";


/**
 * API Routes: Country Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { countryCode, start, limit }
 * @returns 경로
 */
const apiUrlCountry = (
  type: "detailGet" | "eventsGet" | "getCountryCodes" | "metadataGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.countryCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number" &&
        optionalParams?.langCode
      ) {
        path = `/api/country/detail/get/${encodeURIComponent(optionalParams?.countryCode)}/${optionalParams?.langCode}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`,
        );
      }
      break;
    case "eventsGet":
      if (
        optionalParams?.countryCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number" &&
        optionalParams?.langCode
      ) {
        path = `/api/country/events/get/${encodeURIComponent(optionalParams?.countryCode)}/${optionalParams?.langCode}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`,
        );
      }
      break;
    case "getCountryCodes":
      path = `/api/country/get/code/list`;
      break;
    case "metadataGet":
      if (optionalParams?.countryCode && optionalParams?.langCode) {
        path = `/api/country/metadata/get/${encodeURIComponent(optionalParams?.countryCode)}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`,
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
 * Country 상세 화면 조회 for User Front
 * @param dateString
 * @param langCode
 * @param start
 * @param limit
 * @param langCode
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCountryDetail = async (
  countryCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCountryDetailForUserFront>> => {
  const res = await fetch(
    apiUrlCountry("detailGet", { countryCode, start, limit, langCode }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`country-${countryCode}`],
      },
    },
  );
  return res.json();
};

/**
 * Country 상세 화면 Events 더보기 조회 for User Front
 * @param countryCode
 * @param start
 * @param limit
 * @param langCode
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCountryEvents = async (
  countryCode: string,
  start: number,
  limit: number,
  langCode: string,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapCountryEventWithEventInfo>>
> => {
  const res = await fetch(
    apiUrlCountry("eventsGet", { countryCode, start, limit, langCode }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`country-events-${countryCode}`],
      },
    },
  );
  return res.json();
};

/**
 * Country 코드 목록 조회 for User Front
 * @returns ResponseDplusAPI<string[]>
 */
export const reqGetCountryCodes = async (): Promise<
  ResponseDplusAPI<{ country_code: string }[]>
> => {
  const res = await fetch(apiUrlCountry("getCountryCodes"), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 3600,
      tags: [`country-code-list`],
    },
  });

  return res.json();
};

/**
 * Country 메타데터 조회 for User Front
 * @param countryCode
 * @param langCode
 * @returns ResponseDplusAPI<ResponseMetadataForUserFront>
 */
export const reqGetCountryMetadata = async (
  countryCode: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseMetadataForUserFront>> => {
  const res = await fetch(
    apiUrlCountry("metadataGet", { countryCode, langCode }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 86400,
        tags: [`country-metadata-${countryCode}-${langCode}`],
      },
    },
  );
  return res.json();
};
