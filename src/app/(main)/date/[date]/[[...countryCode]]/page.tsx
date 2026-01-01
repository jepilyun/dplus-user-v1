import { getRequestLocale } from "@/utils/get-request-locale";
import CompDateDetailPage from "@/components/comp-date/comp-date-detail-page";
import { Metadata } from "next";
import { buildKeywords, pick } from "@/utils/metadata-helper";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { reqGetDateList } from "@/actions/action";
import { LIST_LIMIT } from "dplus_common_v1";
import { getMetadataByLang } from "@/consts/const-metadata";

/**
 * Generate metadata for the page
 * @param params - The parameters of the page
 * @returns 
 */
export async function generateMetadata(
  { params }: { params: Promise<{ date: string, countryCode: string }> }
): Promise<Metadata> {
  const { date, countryCode } = await params;
  const { langCode } = await getRequestLocale();
  const defaultMetadata = getMetadataByLang(langCode);

  const title = pick(date + " - " + defaultMetadata.title, defaultMetadata.title);
  const description = pick(defaultMetadata.description);
  const ogTitle = pick(date + " - " + countryCode, defaultMetadata.og_title);
  const ogDesc = pick(defaultMetadata.og_description);
  
  // ✅ 디폴트 OG 이미지 (절대 URL)
  const defaultOgImage = generateStorageImageUrl("service", "og_dplus_1200x630.jpg");
  const ogImage = pick(defaultOgImage, defaultMetadata.og_image);

  const keywords = buildKeywords(null, defaultMetadata.keywords);

  return {
    title: `${date} - ${title} | dplus.app`,
    description,
    keywords,
    openGraph: {
      title: `${date} - ${ogTitle} | dplus.app`,
      description: ogDesc,
      images: ogImage,
    },
    alternates: {
      canonical: `https://www.dplus.app/date/${date}/${countryCode}`,
    },
  };
}

/**
 * Date 상세 페이지
 * @param params - 날짜
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function DateDetailPage({
  params,
  // searchParams,
}: {
  params: Promise<{ date: string, countryCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { date, countryCode } = await params;
  const { fullLocale, langCode } = await getRequestLocale();

  // ✅ 서버에서 데이터 가져오기 (캐시 적용됨)
  const response = await reqGetDateList(
    countryCode,
    date,
    0,
    LIST_LIMIT.default
  ).catch(() => null);

  const initialData = response?.dbResponse ?? null;

  return (
    <CompDateDetailPage
      dateString={date}
      countryCode={countryCode}
      fullLocale={fullLocale}
      langCode={langCode}
      initialData={initialData}
    />
  );
}