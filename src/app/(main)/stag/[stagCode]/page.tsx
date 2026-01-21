// 이 라우트 기본 재생성 주기: 4시간
export const revalidate = 14400;

import { Metadata } from "next";
import { notFound } from "next/navigation";

import { reqGetStagDetail } from "@/actions/req-stag";
import CompStagDetailPage from "@/components/comp-stag/comp-stag-detail-page";
import { generateDetailMetadata } from "@/utils/generate-metadata";
import { getRequestLocale } from "@/utils/get-request-locale";
import { LIST_LIMIT } from "dplus_common_v1";

/**
 * Generate metadata for the page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ stagCode: string }>;
}): Promise<Metadata> {
  const { stagCode } = await params;
  const { langCode } = await getRequestLocale();

  const response = await reqGetStagDetail(stagCode, langCode, 0, 36).catch(
    () => null
  );
  const stagDetail = response?.dbResponse?.stagDetail ?? null;

  return generateDetailMetadata({
    langCode,
    routePath: "stag",
    code: stagCode,
    detailName: stagDetail?.stagInfo?.stag,
    metadata: stagDetail?.metadata,
    imageBucket: "stags",
  });
}

/**
 * Stag 상세 페이지
 * @param params - Stag Code
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function StagDetailPage({
  params,
  // searchParams,
}: {
  params: Promise<{ stagCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { stagCode } = await params;
  const { fullLocale, langCode } = await getRequestLocale();

  try {
    // ✅ 서버에서 데이터 가져오기 (캐시 적용됨)
    const response = await reqGetStagDetail(
      stagCode,
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
    if (!response?.success || isEmptyObj || !initialData?.stagDetail) {
      notFound();
    }

    return (
      <CompStagDetailPage
        stagCode={stagCode}
        fullLocale={fullLocale}
        langCode={langCode}
        initialData={initialData}
      />
    );
  } catch (error) {
    // ✅ 네트워크 에러나 예상치 못한 에러도 404로 처리
    console.error('Failed to fetch stag detail:', error);
    notFound();
  }
}