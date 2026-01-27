"use client";

import {
  ResponseDplusAPI,
  ResponseEventDetailForUserFront,
} from "dplus_common_v1";

import apiClient from "@/lib/apiClient";

import { apiUrlEvent } from "./apiUrlEvent";

/**
 * [Client] Event 상세 화면 조회
 */
export const clientReqGetEventDetail = async (
  eventCode: string,
  langCode: string,
): Promise<ResponseDplusAPI<ResponseEventDetailForUserFront>> => {
  const res = await apiClient.get<ResponseDplusAPI<ResponseEventDetailForUserFront>>(
    apiUrlEvent.detailGet(eventCode, langCode),
  );
  return res.data;
};
