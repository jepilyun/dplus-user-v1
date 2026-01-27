"use client";

import {
  DplusGetListDataResponse,
  ResponseDplusAPI,
  TEventCardForDateDetail,
} from "dplus_common_v1";

import apiClient from "@/lib/apiClient";

import { apiUrlDate } from "./apiUrlDate";

/**
 * [Client] Date 상세 화면 조회
 */
export const clientReqGetDateList = async (
  countryCode: string,
  dateString: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>> => {
  const res = await apiClient.get<
    ResponseDplusAPI<DplusGetListDataResponse<TEventCardForDateDetail>>
  >(apiUrlDate.detailGet(countryCode, dateString, start, limit));
  return res.data;
};
