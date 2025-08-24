import { getRequestLocale } from "@/utils/get-req-locale";
import CompEventDetailPage from "@/components/comp-event/comp-event-detail-page"; // 클라이언트 컴포넌트

export default async function EventDetailPage({
  params,
  searchParams,
}: {
  params: { eventId: string; langCode?: string[] };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { fullLocale, langCode } = getRequestLocale();

  // 여기에 서버 전용 로직(데이터 fetch 등) 수행
  // const data = await fetch(...);

  return (
    <CompEventDetailPage
      eventId={params.eventId}
      fullLocale={fullLocale}
      langCode={params.langCode?.[0] ?? langCode}
    />
  );
}