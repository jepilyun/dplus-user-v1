// 이 라우트 기본 재생성 주기: 4시간
export const revalidate = 14400;

import { getRequestLocale } from "@/utils/get-request-locale";
import CompCountryDetailPage from "@/components/comp-country/comp-country-detail-page";
import { Metadata } from "next";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { reqGetCountryCodes, reqGetCountryDetail } from "@/actions/action";
import { buildKeywords, pick } from "@/utils/metadata-helper";
import { generateStorageImageUrl } from "@/utils/generate-image-url";


/**
 * Generate metadata for the page
 * @param params - The parameters of the page
 * @returns 
 */
export async function generateMetadata(
  { params }: { params: { countryCode: string } }
): Promise<Metadata> {
  const { langCode } = getRequestLocale();
  const dict = getDplusI18n(langCode);

  // API 호출 (에러 대비 안전가드)
  const response = await reqGetCountryDetail(params.countryCode, langCode, 0, 36).catch(() => null);
  const data = response?.dbResponse?.country ?? null;
  const metadataI18n = response?.dbResponse?.metadataI18n?.[0] ?? null;
  
  const title = pick(metadataI18n?.title, data?.metadata_title, data?.country_name, dict.metadata.title);
  const description = pick(
    metadataI18n?.description,
    data?.metadata_description,
    dict.metadata.description
  );
  const ogTitle = pick(metadataI18n?.og_title, data?.metadata_og_title, data?.country_name, dict.metadata.og_title);
  const ogDesc = pick(
    metadataI18n?.og_description,
    data?.metadata_og_description,
    dict.metadata.og_description
  );
  const ogImage = pick(
    metadataI18n?.og_image, 
    data?.metadata_og_image, 
    data?.hero_image_01, 
    data?.hero_image_02,
    data?.hero_image_03,
    data?.hero_image_04,
    data?.hero_image_05,
    data?.thumbnail_main_01,
    data?.thumbnail_main_02,
    data?.thumbnail_main_03,
    data?.thumbnail_main_04,
    data?.thumbnail_main_05,
    data?.thumbnail_vertical_01,
    data?.thumbnail_vertical_02,
    data?.thumbnail_vertical_03,
    data?.thumbnail_vertical_04,
    data?.thumbnail_vertical_05,
    generateStorageImageUrl("service", "og_dplus_1200x630.jpg"),
    dict.metadata.og_image
  );

  const keywords = buildKeywords(
    metadataI18n?.tag_set as string[] | null | undefined,
    data?.metadata_keywords ?? null,
    dict.metadata.keywords
  );

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      images: ogImage, // string | string[] | OGImage[]
    },
    alternates: {
      canonical: `https://www.dplus.app/country/${params?.countryCode}`,
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
  searchParams,
}: {
  params: { countryCode: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { fullLocale, langCode } = getRequestLocale();

  // 여기에 서버 전용 로직(데이터 fetch 등) 수행
  // const data = await fetch(...);

  return (
    <CompCountryDetailPage
      countryCode={params.countryCode}
      fullLocale={fullLocale}
      langCode={langCode}
    />
  );
}