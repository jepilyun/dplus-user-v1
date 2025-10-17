import { getRequestLocale } from "@/utils/get-request-locale";
import CompFolderDetailPage from "@/components/comp-folder/comp-folder-detail-page";
import CompCityDetailPage from "@/components/comp-city/comp-city-detail-page";


/**
 * City 상세 페이지
 * @param params - 이벤트 ID
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function CityDetailPage({
  params,
  searchParams,
}: {
  params: { cityCode: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { fullLocale, langCode } = getRequestLocale();

  // 여기에 서버 전용 로직(데이터 fetch 등) 수행
  // const data = await fetch(...);

  return (
    <CompCityDetailPage
      cityCode={params.cityCode}
      fullLocale={fullLocale}
      langCode={langCode}
    />
  );
}