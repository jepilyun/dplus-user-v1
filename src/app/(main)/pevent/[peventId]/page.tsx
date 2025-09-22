import { getRequestLocale } from "@/utils/get-req-locale";
import CompPeventDetailPage from "@/components/comp-pevent/comp-pevent-detail-page"; // 클라이언트 컴포넌트

/**
 * P이벤트 상세 페이지
 * @param params - P이벤트 ID
 * @param searchParams - 검색 파라미터
 * @returns P이벤트 상세 페이지
 */
export default async function PeventDetailPage({
  params,
  searchParams,
}: {
  params: { peventId: string };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { fullLocale, langCode } = getRequestLocale();

  // 여기에 서버 전용 로직(데이터 fetch 등) 수행
  // const data = await fetch(...);

  return (
    <CompPeventDetailPage
      peventId={params.peventId}
      fullLocale={fullLocale}
      langCode={langCode}
    />
  );
}