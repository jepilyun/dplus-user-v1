"use client";

import Footer from "@/components/footer/footer";
import ThemeRegistry from "@/components/theme-registry";
import TopNavMain from "@/components/top-nav/top-nav-main";
import Image from "next/image";
import Link from "next/link";

export default function DplusHome() {
  const backgroundImageUrl =
    "https://cdn.concreteplayground.com/content/uploads/2023/12/City-of-Seoul_CJNattanai_Getty-Images-1.jpg";

  return (
    <ThemeRegistry>
      {/* 실제 콘텐츠: 스크롤 가능 */}
      <div className="min-h-screen flex flex-col text-center">
        <TopNavMain />
        <div>Heaader</div>
        <div>Main Banner</div>
        <div>Categories</div>
        <div>Recommend Events and Pevents</div>
        <div>Today Events / Tommorow Events / This Week Events</div>
        <div>Events for City</div>
        <div>Events for Nearby</div>
        <Footer />
      </div>
    </ThemeRegistry>
  );
}
