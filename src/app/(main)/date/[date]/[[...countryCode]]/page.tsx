import { Metadata } from "next";

import { reqGetDateList } from "@/req/req-date";
import CompDateDetailPage from "@/components/date/comp-date-detail-page";
import { generateSimpleMetadata } from "@/utils/generate-metadata";
import { getRequestLocale } from "@/utils/get-request-locale";
import { LIST_LIMIT } from "dplus_common_v1";

/**
 * Generate metadata for the page
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string; countryCode: string }>;
}): Promise<Metadata> {
  const { date, countryCode } = await params;
  const { langCode } = await getRequestLocale();

  return generateSimpleMetadata({
    langCode,
    routePath: "date",
    code: date,
    titlePrefix: date,
    subCode: countryCode,
    includeTwitterCard: false,
  });
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