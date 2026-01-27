import type { Metadata } from "next";
import { Monoton, Noto_Sans, Noto_Sans_KR, Poppins, Rubik, Gamja_Flower } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { DEFAULT_METADATA_I18N } from "@/constants/metadata.constant";

// 기본 메타데이터 (현재는 한국어로)
// TODO: 다국어 처리
export const metadata: Metadata = {
  title: DEFAULT_METADATA_I18N.KO.title,
  description: DEFAULT_METADATA_I18N.KO.description,
  keywords: DEFAULT_METADATA_I18N.KO.keywords,
  openGraph: {
    title: DEFAULT_METADATA_I18N.KO.og_title,
    description: DEFAULT_METADATA_I18N.KO.og_description,
    url: DEFAULT_METADATA_I18N.KO.og_url,
    type: "website",
    locale: DEFAULT_METADATA_I18N.KO.og_locale,
    siteName: DEFAULT_METADATA_I18N.KO.og_site_name,
    images: [
      {
        url: DEFAULT_METADATA_I18N.KO.og_image,
        width: DEFAULT_METADATA_I18N.KO.og_image_width,
        height: DEFAULT_METADATA_I18N.KO.og_image_height,
        alt: DEFAULT_METADATA_I18N.KO.og_image_alt,
      },
    ],
  },
  // ✅ 트위터 카드 메타데이터 추가
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_METADATA_I18N.KO.og_title,
    description: DEFAULT_METADATA_I18N.KO.og_description,
    images: [DEFAULT_METADATA_I18N.KO.og_image],
    creator: "@dplusapp", // 선택사항: 트위터 계정이 있다면
    // site: "@dplusapp", // 선택사항: 트위터 계정이 있다면
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/icons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/favicon-128x128.png", sizes: "128x128", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-icon-180x180.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
};

const monoton = Monoton({ weight: ["400"], subsets: ["latin"], display: "swap", variable: "--font-monoton" });
const notoSans = Noto_Sans({ weight: ["100","300","400","500","700","900"], subsets: ["latin"], display: "swap", variable: "--font-noto-sans" });
const notoSansKR = Noto_Sans_KR({ weight: ["100","300","400","500","700","900"], subsets: ["latin"], display: "swap", variable: "--font-noto-sans-kr" });
const poppins = Poppins({ weight: ["400","700"], subsets: ["latin"], display: "swap", variable: "--font-poppins" });
const rubik = Rubik({ weight: ["300","400","500","700","900"], subsets: ["latin"], display: "swap", variable: "--font-rubik" });
const gamjaFlower = Gamja_Flower({ weight: ["400"], subsets: ["latin"], display: "swap", variable: "--font-gamja-flower" });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      className={`${notoSans.variable} ${notoSansKR.variable} ${monoton.variable} ${poppins.variable} ${rubik.variable} ${gamjaFlower.variable} antialiased`}
    >
      {/* GTM (head) */}
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-5CD6J8X6');`,
        }}
      />

      {/* ✅ 브라우저 기본 스크롤 복원 비활성화(수동 모드) */}
      <Script id="manual-scroll-restoration" strategy="afterInteractive">
        {`try { if ('scrollRestoration' in history) { history.scrollRestoration = 'manual'; } } catch(_) {}`}
      </Script>

      <body className="bg-light-gray">
        {/* ✅ GTM (noscript) must be first in body */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5CD6J8X6"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* ✅ 전역 스크롤/페이지 상태 복원 Provider (앱 전역 래퍼) */}
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
