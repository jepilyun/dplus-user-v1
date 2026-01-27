"use client";

import {
  DplusGetListDataResponse,
  ResponseDplusAPI,
  TEventCardForDateDetail,
} from "dplus_common_v1";

import apiClient from "@/lib/apiClient";

import { apiUrlToday } from "./apiUrlToday";

/**
 * [Client] Today 상세 화면 조회
 */
export const clientReqGetTodayList = async (
  countryCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>> => {
  const res = await apiClient.get<
    ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>
  >(apiUrlToday.detailGet(countryCode, start, limit));
  return res.data;
};
