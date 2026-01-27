"use client";

import {
  DplusGetListDataResponse,
  ResponseDplusAPI,
  ResponseGroupDetailForUserFront,
  TMapGroupEventWithEventInfo,
} from "dplus_common_v1";

import apiClient from "@/lib/apiClient";

import { apiUrlGroup } from "./apiUrlGroup";

/**
 * [Client] Group 상세 화면 조회
 */
export const clientReqGetGroupDetail = async (
  groupCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseGroupDetailForUserFront>> => {
  const res = await apiClient.get<ResponseDplusAPI<ResponseGroupDetailForUserFront>>(
    apiUrlGroup.detailGet(groupCode, langCode, start, limit),
  );
  return res.data;
};

/**
 * [Client] Group 상세 화면 Events 더보기 조회
 */
export const clientReqGetGroupEvents = async (
  groupCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<DplusGetListDataResponse<TMapGroupEventWithEventInfo>>> => {
  const res = await apiClient.get<
    ResponseDplusAPI<DplusGetListDataResponse<TMapGroupEventWithEventInfo>>
  >(apiUrlGroup.eventsGet(groupCode, start, limit));
  return res.data;
};
