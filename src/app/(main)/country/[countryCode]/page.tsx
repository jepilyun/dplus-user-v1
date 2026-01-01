// 이 라우트 기본 재생성 주기: 4시간
export const revalidate = 14400;
export const dynamic = 'force-dynamic';  // ✅ 이 한 줄!


import { getRequestLocale } from "@/utils/get-request-locale";
import CompCountryDetailPage from "@/components/comp-country/comp-country-detail-page";
import { Metadata } from "next";
import { reqGetCountryCodes, reqGetCountryDetail } from "@/actions/action";
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
  { params }: { params: Promise<{ countryCode: string }> }
): Promise<Metadata> {
  const { countryCode } = await params;
  const { langCode } = await getRequestLocale();
  const defaultMetadata = getMetadataByLang(langCode);

  // API 호출 (에러 대비 안전가드)
  const response = await reqGetCountryDetail(countryCode, langCode, 0, 36).catch(() => null);
  const countryDetail = response?.dbResponse?.countryDetail ?? null;
  const metadataI18n = countryDetail?.metadataI18n?.items?.[0] ?? null;
  
  const title = pick(
    metadataI18n?.title, 
    metadataI18n?.title ? (countryDetail?.countryInfo?.country_name + " - " + metadataI18n?.title) : countryDetail?.countryInfo?.country_name, 
    defaultMetadata.title
  );
  const description = pick(metadataI18n?.description, defaultMetadata.description);
  const ogTitle = pick(
    metadataI18n?.og_title, 
    metadataI18n?.title ? (countryDetail?.countryInfo?.country_name + " - " + metadataI18n?.title) : countryDetail?.countryInfo?.country_name, 
    defaultMetadata.og_title
  );
  const ogDesc = pick(metadataI18n?.og_description, defaultMetadata.og_description);

  // ✅ OG 이미지: 모든 경로를 절대 URL로 변환
  const ogImageFromI18n = ensureAbsoluteUrl(metadataI18n?.og_image, "countries");
  const defaultOgImage = generateStorageImageUrl("service", "og_dplus_1200x630.jpg");

  const ogImage = pick(
    ogImageFromI18n,
    defaultOgImage
  );

  const keywords = buildKeywords(
    metadataI18n?.tag_set as string[] | null | undefined,
    defaultMetadata.keywords
  );

  return {
    title: `${title} | dplus.app`,
    description,
    keywords,
    openGraph: {
      title: `${ogTitle ?? title} | dplus.app`,
      description: ogDesc,
      images: ogImage,
    },
    // ✅ 트위터 카드 메타데이터 추가
    twitter: {
      card: "summary_large_image",
      title: `${title} | dplus.app`,
      description: ogDesc,
      images: [ogImage ?? ""],
    },
    alternates: {
      canonical: `https://www.dplus.app/country/${countryCode}`,
    },
  };
}

// ✅ 항상 배열을 반환하도록 방어 코딩
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