import { getRequestLocale } from "@/utils/get-request-locale";
import CompEventDetailPage from "@/components/comp-event/comp-event-detail-page"; // 클라이언트 컴포넌트
import { Metadata } from "next";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { reqGetEventMetadata } from "@/actions/action";
import { buildKeywords, pick } from "@/utils/metadata-helper";


/**
 * Generate metadata for the page
 * @param params - The parameters of the page
 * @returns 
 */
export async function generateMetadata(
  { params }: { params: { eventCode: string } }
): Promise<Metadata> {
  const { langCode } = getRequestLocale();
  const dict = getDplusI18n(langCode);

  // API 호출 (에러 대비 안전가드)
  const api = await reqGetEventMetadata(params.eventCode, langCode).catch(() => null);
  const m = api?.dbResponse ?? null;

  const title = pick(m?.metadata_i18n_title, m?.metadata_title, dict.metadata.title);
  const description = pick(
    m?.metadata_i18n_description,
    m?.metadata_description,
    dict.metadata.description
  );
  const ogTitle = pick(m?.metadata_i18n_og_title, m?.metadata_og_title, dict.metadata.og_title);
  const ogDesc = pick(
    m?.metadata_i18n_og_description,
    m?.metadata_og_description,
    dict.metadata.og_description
  );
  const ogImage = pick(m?.metadata_i18n_og_image, m?.metadata_og_image, dict.metadata.og_image);

  const keywords = buildKeywords(
    m?.metadata_i18n_tag_set as string[] | null | undefined,
    m?.metadata_keywords ?? null,
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
      canonical: `https://www.dplus.app/event/${params?.eventCode}`,
    },
  };
}


/**
 * 이벤트 상세 페이지
 * @param params - 이벤트 ID
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: { eventCode: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { fullLocale, langCode } = getRequestLocale();

  // 여기에 서버 전용 로직(데이터 fetch 등) 수행
  // const data = await fetch(...);

  return (
    <CompEventDetailPage
      eventCode={params.eventCode}
      fullLocale={fullLocale}
      langCode={langCode}
    />
  );
}