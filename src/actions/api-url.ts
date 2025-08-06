import { LIST_LIMIT } from "dplus_common_v1";

/**
 * API URL 옵션 파라미터 타입
 */
export type APIUrlOptionalParams = {
  langCode?: string | null;
  categoryCode?: string | null;
  countryCode?: string | null;
  cityCode?: string | null;
  streetCode?: string | null;
  stagCode?: string | null;
  contentCode?: string | null;



  slugName?: string | null;
  photoUri?: string | null;
  keyword?: string | null;
  page?: number | null;
  size?: number | null;
  videoId?: string | null;
  channelId?: string | null;
  primaryKey?: string | null;  
  tag?: string | null;
  keywordCode?: string | null;
  timeline?: string | null;
  aid?: string | null;
  id?: string | null;
  hashCode?: string | null;
  instaHashCode?: string | null;
};


/**
 * API Routes: Public City 경로 생성
 * @param type 경로 타입
 * @param optionalParams { cityCode, langCode }
 * @returns 경로
 */
export const apiUrlPublicCity = (
  type: "listByCountry" | "detailGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "listByCountry":
      if (optionalParams?.countryCode) {
        path = `/api/public/city/listByCountry/${optionalParams?.countryCode}/${optionalParams?.page ? optionalParams?.page : 1}/${optionalParams?.size ? optionalParams?.size : LIST_LIMIT.n50}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.countryCode] ${optionalParams?.countryCode}`);
      }
      break;
    case "detailGet":
      if (optionalParams?.cityCode && optionalParams?.langCode) {
        path = `/api/public/city/detail/get/${optionalParams?.cityCode}/${optionalParams?.langCode}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.cityCode] ${optionalParams?.cityCode}`);
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};



/**
 * API Routes: Public Street 경로 생성
 * @param type 경로 타입
 * @param optionalParams { streetCode, langCode }
 * @returns 경로
 */
export const apiUrlPublicStreet = (
  type: "detailGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (optionalParams?.cityCode && optionalParams?.streetCode && optionalParams?.langCode) {
        path = `/api/public/street/detail/get/${optionalParams?.cityCode}/${optionalParams?.streetCode}/${optionalParams?.langCode}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.streetCode] ${optionalParams?.streetCode}`);
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};




/**
 * API Routes: Public Category 경로 생성
 * @param type 경로 타입
 * @param optionalParams { categoryCode, langCode }
 * @returns 경로
 */
export const apiUrlPublicCategory = (
  type: "detailGet" | "detailGetByCity",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (optionalParams?.categoryCode && optionalParams?.langCode) {
        path = `/api/public/category/detail/get/${optionalParams?.categoryCode}/${optionalParams?.langCode}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.categoryCode] ${optionalParams?.categoryCode}`);
      }
      break;
    case "detailGetByCity":
      if (optionalParams?.cityCode && optionalParams?.categoryCode && optionalParams?.langCode) {
        path = `/api/public/category/detail/getByCity/${optionalParams?.cityCode}/${optionalParams?.categoryCode}/${optionalParams?.langCode}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.cityCode] ${optionalParams?.cityCode}`);
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};




/**
 * API Routes: Public Stag 경로 생성
 * @param type 경로 타입
 * @param optionalParams { stagCode, langCode }
 * @returns 경로
 */
export const apiUrlPublicStag = (
  type: "detailGet" | "detailGetByCity",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (optionalParams?.stagCode && optionalParams?.langCode) {
        path = `/api/public/tag/detail/get/${optionalParams?.stagCode}/${optionalParams?.langCode}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.stagCode] ${optionalParams?.stagCode}`);
      }
      break;
    case "detailGetByCity":
      if (optionalParams?.cityCode && optionalParams?.stagCode && optionalParams?.langCode) {
        path = `/api/public/tag/detail/getByCity/${optionalParams?.cityCode}/${optionalParams?.stagCode}/${optionalParams?.langCode}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.cityCode] ${optionalParams?.cityCode}`);
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};




/**
 * API Routes: Public Content 경로 생성
 * @param type 경로 타입
 * @param optionalParams { stagCode, langCode }
 * @returns 경로
 */
export const apiUrlPublicContent = (
  type: "detailGet",
  optionalParams?: APIUrlOptionalParams,
) => {
  let path = "";

  switch (type) {
    case "detailGet":
      if (optionalParams?.cityCode && optionalParams?.contentCode && optionalParams?.langCode) {
        path = `/api/public/content/detail/get/${optionalParams?.cityCode}/${optionalParams?.contentCode}/${optionalParams?.langCode}`;
      } else {
        console.error(`Invalid optional params: [optionalParams?.contentCode] ${optionalParams?.contentCode}`);
      }
      break;
    default:
      console.error(`Invalid route: ${type}`);
      break;
  }

  return `${process.env.NEXT_PUBLIC_DEV_API_URL}${path}`;
};
