// 이 라우트 기본 재생성 주기: 4시간
export const revalidate = 14400;
export const dynamic = 'force-dynamic';  // ✅ 이 한 줄!


import { getRequestLocale } from "@/utils/get-request-locale";
import CompStagDetailPage from "@/components/comp-stag/comp-stag-detail-page";
import { Metadata } from "next";
import { reqGetStagDetail } from "@/actions/action";
import { buildKeywords, pick } from "@/utils/metadata-helper";
import { ensureAbsoluteUrl, generateStorageImageUrl } from "@/utils/generate-image-url";
import { LIST_LIMIT } from "dplus_common_v1";
import { notFound } from "next/navigation";
import { getMetadataByLang } from "@/consts/const-metadata";

/**
 * Generate metadata for the page
 * @param params - The parameters of the page
 * @returns 
 */
export async function generateMetadata(
  { params }: { params: Promise<{ stagCode: string }> }
): Promise<Metadata> {
  const { stagCode } = await params;
  const { langCode } = await getRequestLocale();
  const defaultMetadata = getMetadataByLang(langCode);

  // API 호출 (에러 대비 안전가드)
  const response = await reqGetStagDetail(stagCode, langCode, 0, 36).catch(() => null);
  const stagDetail = response?.dbResponse?.stagDetail ?? null;
  const metadata = stagDetail?.metadata ?? null;
  
  const title = pick(metadata?.title, stagDetail?.stagInfo?.stag + " - " + metadata?.title, defaultMetadata.title);
  const description = pick(metadata?.description, defaultMetadata.description);
  const ogTitle = pick(metadata?.og_title, stagDetail?.stagInfo?.stag + " - " + metadata?.title, defaultMetadata.og_title);
  const ogDesc = pick(metadata?.og_description, defaultMetadata.og_description);

  // ✅ OG 이미지: 모든 경로를 절대 URL로 변환
  const ogImageFromI18n = ensureAbsoluteUrl(metadata?.og_image, "stags");
  const defaultOgImage = generateStorageImageUrl("service", "og_dplus_1200x630.jpg");

  const ogImage = pick(
    ogImageFromI18n,
    defaultOgImage
  );

  const keywords = buildKeywords(
    metadata?.tag_set as string[] | null | undefined,
    defaultMetadata.keywords
  );

  const pageTitle = `${title} | dplus.app`;
  const ogPageTitle = `${ogTitle} | dplus.app`;

  return {
    title: pageTitle,
    description,
    keywords,
    openGraph: {
      title: ogPageTitle,
      description: ogDesc,
      images: ogImage,
    },
    // ✅ 트위터 카드 메타데이터 추가
    twitter: {
      card: "summary_large_image",
      title: ogPageTitle,
      description: ogDesc,
      images: [ogImage ?? ""],
    },
    alternates: {
      canonical: `https://www.dplus.app/stag/${stagCode}`,
    },
  };
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