// 이 라우트 기본 재생성 주기: 24시간
export const revalidate = 14400; // 24시간 × 60분 × 60초 = 86400초

import { getRequestLocale } from "@/utils/get-request-locale";
import CompEventDetailPage from "@/components/comp-event/comp-event-detail-page"; // 클라이언트 컴포넌트
import { Metadata } from "next";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { reqGetEventCodeList, reqGetEventDetail, reqGetEventMetadata } from "@/actions/action";
import { buildKeywords, pick } from "@/utils/metadata-helper";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { notFound } from "next/navigation";


/**
 * Generate metadata for the page
 * @param params - The parameters of the page
 * @returns 
 */
export async function generateMetadata(
  { params }: { params: { eventCode: string } }
): Promise<Metadata> {
  const { langCode } = getRequestLocale();
  const dict = getDplusI18n(langCode);

  // API 호출 (에러 대비 안전가드)
  const response = await reqGetEventDetail(params.eventCode, langCode).catch(() => null);
  const data = response?.dbResponse?.event ?? null;
  const metadataI18n = response?.dbResponse?.metadataI18n?.[0] ?? null;

  const title = pick(metadataI18n?.title, data?.metadata_title, data?.title, dict.metadata.title);
  const description = pick(
    metadataI18n?.description,
    data?.metadata_description,
    data?.description,
    dict.metadata.description
  );
  const ogTitle = pick(metadataI18n?.og_title, data?.metadata_og_title, data?.title, dict.metadata.og_title);
  const ogDesc = pick(
    metadataI18n?.og_description,
    data?.metadata_og_description,
    data?.description,
    dict.metadata.og_description
  );
  const ogImage = pick(
    metadataI18n?.og_image, 
    data?.metadata_og_image, 
    data?.hero_image_01, 
    data?.hero_image_02,
    data?.hero_image_03,
    data?.hero_image_04,
    data?.hero_image_05,
    data?.thumbnail_main_01,
    data?.thumbnail_main_02,
    data?.thumbnail_main_03,
    data?.thumbnail_main_04,
    data?.thumbnail_main_05,
    data?.thumbnail_vertical_01,
    data?.thumbnail_vertical_02,
    data?.thumbnail_vertical_03,
    data?.thumbnail_vertical_04,
    data?.thumbnail_vertical_05,
    generateStorageImageUrl("service", "og_dplus_1200x630.jpg"),
    dict.metadata.og_image
  );

  const keywords = buildKeywords(
    metadataI18n?.tag_set as string[] | null | undefined,
    data?.metadata_keywords ?? null,
    dict.metadata.keywords
  );

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      images: ogImage, // string | string[] | OGImage[]
    },
    alternates: {
      canonical: `https://www.dplus.app/event/${params?.eventCode}`,
    },
  };
}


// ✅ 항상 배열을 반환하도록 방어 코딩
export async function generateStaticParams() {
  try {
    const res = await reqGetEventCodeList(100);
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
  searchParams,
}: {
  params: { eventCode: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { fullLocale, langCode } = getRequestLocale();

  try {
    const response = await reqGetEventDetail(params.eventCode, langCode);
    const eventDetail = response?.dbResponse ?? null;

    // ✅ 데이터 검증
    const isEmptyObj =
      !eventDetail || 
      (typeof eventDetail === "object" && !Array.isArray(eventDetail) && Object.keys(eventDetail).length === 0);

    // ✅ 데이터가 없거나 event 객체가 없으면 404
    if (!response?.success || isEmptyObj || !eventDetail?.event) {
      notFound();
    }

    return (
      <CompEventDetailPage
        eventCode={params.eventCode}
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