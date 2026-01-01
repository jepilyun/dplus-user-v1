export const revalidate = 14400;
export const dynamic = 'force-dynamic';  // ✅ 이 한 줄!


import { getRequestLocale } from "@/utils/get-request-locale";
import CompCountryDetailPage from "@/components/comp-country/comp-country-detail-page";
import { reqGetCountryDetail } from "@/actions/action";
import { LIST_LIMIT } from "dplus_common_v1";
import { notFound } from "next/navigation";


type Params = {
  countryCode?: string;
};

export default async function DplusHomeDetail({ params }: { params: Promise<Params> }) {
  const { countryCode } = await params;
  const { fullLocale, langCode } = await getRequestLocale();
  const resolvedCountryCode = countryCode ?? "KR";

  // API 호출
  const response = await reqGetCountryDetail(
    resolvedCountryCode,
    langCode,
    0,
    LIST_LIMIT.default
  ).catch((error) => {
    console.error('API Error:', error);
    return null;
  });

  // 데이터 검증
  const hasValidData = 
    response?.success && 
    response?.dbResponse && 
    Object.keys(response.dbResponse).length > 0;

  if (!hasValidData) {
    notFound();
  }

  if (!response.dbResponse) {
    notFound();
  }

  return (
    <CompCountryDetailPage
      countryCode={resolvedCountryCode}
      fullLocale={fullLocale}
      langCode={langCode}
      initialData={response.dbResponse}
    />
  );
}