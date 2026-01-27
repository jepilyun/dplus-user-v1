// 이 라우트 기본 재생성 주기: 4시간
export const revalidate = 14400;

import { Metadata } from "next";
import { notFound } from "next/navigation";

import { fetchGetCityCodes, fetchGetCityDetail } from "@/api/city/fetchCity";
import CompCityDetailPage from "@/components/city/CityDetailPage";
import { generateDetailMetadata } from "@/utils/metadata/generateMetadata";
import { getRequestLocale } from "@/utils/getRequestLocale";
import { LIST_LIMIT } from "dplus_common_v1";

/**
 * Generate metadata for the page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ cityCode: string }>;
}): Promise<Metadata> {
  const { cityCode } = await params;
  const { langCode } = await getRequestLocale();

  const response = await fetchGetCityDetail(cityCode, langCode, 0, 36).catch(
    () => null
  );
  const cityDetail = response?.dbResponse?.cityDetail ?? null;

  return generateDetailMetadata({
    langCode,
    routePath: "city",
    code: cityCode,
    detailName:
      cityDetail?.i18n?.items?.[0]?.name ?? cityDetail?.cityInfo?.name,
    metadata: cityDetail?.metadataI18n?.items?.[0],
    imageBucket: "cities",
  });
}

/*
 * Build 시점에 생성하고자 하는 페이지들의 parameter 반환
 * 항상 배열을 반환하도록 방어 코딩
 */
export async function generateStaticParams() {
  try {
    const res = await fetchGetCityCodes();
    const list = res?.dbResponse ?? []; // 없으면 빈 배열
    return list.map((cat: { city_code: string }) => ({
      cityCode: cat.city_code,
    }));
  } catch {
    return [];
  }
}

/**
 * City 상세 페이지
 * @param params - 이벤트 ID
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function CityDetailPage({
  params,
  // searchParams,
}: {
  params: Promise<{ cityCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { cityCode } = await params;
  const { fullLocale, langCode } = await getRequestLocale();

  try {
    // ✅ 서버에서 데이터 가져오기 (캐시 적용됨)
    const response = await fetchGetCityDetail(
      cityCode,
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
    if (!response?.success || isEmptyObj || !initialData?.cityDetail) {
      notFound();
    }

    return (
      <CompCityDetailPage
        cityCode={cityCode}
        fullLocale={fullLocale}
        langCode={langCode}
        initialData={initialData}
      />
    );
  } catch (error) {
    // ✅ 네트워크 에러나 예상치 못한 에러도 404로 처리
    console.error('Failed to fetch city detail:', error);
    notFound();
  }
}