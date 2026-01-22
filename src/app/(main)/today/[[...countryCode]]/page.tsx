import { Metadata } from "next";

import { reqGetTodayList } from "@/req/req-today";
import CompTodayDetailPage from "@/components/today/comp-today-detail-page";
import { generateSimpleMetadata } from "@/utils/generate-metadata";
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

  return generateSimpleMetadata({
    langCode,
    routePath: "today",
    code: countryCode ?? "KR",
    titlePrefix: "Today",
    subCode: countryCode,
    includeTwitterCard: true,
  });
}

/**
 * Today 상세 페이지
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function TodayPage({
  params,
  // searchParams,
}: {
  params: Promise<{ countryCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { countryCode } = await params;
  const { fullLocale, langCode } = await getRequestLocale();
  const resolvedCountryCode = countryCode ?? "KR";

  const response = await reqGetTodayList(resolvedCountryCode, 0, LIST_LIMIT.default).catch(() => null);
  const initialData = response?.dbResponse ?? null;

  return (
    <CompTodayDetailPage 
      countryCode={resolvedCountryCode}
      fullLocale={fullLocale}
      langCode={langCode}
      initialData={initialData}
    />
  );
}