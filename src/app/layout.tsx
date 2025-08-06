import type { Metadata } from "next";
import { Monoton, Noto_Sans_KR, Poppins } from "next/font/google";
import { Suspense } from "react";
import GoogleAnalytics from "@/components/google-analytics";


export const metadata: Metadata = {
  title: "dplus",
  description: "dplus 놓치지 말아야 할 중요한 일정, 플러스하세요",
  icons: {
    icon: [
      {
        url: '/icons/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/icons/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/icons/favicon-48x48.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        url: '/icons/favicon-64x64.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        url: '/icons/favicon-96x96.png',
        sizes: '96x96',
        type: 'image/png',
      },
      {
        url: '/icons/favicon-128x128.png',
        sizes: '128x128',
        type: 'image/png',
      },
    ],
    // 💡 rel="apple-touch-icon" 에 해당
    apple: [
      {
        url: '/icons/apple-icon-180x180.png',
        sizes: '180x180',
        type: 'image/png',
      },
      // 다른 크기의 apple-icon이 있다면 여기에 추가
    ],
    // 💡 rel="shortcut icon" 이 필요하다면 추가
    shortcut: '/favicon.ico',
  },
};

// 폰트 설정 (Pretendard는 구글 폰트가 아니므로, 가장 유사한 Noto Sans KR로 대체)
const notoSansKR = Noto_Sans_KR({
  weight: ["100", "300", "400", "500", "700", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-kr", // CSS 변수로 사용
});

const monoton = Monoton({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-monoton", // CSS 변수로 사용
});

const poppins = Poppins({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins", // CSS 변수로 사용
});

/**
 * RootLayout
 * @param children - 자식 컴포넌트
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} ${monoton.variable} ${poppins.variable} antialiased`}>
      <body>
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
