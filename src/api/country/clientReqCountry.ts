"use client";

import {
  DplusGetListDataResponse,
  ResponseCountryDetailForUserFront,
  ResponseDplusAPI,
  TMapCountryEventWithEventInfo,
} from "dplus_common_v1";

import apiClient from "@/lib/apiClient";

import { apiUrlCountry } from "./apiUrlCountry";

/**
 * [Client] Country 상세 화면 조회
 */
export const clientReqGetCountryDetail = async (
  countryCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseCountryDetailForUserFront>> => {
  const res = await apiClient.get<ResponseDplusAPI<ResponseCountryDetailForUserFront>>(
    apiUrlCountry.detailGet(countryCode, langCode, start, limit),
  );
  return res.data;
};

/**
 * [Client] Country 상세 화면 Events 더보기 조회
 */
export const clientReqGetCountryEvents = async (
  countryCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<DplusGetListDataResponse<TMapCountryEventWithEventInfo>>> => {
  const res = await apiClient.get<
    ResponseDplusAPI<DplusGetListDataResponse<TMapCountryEventWithEventInfo>>
  >(apiUrlCountry.eventsGet(countryCode, langCode, start, limit));
  return res.data;
};
