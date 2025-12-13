// 이 라우트 기본 재생성 주기: 24시간
export const revalidate = 14400; // 4시간 캐시

import { getRequestLocale } from "@/utils/get-request-locale";
import CompEventDetailPage from "@/components/comp-event/comp-event-detail-page"; // 클라이언트 컴포넌트
import { Metadata } from "next";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { reqGetEventCodeList, reqGetEventDetail } from "@/actions/action";
import { buildKeywords, pick } from "@/utils/metadata-helper";
import { ensureAbsoluteUrl, generateStorageImageUrl } from "@/utils/generate-image-url";
import { notFound } from "next/navigation";
import { getEventOgImageUrl } from "@/utils/set-image-urls";
import { calculateDaysFromToday } from "@/utils/calc-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { getMetadataByLang } from "@/consts/const-metadata";


/**
 * Generate metadata for the page
 * @param params - The parameters of the page
 * @returns 
 */
export async function generateMetadata(
  { params }: { params: { eventCode: string } }
): Promise<Metadata> {
  const { langCode } = getRequestLocale();
  const defaultMetadata = getMetadataByLang(langCode);

  const response = await reqGetEventDetail(params.eventCode, langCode).catch(() => null);
  const data = response?.dbResponse?.event ?? null;
  const metadataI18n = response?.dbResponse?.metadataI18n?.[0] ?? null;
  
  const title = pick(metadataI18n?.title, data?.metadata_title, data?.title, defaultMetadata.title);
  const description = pick(
    metadataI18n?.description,
    data?.metadata_description,
    data?.description,
    defaultMetadata.description
  );
  const ogTitle = pick(metadataI18n?.og_title, data?.metadata_og_title, data?.title, defaultMetadata.og_title);

  const ogDesc = pick(
    metadataI18n?.og_description,
    data?.metadata_og_description,
    data?.description,
    defaultMetadata.og_description
  );

  // ✅ OG 이미지: 모든 경로를 절대 URL로 변환
  const ogImageFromI18n = ensureAbsoluteUrl(metadataI18n?.og_image, "categories");
  const ogImageFromMetadata = ensureAbsoluteUrl(data?.metadata_og_image, "categories");
  const ogImageFromCategory = getEventOgImageUrl(data); // 이미 절대 URL
  const defaultOgImage = generateStorageImageUrl("service", "og_dplus_1200x630.jpg");

  // ✅ 우선순위: 커스텀 OG 이미지 > 첫 번째 이벤트 이미지 > 디폴트
  const ogImage = pick(
    ogImageFromI18n,
    ogImageFromMetadata,
    ogImageFromCategory,
    defaultOgImage
  );

  const keywords = buildKeywords(
    metadataI18n?.tag_set as string[] | null | undefined,
    data?.metadata_keywords ?? null,
    defaultMetadata.keywords
  );

  const pageTitle = `${title} | dplus.app`;

  return {
    title: pageTitle,
    description,
    keywords,
    openGraph: {
      title: pageTitle,
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
      canonical: `https://www.dplus.app/event/${params?.eventCode}`,
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