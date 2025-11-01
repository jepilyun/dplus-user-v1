import { getRequestLocale } from "@/utils/get-request-locale";
import CompTodayDetailPage from "@/components/comp-today/comp-today-detail-page";
import { Metadata } from "next";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
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

  const title = pick("Today - " + dict.metadata.title, dict.metadata.title);
  const description = pick(
    dict.metadata.description
  );
  const ogTitle = pick("Today - " + params.countryCode, dict.metadata.og_title);
  const ogDesc = pick(
    dict.metadata.og_description
  );
  const ogImage = pick(
    generateStorageImageUrl("service", "og_dplus_1200x630.jpg"),
    dict.metadata.og_image
  );

  const keywords = buildKeywords(
    null,
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

  // 여기에 서버 전용 로직(데이터 fetch 등) 수행
  // const data = await fetch(...);

  return (
    <CompTodayDetailPage 
      countryCode={params.countryCode}
      fullLocale={fullLocale}
      langCode={langCode}
    />
  );
}