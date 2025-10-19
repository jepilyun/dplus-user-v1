import { getRequestLocale } from "@/utils/get-request-locale";
import CompTodayDetailPage from "@/components/comp-today/comp-today-detail-page";


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