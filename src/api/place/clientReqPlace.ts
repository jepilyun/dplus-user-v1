"use client";

import {
  DplusGetListDataResponse,
  ResponseDplusAPI,
  ResponsePlaceDetailForUserFront,
  TMapPlaceEventWithEventInfo,
} from "dplus_common_v1";

import apiClient from "@/lib/apiClient";

import { apiUrlPlace } from "./apiUrlPlace";

/**
 * [Client] Place 상세 화면 조회
 */
export const clientReqGetPlaceDetail = async (
  placeId: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponsePlaceDetailForUserFront>> => {
  const res = await apiClient.get<ResponseDplusAPI<ResponsePlaceDetailForUserFront>>(
    apiUrlPlace.detailGet(placeId, langCode, start, limit),
  );
  return res.data;
};

/**
 * [Client] Place 이벤트 콘텐츠 더보기 조회
 */
export const clientReqGetPlaceEvents = async (
  placeId: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<DplusGetListDataResponse<TMapPlaceEventWithEventInfo>>> => {
  const res = await apiClient.get<
    ResponseDplusAPI<DplusGetListDataResponse<TMapPlaceEventWithEventInfo>>
  >(apiUrlPlace.eventsGet(placeId, langCode, start, limit));
  return res.data;
};
