"use client";

import {
  DplusGetListDataResponse,
  ResponseDplusAPI,
  ResponseFolderDetailForUserFront,
  TMapFolderEventWithEventInfo,
} from "dplus_common_v1";

import apiClient from "@/lib/apiClient";

import { apiUrlFolder } from "./apiUrlFolder";

/**
 * [Client] Folder 상세 화면 조회
 */
export const clientReqGetFolderDetail = async (
  folderCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<ResponseFolderDetailForUserFront>> => {
  const res = await apiClient.get<ResponseDplusAPI<ResponseFolderDetailForUserFront>>(
    apiUrlFolder.detailGet(folderCode, langCode, start, limit),
  );
  return res.data;
};

/**
 * [Client] Folder 상세 화면 Events 더보기 조회
 */
export const clientReqGetFolderEvents = async (
  folderCode: string,
  langCode: string,
  start: number,
  limit: number,
): Promise<ResponseDplusAPI<DplusGetListDataResponse<TMapFolderEventWithEventInfo>>> => {
  const res = await apiClient.get<
    ResponseDplusAPI<DplusGetListDataResponse<TMapFolderEventWithEventInfo>>
  >(apiUrlFolder.eventsGet(folderCode, langCode, start, limit));
  return res.data;
};
