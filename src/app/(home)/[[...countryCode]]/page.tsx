// app/[[...countryCode]]/page.tsx
export const revalidate = 14400;

import { getRequestLocale } from "@/utils/get-request-locale";
import CompCountryDetailPage from "@/components/comp-country/comp-country-detail-page";
import { reqGetCountryDetail } from "@/actions/action";
import { LIST_LIMIT } from "dplus_common_v1";
import { notFound } from "next/navigation";

export async function generateStaticParams() {
  return [
    {},
    { countryCode: ["KR"] },
    { countryCode: ["AA"] },
  ];
}

type PageProps = {
  params: { countryCode?: string[] };
};

export default async function DplusHomeDetail({ params }: PageProps) {
  const { fullLocale, langCode } = getRequestLocale();
  const countryCode = params.countryCode?.[0] ?? "KR";

  // API 호출
  const response = await reqGetCountryDetail(
    countryCode,
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
      countryCode={countryCode}
      fullLocale={fullLocale}
      langCode={langCode}
      initialData={response.dbResponse}
    />
  );
}