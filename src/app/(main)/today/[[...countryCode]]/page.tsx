import { getRequestLocale } from "@/utils/get-request-locale";
import CompTodayDetailPage from "@/components/comp-today/comp-today-detail-page";
import { Metadata } from "next";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { buildKeywords, pick } from "@/utils/metadata-helper";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { reqGetTodayList } from "@/actions/action";
import { LIST_LIMIT } from "dplus_common_v1";
import { getMetadataByLang } from "@/consts/const-metadata";

/**
 * Generate metadata for the page
 * @param params - The parameters of the page
 * @returns 
 */
export async function generateMetadata(
  { params }: { params: { countryCode: string } }
): Promise<Metadata> {
  const { langCode } = getRequestLocale();
  const defaultMetadata = getMetadataByLang(langCode);

  const title = pick("Today - " + defaultMetadata.title, defaultMetadata.title);
  const description = pick(defaultMetadata.description);
  const ogTitle = pick("Today - " + params.countryCode, defaultMetadata.og_title);
  const ogDesc = pick(defaultMetadata.og_description);
  
  // ✅ 디폴트 OG 이미지 (절대 URL)
  const defaultOgImage = generateStorageImageUrl("service", "og_dplus_1200x630.jpg");
  const ogImage = pick(defaultOgImage, defaultMetadata.og_image);

  const keywords = buildKeywords(null, defaultMetadata.keywords);

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: `${title} | dplus.app`,
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
      canonical: `https://www.dplus.app/today/${params?.countryCode}`,
    },
  };
}

/**
 * Today 상세 페이지
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function TodayPage({
  params,
  searchParams,
}: {
  params: { countryCode: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { fullLocale, langCode } = getRequestLocale();
  const countryCode = params.countryCode?.[0] ?? "KR";

  const response = await reqGetTodayList(countryCode, 0, LIST_LIMIT.default).catch(() => null);
  const initialData = response?.dbResponse ?? null;

  return (
    <CompTodayDetailPage 
      countryCode={params.countryCode}
      fullLocale={fullLocale}
      langCode={langCode}
      initialData={initialData}
    />
  );
}