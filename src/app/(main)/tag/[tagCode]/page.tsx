import { getRequestLocale } from "@/utils/get-request-locale";
import CompTagDetailPage from "@/components/tag/comp-tag-detail-page";


/**
 * Tag 상세 페이지
 * @param params - Tag Code
 * @param searchParams - 검색 파라미터
 * @returns 이벤트 상세 페이지
 */
export default async function TagDetailPage({
  params,
  // searchParams,
}: {
  params: Promise<{ tagCode: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { tagCode } = await params;
  const { fullLocale, langCode } = await getRequestLocale();

  // 여기에 서버 전용 로직(데이터 fetch 등) 수행
  // const data = await fetch(...);

  return (
    <CompTagDetailPage
      tagCode={tagCode}
      fullLocale={fullLocale}
      langCode={langCode}
    />
  );
}