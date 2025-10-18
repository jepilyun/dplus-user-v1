import { getRequestLocale } from "@/utils/get-request-locale";
import CompStagDetailPage from "@/components/comp-stag/comp-stag-detail-page";


/**
 * Stag 상세 페이지
 * @param params - Stag Code
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function StagDetailPage({
  params,
  searchParams,
}: {
  params: { stagCode: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { fullLocale, langCode } = getRequestLocale();

  // 여기에 서버 전용 로직(데이터 fetch 등) 수행
  // const data = await fetch(...);

  return (
    <CompStagDetailPage
      stagCode={params.stagCode}
      fullLocale={fullLocale}
      langCode={langCode}
    />
  );
}