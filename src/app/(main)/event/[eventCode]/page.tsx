// 이 라우트 기본 재생성 주기: 24시간
export const revalidate = 14400; // 4시간 캐시

import { getRequestLocale } from "@/utils/get-request-locale";
import CompEventDetailPage from "@/components/comp-event/comp-event-detail-page"; // 클라이언트 컴포넌트
import { Metadata } from "next";
import { reqGetEventCodeList, reqGetEventDetail } from "@/actions/action";
import { buildKeywords, pick } from "@/utils/metadata-helper";
import { ensureAbsoluteUrl, generateStorageImageUrl } from "@/utils/generate-image-url";
import { notFound } from "next/navigation";
import { getMetadataByLang } from "@/consts/const-metadata";


/**
 * Generate metadata for the page
 * @param params - The parameters of the page
 * @returns 
 */
export async function generateMetadata(
  { params }: { params: Promise<{ eventCode: string }> }
): Promise<Metadata> {
  const { eventCode } = await params;
  const { langCode } = await getRequestLocale();
  const defaultMetadata = getMetadataByLang(langCode);

  const response = await reqGetEventDetail(eventCode, langCode).catch(() => null);
  const eventDetail = response?.dbResponse?.eventDetail ?? null;
  const metadata = eventDetail?.metadata ?? null;
  
  const title = pick(metadata?.title, eventDetail?.eventInfo?.title + " - " + metadata?.title, defaultMetadata.title);
  const description = pick(
    metadata?.description,
    defaultMetadata.description
  );
  const ogTitle = pick(metadata?.og_title, eventDetail?.eventInfo?.title + " - " + metadata?.title, defaultMetadata.og_title);

  const ogDesc = pick(
    metadata?.og_description,
    defaultMetadata.og_description
  );

  // ✅ OG 이미지: 모든 경로를 절대 URL로 변환
  const ogImageFromI18n = ensureAbsoluteUrl(metadata?.og_image, "events");
  const defaultOgImage = generateStorageImageUrl("service", "og_dplus_1200x630.jpg");

  // ✅ 우선순위: 커스텀 OG 이미지 > 첫 번째 이벤트 이미지 > 디폴트
  const ogImage = pick(
    ogImageFromI18n,
    defaultOgImage
  );

  const keywords = buildKeywords(
    metadata?.tag_set as string[] | null | undefined,
    defaultMetadata.keywords
  );

  const pageTitle = `${title} | dplus.app`;

  return {
    title: pageTitle,
    description,
    keywords,
    openGraph: {
      title: `${ogTitle ?? pageTitle} | dplus.app`,
      description: ogDesc,
      images: ogImage,
    },
    // ✅ 트위터 카드 메타데이터 추가
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: ogDesc,
      images: [ogImage ?? ""],
    },
    alternates: {
      canonical: `https://www.dplus.app/event/${eventCode}`,
    },
  };
}

// ✅ 항상 배열을 반환하도록 방어 코딩
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