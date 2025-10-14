import { getRequestLocale } from "@/utils/get-req-locale";
import CompEventDetailPage from "@/components/comp-event/comp-event-detail-page"; // 클라이언트 컴포넌트

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