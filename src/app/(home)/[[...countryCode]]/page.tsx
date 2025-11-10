// app/[[...countryCode]]/page.tsx
export const revalidate = 14400;

import { getRequestLocale } from "@/utils/get-request-locale";
import CompCountryDetailPage from "@/components/comp-country/comp-country-detail-page";
import { reqGetCountryDetail } from "@/actions/action";
import { LIST_LIMIT } from "dplus_common_v1";

export async function generateStaticParams() {
  return [
    {},                        // ✅ "/" 경로
    { countryCode: ["KR"] },   // ✅ "/KR" 경로 (배열로!)
    { countryCode: ["AA"] },   // ✅ "/AA" 경로 (배열로!)
  ];
}

type PageProps = {
  params: { countryCode?: string[] }; // ✅ 배열/옵셔널
};

export default async function DplusHomeDetail({ params }: PageProps) {
  const { fullLocale, langCode } = getRequestLocale();

  // 첫 세그먼트만 국가코드로 사용
  const countryCode = params.countryCode?.[0] ?? "KR";

  // ✅ 서버에서 데이터 가져오기 (캐시 적용됨)
  const response = await reqGetCountryDetail(
    countryCode,
    langCode,
    0,
    LIST_LIMIT.default
  ).catch(() => null);

  const initialData = response?.dbResponse ?? null;

  return (
    <CompCountryDetailPage
      countryCode={countryCode}
      fullLocale={fullLocale}
      langCode={langCode}
      initialData={initialData}
    />
  );
}