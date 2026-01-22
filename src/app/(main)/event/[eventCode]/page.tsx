// 이 라우트 기본 재생성 주기: 4시간
export const revalidate = 14400;

import { Metadata } from "next";
import { notFound } from "next/navigation";

import { reqGetEventCodeList, reqGetEventDetail } from "@/req/req-event";
import CompEventDetailPage from "@/components/event/comp-event-detail-page";
import { generateDetailMetadata } from "@/utils/generate-metadata";
import { getRequestLocale } from "@/utils/get-request-locale";

/**
 * Generate metadata for the page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventCode: string }>;
}): Promise<Metadata> {
  const { eventCode } = await params;
  const { langCode } = await getRequestLocale();

  const response = await reqGetEventDetail(eventCode, langCode).catch(
    () => null
  );
  const eventDetail = response?.dbResponse?.eventDetail ?? null;

  return generateDetailMetadata({
    langCode,
    routePath: "event",
    code: eventCode,
    detailName: eventDetail?.eventInfo?.title,
    metadata: eventDetail?.metadata,
    imageBucket: "events",
  });
}

/*
 * Build 시점에 생성하고자 하는 페이지들의 parameter 반환
 * 항상 배열을 반환하도록 방어 코딩
 */
export async function generateStaticParams() {
  try {
    const res = await reqGetEventCodeList(300);
    const list = res?.dbResponse ?? []; // 없으면 빈 배열

    return list.map((event: { event_code: string }) => ({
      eventCode: event.event_code,
    }));
  } catch {
    return []; // 실패해도 배열 반환
  }
}

/**
 * 이벤트 상세 페이지
 * @param params - 이벤트 ID
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function EventDetailPage({
  params,
  // searchParams,
}: {
  params: Promise<{ eventCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { eventCode } = await params;
  const { fullLocale, langCode } = await getRequestLocale();

  try {
    const response = await reqGetEventDetail(eventCode, langCode);
    const eventDetail = response?.dbResponse ?? null;

    // ✅ 데이터 검증
    const isEmptyObj =
      !eventDetail || 
      (typeof eventDetail === "object" && !Array.isArray(eventDetail) && Object.keys(eventDetail).length === 0);

    // ✅ 데이터가 없거나 event 객체가 없으면 404
    if (!response?.success || isEmptyObj || !eventDetail?.eventDetail) {
      notFound();
    }

    return (
      <CompEventDetailPage
        eventCode={eventCode}
        fullLocale={fullLocale}
        langCode={langCode}
        initialData={eventDetail}
      />
    );
  } catch (error) {
    // ✅ 네트워크 에러나 예상치 못한 에러도 404로 처리
    console.error('Failed to fetch event detail:', error);
    notFound();
  }
}