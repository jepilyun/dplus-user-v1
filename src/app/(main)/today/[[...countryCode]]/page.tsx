import { Metadata } from "next";

import { fetchGetTodayList } from "@/api/today/fetchToday";
import CompTodayDetailPage from "@/components/today/TodayDetailPage";
import { generateSimpleMetadata } from "@/utils/metadata/generateMetadata";
import { getRequestLocale } from "@/utils/getRequestLocale";
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
 * @returns Today 상세 페이지
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

  try {
    // ✅ 서버에서 데이터 가져오기 (캐시 적용됨)
    const response = await fetchGetTodayList(resolvedCountryCode, 0, LIST_LIMIT.default);
    const initialData = response?.dbResponse ?? null;

    return (
      <CompTodayDetailPage
        countryCode={resolvedCountryCode}
        fullLocale={fullLocale}
        langCode={langCode}
        initialData={initialData}
      />
    );
  } catch (error) {
    // ✅ 에러 발생 시에도 빈 데이터로 페이지 렌더링
    console.error('Failed to fetch today list:', error);
    return (
      <CompTodayDetailPage
        countryCode={resolvedCountryCode}
        fullLocale={fullLocale}
        langCode={langCode}
        initialData={null}
      />
    );
  }
}