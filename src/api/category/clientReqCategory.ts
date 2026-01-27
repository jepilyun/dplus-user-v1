"use client";

import {
  DplusGetListDataResponse,
  ResponseCategoryDetailForUserFront,
  ResponseDplusAPI,
  TMapCategoryEventWithEventInfo,
} from "dplus_common_v1";

import apiClient from "@/lib/apiClient";

import { apiUrlCategory } from "./apiUrlCategory";

/**
 * [Client] Category 상세 화면 조회
 */
export const clientReqGetCategoryDetail = async (
  countryCode: string,
  categoryCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCategoryDetailForUserFront>> => {
  const res = await apiClient.get<ResponseDplusAPI<ResponseCategoryDetailForUserFront>>(
    apiUrlCategory.detailGet(countryCode, categoryCode, langCode, start, limit),
  );
  return res.data;
};

/**
 * [Client] Category 상세 화면 Events 더보기 조회
 */
export const clientReqGetCategoryEvents = async (
  countryCode: string,
  categoryCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<DplusGetListDataResponse<TMapCategoryEventWithEventInfo>>> => {
  const res = await apiClient.get<
    ResponseDplusAPI<DplusGetListDataResponse<TMapCategoryEventWithEventInfo>>
  >(apiUrlCategory.eventsGet(countryCode, categoryCode, langCode, start, limit));
  return res.data;
};
