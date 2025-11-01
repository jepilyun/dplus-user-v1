// 이 라우트 기본 재생성 주기: 4시간
export const revalidate = 60;

import { getRequestLocale } from "@/utils/get-request-locale";
import CompCountryDetailPage from "@/components/comp-country/comp-country-detail-page";

// ✅ 배열로!
export async function generateStaticParams() {
  return [
    // 루트("/")도 정적으로 만들고 싶으면 {} 도 추가 가능
    // {},
    { countryCode: ["KR"] },
    { countryCode: ["AA"] },
  ];
}

type PageProps = {
  params: { countryCode?: string[] }; // ✅ 배열/옵셔널
};

export default function DplusHomeDetail({ params }: PageProps) {
  const { fullLocale, langCode } = getRequestLocale();

  // 첫 세그먼트만 국가코드로 사용
  const countryCode = params.countryCode?.[0] ?? "KR"; // 기본값은 필요에 맞게

  return (
    <CompCountryDetailPage
      countryCode={countryCode}
      fullLocale={fullLocale}
      langCode={langCode}
    />
  );
}
