// 이 라우트 기본 재생성 주기: 4시간
export const revalidate = 14400;

import { Metadata } from "next";
import { notFound } from "next/navigation";

import { reqGetCategoryCodes, reqGetCategoryDetail } from "@/actions/req-category";
import CompCategoryDetailPage from "@/components/comp-category/comp-category-detail-page";
import { generateDetailMetadata } from "@/utils/generate-metadata";
import { getRequestLocale } from "@/utils/get-request-locale";
import { LIST_LIMIT } from "dplus_common_v1";

/**
 * Generate metadata for the page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoryCode: string; countryCode?: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryCode = resolvedParams.categoryCode;
  const countryCode = resolvedParams.countryCode ?? "AA";

  const { langCode } = await getRequestLocale();

  const response = await reqGetCategoryDetail(
    countryCode,
    categoryCode,
    langCode,
    0,
    36
  ).catch(() => null);
  const categoryDetail = response?.dbResponse?.categoryDetail ?? null;
  const i18n = categoryDetail?.i18n ?? null;

  return generateDetailMetadata({
    langCode,
    routePath: "category",
    code: categoryCode,
    subCode: countryCode,
    detailName:
      i18n?.items?.[0]?.name ??
      categoryDetail?.categoryInfo?.name,
    metadata: categoryDetail?.metadataI18n?.items?.[0],
    imageBucket: "categories",
  });
}

/*
 * Build 시점에 생성하고자 하는 페이지들의 parameter 반환
 * 항상 배열을 반환하도록 방어 코딩
 */
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
  // searchParams,
}: {
  params: Promise<{ categoryCode: string; countryCode?: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { categoryCode, countryCode } = await params;

  const resolvedCountryCode = countryCode ?? "AA";
  const { fullLocale, langCode } = await getRequestLocale();

  try {
    // ✅ 서버에서 데이터 가져오기 (캐시 적용됨)
    const response = await reqGetCategoryDetail(
      resolvedCountryCode,
      categoryCode,
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
    if (!response?.success || isEmptyObj || !initialData?.categoryDetail) {
      notFound();
    }

    return (
      <CompCategoryDetailPage
        categoryCode={categoryCode}
        countryCode={resolvedCountryCode}
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