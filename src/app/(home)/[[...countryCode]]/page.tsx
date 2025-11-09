// app/[[...countryCode]]/page.tsx
export const revalidate = 14400;

import { getRequestLocale } from "@/utils/get-request-locale";
import CompCountryDetailPage from "@/components/comp-country/comp-country-detail-page";

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

export default function DplusHomeDetail({ params }: PageProps) {
  const { fullLocale, langCode } = getRequestLocale();

  // 첫 세그먼트만 국가코드로 사용
  const countryCode = params.countryCode?.[0] ?? "KR";

  return (
    <CompCountryDetailPage
      countryCode={countryCode}
      fullLocale={fullLocale}
      langCode={langCode}
    />
  );
}