// 이 라우트 기본 재생성 주기: 24시간
export const revalidate = 86400;

import { Metadata } from "next";
import { notFound } from "next/navigation";

import { generateDetailMetadata } from "@/utils/generate-metadata";
import { getRequestLocale } from "@/utils/get-request-locale";
import { LIST_LIMIT } from "dplus_common_v1";
import { reqGetPlaceDetail } from "@/req/req-place";
import CompPlaceDetailPage from "@/components/place/comp-place-detail-page";

/**
 * Generate metadata
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ placeId: string }>;
}): Promise<Metadata> {
  const { placeId } = await params;
  const { langCode } = await getRequestLocale();

  const response = await reqGetPlaceDetail(placeId, langCode, 0, 36).catch(
    () => null
  );
  const placeDetail = response?.dbResponse?.placeDetail ?? null;

  return generateDetailMetadata({
    langCode,
    routePath: "place",
    code: placeId,
    detailName: placeDetail?.name_en,
    metadata: null,
    imageBucket: undefined,
  });
}

/**
 * Place 상세 페이지
 * @param params - PLACE ID
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function PlaceDetailPage({
  params,
  // searchParams,
}: {
  params: Promise<{ placeId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { placeId } = await params;
  const { fullLocale, langCode } = await getRequestLocale();

  try {
    // ✅ 서버에서 데이터 가져오기 (캐시 적용됨)
    const response = await reqGetPlaceDetail(
      placeId, 
      langCode, 
      0, 
      LIST_LIMIT.default
    );

    const initialData = response?.dbResponse ?? null;

    // ✅ 데이터 검증
    const isEmptyObj =
      !initialData || 
      (typeof initialData === "object" && !Array.isArray(initialData) && Object.keys(initialData).length === 0);

    // ✅ 응답이 없거나 실패한 경우 404
    if (!response?.success || isEmptyObj || !initialData?.placeDetail) {
      notFound();
    }

    return (
      <CompPlaceDetailPage
        placeId={placeId}
        fullLocale={fullLocale}
        langCode={langCode}
        initialData={initialData}
      />
    );
  } catch (error) {
    // ✅ 네트워크 에러나 예상치 못한 에러도 404로 처리
    console.error('Failed to fetch folder detail:', error);
    notFound();
  }
}