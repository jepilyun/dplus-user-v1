// 이 라우트 기본 재생성 주기: 4시간
export const revalidate = 14400;

import { Metadata } from "next";
import { notFound } from "next/navigation";

import { reqGetCountryCodes, reqGetCountryDetail } from "@/api/req-country";
import CompCountryDetailPage from "@/components/country/comp-country-detail-page";
import { generateDetailMetadata } from "@/utils/generate-metadata";
import { getRequestLocale } from "@/utils/get-request-locale";
import { LIST_LIMIT } from "dplus_common_v1";

/**
 * Generate metadata for the page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ countryCode: string }>;
}): Promise<Metadata> {
  const { countryCode } = await params;
  const { langCode } = await getRequestLocale();

  const response = await reqGetCountryDetail(countryCode, langCode, 0, 36).catch(
    () => null
  );
  const countryDetail = response?.dbResponse?.countryDetail ?? null;

  return generateDetailMetadata({
    langCode,
    routePath: "country",
    code: countryCode,
    detailName: countryDetail?.countryInfo?.country_name,
    metadata: countryDetail?.metadataI18n?.items?.[0],
    imageBucket: "countries",
  });
}

/*
 * Build 시점에 생성하고자 하는 페이지들의 parameter 반환
 * 항상 배열을 반환하도록 방어 코딩
 */
export async function generateStaticParams() {
  try {
    const res = await reqGetCountryCodes();
    const list = res?.dbResponse ?? []; // 없으면 빈 배열

    return list.map((country: { country_code: string }) => ({
      countryCode: country.country_code,
    }));
  } catch {
    return []; // 실패해도 배열 반환
  }
}

/**
 * Country 상세 페이지
 * @param params - 이벤트 ID
 * @param searchParams - 검색 파라미터
 * @returns Country 상세 페이지
 */
export default async function CountryDetailPage({
  params,
  // searchParams,
}: {
  params: Promise<{ countryCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { countryCode } = await params;
  const { fullLocale, langCode } = await getRequestLocale();

  try {
    // ✅ 서버에서 데이터 가져오기 (캐시 적용됨)
    const response = await reqGetCountryDetail(
      countryCode,
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
    if (!response?.success || isEmptyObj || !initialData?.countryDetail) {
      notFound();
    }

    return (
      <CompCountryDetailPage
        countryCode={countryCode}
        fullLocale={fullLocale}
        langCode={langCode}
        initialData={initialData}
      />
    );
  } catch (error) {
    // ✅ 네트워크 에러나 예상치 못한 에러도 404로 처리
    console.error('Failed to fetch country detail:', error);
    notFound();
  }
}