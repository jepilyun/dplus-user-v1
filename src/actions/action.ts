import {
  ResponseTrandAPI,
  ResponseCityDetailForPublic,
  ResponseStreetDetailForPublic,
  ResponseCategoryDetailForPublic,
  ResponseStagDetailForPublic,
  ResponseContentDetailForPublic,
  ResponseCategoryDetailByCityForPublic,
  ResponseStagDetailByCityForPublic,
} from "trand_common_v1";
import { apiUrlPublicCategory, apiUrlPublicCity, apiUrlPublicContent, apiUrlPublicStag, apiUrlPublicStreet } from "./api-url";

/**
 * 도시 상세 화면 조회 for Public Component
 * @param cityCode
 * @param langCode
 * @returns ResponseTrandAPI<ResponseCityDetailForPublic[]>
 */
export const reqGetCityDetail = async (
  cityCode: string,
  langCode: string,
): Promise<ResponseTrandAPI<ResponseCityDetailForPublic>> => {
  const res = await fetch(apiUrlPublicCity("detailGet", { cityCode, langCode }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};

/**
 * 거리 상세 화면 조회 for Public Component
 * @param cityCode
 * @param streetCode
 * @param langCode
 * @returns ResponseTrandAPI<ResponseStreetDetailForPublic[]>
 */
export const reqGetStreetDetail = async (
  cityCode: string,
  streetCode: string,
  langCode: string,
): Promise<ResponseTrandAPI<ResponseStreetDetailForPublic>> => {
  const res = await fetch(apiUrlPublicStreet("detailGet", { cityCode, streetCode, langCode }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};

/**
 * Category 상세 화면 조회 for Public Component
 * @param categoryCode
 * @param langCode
 * @returns ResponseTrandAPI<ResponseCategoryDetailForPublic[]>
 */
export const reqGetCategoryDetail = async (
  categoryCode: string,
  langCode: string,
): Promise<ResponseTrandAPI<ResponseCategoryDetailForPublic>> => {
  const res = await fetch(apiUrlPublicCategory("detailGet", { categoryCode, langCode }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};

/**
 * Category 상세 화면 조회 for Public Component
 * @param cityCode
 * @param categoryCode
 * @param langCode
 * @returns ResponseTrandAPI<ResponseCategoryDetailByCityForPublic[]>
 */
export const reqGetCategoryDetailByCityCode = async (
  cityCode: string,
  categoryCode: string,
  langCode: string,
): Promise<ResponseTrandAPI<ResponseCategoryDetailByCityForPublic>> => {
  const res = await fetch(apiUrlPublicCategory("detailGetByCity", { cityCode, categoryCode, langCode }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};

/**
 * Stag 상세 화면 조회 for Public Component
 * @param stagCode
 * @param langCode
 * @returns ResponseTrandAPI<ResponseStagDetailForPublic[]>
 */
export const reqGetStagDetail = async (
  stagCode: string,
  langCode: string,
): Promise<ResponseTrandAPI<ResponseStagDetailForPublic>> => {
  const res = await fetch(apiUrlPublicStag("detailGet", { stagCode, langCode }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};

/**
 * Stag 상세 화면 조회 for Public Component
 * @param cityCode
 * @param stagCode
 * @param langCode
 * @returns ResponseTrandAPI<ResponseStagDetailByCityForPublic[]>
 */
export const reqGetStagDetailByCityCode = async (
  cityCode: string,
  stagCode: string,
  langCode: string,
): Promise<ResponseTrandAPI<ResponseStagDetailByCityForPublic>> => {
  const res = await fetch(apiUrlPublicStag("detailGetByCity", { cityCode, stagCode, langCode }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};

/**
 * Content 상세 화면 조회 for Public Component
 * @param cityCode
 * @param contentCode
 * @param langCode
 * @returns ResponseTrandAPI<ResponseStagDetailForPublic[]>
 */
export const reqGetContentDetail = async (
  cityCode: string,
  contentCode: string,
  langCode: string,
): Promise<ResponseTrandAPI<ResponseContentDetailForPublic>> => {
  const res = await fetch(apiUrlPublicContent("detailGet", { cityCode, contentCode, langCode }), {
    method: "GET",
    credentials: "include",
  });

  return res.json();
};

// /**
//  * 도시 목록 검색
//  * @param keyword
//  * @param page
//  * @returns ResponseTrandAPI<ResponseDBSelect<CityListAdmin[]>>
//  */
// export const reqSearchCity = async (
//   keyword: string,
//   page: number,
// ): Promise<ResponseTrandAPI<ResponseDBSelect<CityListAdmin[]>>> => {
//   const res = await fetch(apiUrlAdminCity("search", { keyword, page }), {
//     method: "GET",
//     credentials: "include",
//   });
//   return res.json();
// };

// /**
//  * 도시 목록 조회 for Client Component
//  * @returns ResponseTrandAPI<ResponseDBSelect<CityOption[]>>
//  */
// export const reqGetCityListAllOptions = async (): Promise<ResponseTrandAPI<ResponseDBSelect<CityOption[]>>> => {
//   const res = await fetch(apiUrlAdminCity("listAllOptions"), {
//     method: "GET",
//     credentials: "include",
//   });
//   return res.json();
// };

// /**
//  * 도시 상세 조회 for Client Component
//  * @param cityCode
//  * @returns ResponseTrandAPI<ResponseCityForAdmin>
//  */
// export const reqGetCityDetail = async (cityCode: string): Promise<ResponseTrandAPI<ResponseCityForAdmin>> => {
//   const res = await fetch(apiUrlAdminCity("detailGet", { cityCode }), {
//     method: "GET",
//     credentials: "include",
//   });
//   return res.json();
// };

// /**
//  * 도시 생성 for Client Component
//  * @param city
//  * @returns ResponseTrandAPI<ResponseDBSelect<City[]>>
//  */
// export const reqCreateCity = async (city: CityInsert): Promise<ResponseTrandAPI<ResponseDBSelect<City[]>>> => {
//   const res = await fetch(apiUrlAdminCity("create"), {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(city),
//     credentials: "include",
//   });
//   return res.json();
// };

// /**
//  * 도시 수정 for Client Component
//  * @param cityCode
//  * @param modifiedData
//  * @returns ResponseTrandAPI<ResponseDBSelect<City[]>>
//  */
// export const reqUpdateCityDetail = async (
//   cityCode: string,
//   modifiedData: Partial<City>,
// ): Promise<ResponseTrandAPI<ResponseDBSelect<City[]>>> => {
//   const res = await fetch(apiUrlAdminCity("detailUpdate", { cityCode }), {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(modifiedData),
//     credentials: "include",
//   });
//   return res.json();
// };

// /**
//  * 도시 삭제
//  * @param cityCode
//  * @returns ResponseTrandAPI<ResponseDBSelect<City[]>>
//  */
// export const reqDeleteCityDetail = async (cityCode: string): Promise<ResponseTrandAPI<ResponseDBSelect<City[]>>> => {
//   const res = await fetch(apiUrlAdminCity("detailDelete", { cityCode }), {
//     method: "DELETE",
//     credentials: "include",
//   });
//   return res.json();
// };
