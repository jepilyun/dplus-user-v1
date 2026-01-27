"use client";

import {
  DplusGetListDataResponse,
  ResponseDplusAPI,
  ResponseStagDetailForUserFront,
  TMapStagEventWithEventInfo,
} from "dplus_common_v1";

import apiClient from "@/lib/apiClient";

import { apiUrlStag } from "./apiUrlStag";

/**
 * [Client] Stag 상세 화면 조회
 */
export const clientReqGetStagDetail = async (
  stagCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseStagDetailForUserFront>> => {
  const res = await apiClient.get<ResponseDplusAPI<ResponseStagDetailForUserFront>>(
    apiUrlStag.detailGet(stagCode, langCode, start, limit),
  );
  return res.data;
};

/**
 * [Client] Stag 상세 화면 Events 더보기 조회
 */
export const clientReqGetStagEvents = async (
  stagCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<DplusGetListDataResponse<TMapStagEventWithEventInfo>>> => {
  const res = await apiClient.get<
    ResponseDplusAPI<DplusGetListDataResponse<TMapStagEventWithEventInfo>>
  >(apiUrlStag.eventsGet(stagCode, start, limit));
  return res.data;
};
