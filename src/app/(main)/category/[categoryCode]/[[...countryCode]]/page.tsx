import { getRequestLocale } from "@/utils/get-request-locale";
import CompCategoryDetailPage from "@/components/comp-category/comp-category-detail-page";


/**
 * Category 상세 페이지
 * @param params - Category Code
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function CategoryDetailPage({
  params,
  searchParams,
}: {
  params: { categoryCode: string, countryCode: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { fullLocale, langCode } = getRequestLocale();

  // 여기에 서버 전용 로직(데이터 fetch 등) 수행
  // const data = await fetch(...);

  return (
    <CompCategoryDetailPage
      categoryCode={params.categoryCode}
      countryCode={params.countryCode}
      fullLocale={fullLocale}
      langCode={langCode}
    />
  );
}