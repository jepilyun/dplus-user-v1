import { DplusGetListDataResponse, ResponseCategoryDetailForUserFront, ResponseDplusAPI, ResponseMetadataForUserFront, TMapCategoryEventWithEventInfo } from "dplus_common_v1";
import { APIUrlOptionalParams } from "./apiUrl";

/**
 * API Routes: Category Detail 경로 생성
 * @param type 경로 타입
 * @param optionalParams { countryCode, categoryCode, start, limit }
 * @returns 경로
 */
export const apiUrlCategory = (
  type: "detailGet" | "eventsGet" | "getCategoryCodes" | "metadataGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (
        optionalParams?.countryCode &&
        optionalParams?.categoryCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number" &&
        optionalParams?.langCode
      ) {
        path = `/api/category/detail/get/${encodeURIComponent(optionalParams?.countryCode)}/${encodeURIComponent(optionalParams?.categoryCode)}/${optionalParams?.langCode}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`,
        );
        console.error(
          `Invalid optional params: [optionalParams?.categoryCode] ${optionalParams?.categoryCode}`,
        );
      }
      break;
    case "eventsGet":
      if (
        optionalParams?.countryCode &&
        optionalParams?.categoryCode &&
        typeof optionalParams?.start === "number" &&
        typeof optionalParams?.limit === "number"
      ) {
        path = `/api/category/events/get/${encodeURIComponent(optionalParams?.countryCode)}/${encodeURIComponent(optionalParams?.categoryCode)}/${optionalParams?.langCode}/${optionalParams?.start}/${optionalParams?.limit}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`,
        );
        console.error(
          `Invalid optional params: [optionalParams?.categoryCode] ${optionalParams?.categoryCode}`,
        );
      }
      break;
    case "getCategoryCodes":
      const qp = new URLSearchParams();
      if (
        typeof optionalParams?.limit === "number" &&
        Number.isFinite(optionalParams.limit)
      ) {
        qp.set("limit", String(optionalParams.limit));
      }
      const qs = qp.toString();
      path = `/api/category/get/code/list${qs ? `?${qs}` : ""}`;
      break;
    case "metadataGet":
      if (optionalParams?.categoryCode && optionalParams?.langCode) {
        path = `/api/category/metadata/get/${encodeURIComponent(optionalParams?.categoryCode)}/${optionalParams?.langCode}`;
      } else {
        console.error(
          `Invalid optional params: [optionalParams?.langCode] ${optionalParams?.langCode}`,
        );
        console.error(
          `Invalid optional params: [optionalParams?.categoryCode] ${optionalParams?.categoryCode}`,
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
 * Category 상세 화면 조회 for User Front
 * @param countryCode
 * @param categoryCode
 * @param start
 * @param limit
 * @param langCode
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCategoryDetail = async (
  countryCode: string,
  categoryCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCategoryDetailForUserFront>> => {
  const res = await fetch(
    apiUrlCategory("detailGet", {
      countryCode,
      categoryCode,
      langCode,
      start,
      limit,
    }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`category-${countryCode}-${categoryCode}`],
      },
    },
  );

  return res.json();
};

/**
 * Category 상세 화면 Events 더보기 조회 for User Front
 * @param countryCode
 * @param categoryCode
 * @param start
 * @param limit
 * @returns ResponseDplusAPI<ResponseFolderDetailForUserFront>
 */
export const reqGetCategoryEvents = async (
  countryCode: string,
  categoryCode: string,
  start: number,
  limit: number,
): Promise<
  ResponseDplusAPI<DplusGetListDataResponse<TMapCategoryEventWithEventInfo>>
> => {
  const res = await fetch(
    apiUrlCategory("eventsGet", { countryCode, categoryCode, start, limit }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 14400,
        tags: [`category-events-${countryCode}-${categoryCode}`],
      },
    },
  );
  return res.json();
};

/**
 * Category 코드 목록 조회 for User Front
 * @returns ResponseDplusAPI<string[]>
 */
export const reqGetCategoryCodes = async (
  limit: number = 200,
): Promise<ResponseDplusAPI<{ category_code: string }[]>> => {
  const res = await fetch(apiUrlCategory("getCategoryCodes", { limit }), {
    method: "GET",
    credentials: "include",
    next: {
      revalidate: 3600,
      tags: [`category-code-list`],
    },
  });

  return res.json();
};

/**
 * Category 메타데터 조회 for User Front
 * @param categoryCode
 * @param langCode
 * @returns ResponseDplusAPI<ResponseMetadataForUserFront>
 */
export const reqGetCategoryMetadata = async (
  categoryCode: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseMetadataForUserFront>> => {
  const res = await fetch(
    apiUrlCategory("metadataGet", { categoryCode, langCode }),
    {
      method: "GET",
      credentials: "include",
      next: {
        revalidate: 86400,
        tags: [`category-metadata-${categoryCode}-${langCode}`],
      },
    },
  );

  return res.json();
};
