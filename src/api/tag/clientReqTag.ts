"use client";

import {
  DplusGetListDataResponse,
  ResponseDplusAPI,
  ResponseTagDetailForUserFront,
  TMapTagEventWithEventInfo,
} from "dplus_common_v1";

import apiClient from "@/lib/apiClient";

import { apiUrlTag } from "./apiUrlTag";

/**
 * [Client] Tag 상세 화면 조회
 */
export const clientReqGetTagDetail = async (
  tagCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseTagDetailForUserFront>> => {
  const res = await apiClient.get<ResponseDplusAPI<ResponseTagDetailForUserFront>>(
    apiUrlTag.detailGet(tagCode, start, limit),
  );
  return res.data;
};

/**
 * [Client] Tag 상세 화면 Events 더보기 조회
 */
export const clientReqGetTagEvents = async (
  tagCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<DplusGetListDataResponse<TMapTagEventWithEventInfo>>> => {
  const res = await apiClient.get<
    ResponseDplusAPI<DplusGetListDataResponse<TMapTagEventWithEventInfo>>
  >(apiUrlTag.eventsGet(tagCode, start, limit));
  return res.data;
};
