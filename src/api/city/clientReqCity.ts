"use client";

import {
  DplusGetListDataResponse,
  ResponseCityDetailForUserFront,
  ResponseDplusAPI,
  TMapCityEventWithEventInfo,
} from "dplus_common_v1";

import apiClient from "@/lib/apiClient";

import { apiUrlCity } from "./apiUrlCity";

/**
 * [Client] City 상세 화면 조회
 */
export const clientReqGetCityDetail = async (
  cityCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCityDetailForUserFront>> => {
  const res = await apiClient.get<ResponseDplusAPI<ResponseCityDetailForUserFront>>(
    apiUrlCity.detailGet(cityCode, langCode, start, limit),
  );
  return res.data;
};

/**
 * [Client] City 상세 화면 Events 더보기 조회
 */
export const clientReqGetCityEvents = async (
  cityCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<DplusGetListDataResponse<TMapCityEventWithEventInfo>>> => {
  const res = await apiClient.get<
    ResponseDplusAPI<DplusGetListDataResponse<TMapCityEventWithEventInfo>>
  >(apiUrlCity.eventsGet(cityCode, langCode, start, limit));
  return res.data;
};
