import { getRequestLocale } from "@/utils/get-request-locale";
import CompTodayDetailPage from "@/components/comp-today/comp-today-detail-page";
import { Metadata } from "next";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { buildKeywords, pick } from "@/utils/metadata-helper";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { reqGetTodayList } from "@/actions/action";
import { LIST_LIMIT } from "dplus_common_v1";

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

  const title = pick("Today - " + dict.metadata.title, dict.metadata.title);
  const description = pick(dict.metadata.description);
  const ogTitle = pick("Today - " + params.countryCode, dict.metadata.og_title);
  const ogDesc = pick(dict.metadata.og_description);
  
  // ✅ 디폴트 OG 이미지 (절대 URL)
  const defaultOgImage = generateStorageImageUrl("service", "og_dplus_1200x630.jpg");
  const ogImage = pick(defaultOgImage, dict.metadata.og_image);

  const keywords = buildKeywords(null, dict.metadata.keywords);

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      images: ogImage,
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