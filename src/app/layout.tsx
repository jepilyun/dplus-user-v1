import type { Metadata } from "next";
import { Monoton, Noto_Sans, Noto_Sans_KR, Poppins, Candal } from "next/font/google";
import Script from "next/script";
import { dplusI18nKO } from "@/i18n-data/dplus-i18n-ko";
import { ScrollRestorationProvider } from "@/contexts/scroll-restoration-context";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";  // <- 누락되면 Tailwind가 전역 적용 안됨


// 기본 메타데이터 설정
export const metadata: Metadata = {
  title: dplusI18nKO.metadata.title,
  description: dplusI18nKO.metadata.description,
  keywords: dplusI18nKO.metadata.keywords,
  openGraph: {
    title: dplusI18nKO.metadata.og_title,
    description: dplusI18nKO.metadata.og_description,
    url: dplusI18nKO.metadata.og_url,
    type: "website",
    locale: dplusI18nKO.metadata.og_locale,
    siteName: dplusI18nKO.metadata.og_site_name,
    images: [
      {
        url: dplusI18nKO.metadata.og_image,
        width: dplusI18nKO.metadata.og_image_width,
        height: dplusI18nKO.metadata.og_image_height,
        alt: dplusI18nKO.metadata.og_image_alt,
      },
    ],
  },
  icons: {
    // 💡 rel="icon" 에 해당
    icon: [
      {
        url: "/icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icons/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/icons/favicon-64x64.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        url: "/icons/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      {
        url: "/icons/favicon-128x128.png",
        sizes: "128x128",
        type: "image/png",
      },
    ],
    // 💡 rel="apple-touch-icon" 에 해당
    apple: [
      {
        url: "/icons/apple-icon-180x180.png",
        sizes: "180x180",
        type: "image/png",
      },
      // 다른 크기의 apple-icon이 있다면 여기에 추가
    ],
    // 💡 rel="shortcut icon" 이 필요하다면 추가
    shortcut: "/favicon.ico",
  },
};

const monoton = Monoton({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-monoton", // CSS 변수로 사용
});

const notoSans = Noto_Sans({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans", // CSS 변수로 사용
});

// 폰트 설정 (Pretendard는 구글 폰트가 아니므로, 가장 유사한 Noto Sans KR로 대체)
const notoSansKR = Noto_Sans_KR({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-kr", // CSS 변수로 사용
});

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins", // CSS 변수로 사용
});

const candal = Candal({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-candal", // CSS 변수로 사용
});

/**
 * RootLayout
 * @param children - 자식 컴포넌트
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${notoSans.variable} ${notoSansKR.variable} ${monoton.variable} ${poppins.variable} ${candal.variable} antialiased`}>
      {/* Google Tag Manager script (head에 삽입), <head> 태그 사용하면 안됨  */}
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
      
      <body>
        <ScrollRestorationProvider>
          {/* ✅ Google Tag Manager (noscript) - body 맨 앞 */}
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-5CD6J8X6"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            ></iframe>
          </noscript>
          {children}
          <Analytics />
          <SpeedInsights />
        </ScrollRestorationProvider>
      </body>
    </html>
  );
}
