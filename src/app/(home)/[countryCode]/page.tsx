// 이 라우트 기본 재생성 주기: 4시간
export const revalidate = 14400;

import { getRequestLocale } from "@/utils/get-request-locale";
import CompCountryDetailPage from "@/components/comp-country/comp-country-detail-page";



export async function generateStaticParams() {
  // 미리 빌드할 국가 코드 목록
  return [{ countryCode: "KR" }, { countryCode: "AA" }];
}

export default function DplusHomeDetail({ params }: { params: { countryCode: string } }) {
  const { fullLocale, langCode } = getRequestLocale();
  return <CompCountryDetailPage countryCode={params.countryCode} fullLocale={fullLocale} langCode={langCode} />;
}
