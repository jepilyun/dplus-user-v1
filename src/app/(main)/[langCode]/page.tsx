"use client";

import Footer from "@/components/footer/footer";
import ThemeRegistry from "@/components/theme-registry";
import TopNavMain from "@/components/top-nav/top-nav-main";
import Image from "next/image";
import Link from "next/link";

export default function TrandHome() {
  const backgroundImageUrl =
    "https://cdn.concreteplayground.com/content/uploads/2023/12/City-of-Seoul_CJNattanai_Getty-Images-1.jpg";

  return (
    <ThemeRegistry>
      {/* 배경 이미지: 고정 */}
      <div className="fixed inset-0 -z-10">
        <Image src={backgroundImageUrl} alt="여행지 이미지" fill priority style={{ objectFit: "cover" }} />
        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* 실제 콘텐츠: 스크롤 가능 */}
      <div className="min-h-screen flex flex-col text-white text-center">
        <TopNavMain />

        <main className="flex-1 flex flex-col items-center justify-center py-32">
          {/* 이 div가 흰색 배경 역할을 합니다. 
            h1 자체에 배경을 넣는 대신, 부모 div를 만들어 배경처럼 보이게 합니다.
          */}
          <Link href="/city/seoul">
            <div className="main-tag-btn rounded-lg p-1">
              <h1 className="text-6xl font-bold font-poppins px-6 py-2">#Seoul</h1>
            </div>
          </Link>
          <p className="mt-4 text-2xl sm:text-4xl font-bold font-poppins">Seoul, Beyond the Map</p>
        </main>

        <Footer />
      </div>
    </ThemeRegistry>
  );
}
