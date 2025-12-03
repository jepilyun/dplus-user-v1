// 이 라우트 기본 재생성 주기: 4시간
export const revalidate = 14400;

import { Metadata } from "next";
import { getRequestLocale } from "@/utils/get-request-locale";
import CompCategoryDetailPage from "@/components/comp-category/comp-category-detail-page";
import { reqGetCategoryCodes, reqGetCategoryDetail } from "@/actions/action";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { buildKeywords, pick } from "@/utils/metadata-helper";
import { ensureAbsoluteUrl, generateStorageImageUrl } from "@/utils/generate-image-url";
import { getCategoryOgImageUrl } from "@/utils/set-image-urls";
import { LIST_LIMIT } from "dplus_common_v1";
import { notFound } from "next/navigation";
import { getMetadataByLang } from "@/consts/const-metadata";

/**
 * Generate metadata for the page
 * @param params - The parameters of the page
 * @returns 
 */
export async function generateMetadata(
  { params }: { params: { categoryCode: string; countryCode?: string } }
): Promise<Metadata> {
  const { langCode } = getRequestLocale();
  const defaultMetadata = getMetadataByLang(langCode);

  // API 호출 (에러 대비 안전가드)
  const response = await reqGetCategoryDetail(params.countryCode ?? "AA", params.categoryCode, langCode, 0, 36).catch(() => null);
  const data = response?.dbResponse?.category ?? null;
  const i18n = response?.dbResponse?.i18n ?? null;
  const metadataI18n = response?.dbResponse?.metadataI18n?.[0] ?? null;
  
  const title = pick(metadataI18n?.title, data?.metadata_title, data?.name + " - " + i18n?.name, defaultMetadata.title);
  const description = pick(
    metadataI18n?.description,
    data?.metadata_description,
    defaultMetadata.description
  );
  const ogTitle = pick(metadataI18n?.og_title, data?.metadata_og_title, data?.name + " - " + i18n?.name, defaultMetadata.og_title);
  const ogDesc = pick(
    metadataI18n?.og_description,
    data?.metadata_og_description,
    defaultMetadata.og_description
  );

  // ✅ OG 이미지: 모든 경로를 절대 URL로 변환
  const ogImageFromI18n = ensureAbsoluteUrl(metadataI18n?.og_image, "categories");
  const ogImageFromMetadata = ensureAbsoluteUrl(data?.metadata_og_image, "categories");
  const ogImageFromCategory = getCategoryOgImageUrl(data); // 이미 절대 URL
  const defaultOgImage = generateStorageImageUrl("service", "og_dplus_1200x630.jpg");

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
      canonical: `https://www.dplus.app/category/${params?.categoryCode}/${params?.countryCode ?? 'AA'}`,
    },
  };
}

// ✅ 항상 배열을 반환하도록 방어 코딩
export async function generateStaticParams() {
  try {
    const res = await reqGetCategoryCodes();
    const list = res?.dbResponse ?? []; // 없으면 빈 배열

    return list.map((cat: { category_code: string }) => ({
      categoryCode: cat.category_code,
      countryCode: ["KR", "AA"],
    }));
  } catch {
    return []; // 실패해도 배열 반환
  }
}

/**
 * Category 상세 페이지
 * @param params - Category Code
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: { categoryCode: string, countryCode: string[] };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { fullLocale, langCode } = getRequestLocale();
  const countryCode = params.countryCode?.[0] ?? "AA";

  try {
    // ✅ 서버에서 데이터 가져오기 (캐시 적용됨)
    const response = await reqGetCategoryDetail(
      countryCode,
      params.categoryCode,
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
    if (!response?.success || isEmptyObj || !initialData?.category) {
      notFound();
    }

    return (
      <CompCategoryDetailPage
        categoryCode={params.categoryCode}
        countryCode={countryCode}
        fullLocale={fullLocale}
        langCode={langCode}
        initialData={initialData}
      />
    );
  } catch (error) {
    // ✅ 네트워크 에러나 예상치 못한 에러도 404로 처리
    console.error('Failed to fetch category detail:', error);
    notFound();
  }
}