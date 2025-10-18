// components/comp-image/city-background-carousel.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { HeadlineTagsDetail } from "../headline-tags-detail";
import { SUPPORT_LANG_CODES, TCityDetail } from "dplus_common_v1";

export function HeroImageBackgroundCarouselCity({ bucket, imageUrls = [], interval = 5000, cityDetail, langCode }: {
  bucket: string;
  imageUrls: string[];
  interval?: number;
  cityDetail: TCityDetail | null;
  langCode: (typeof SUPPORT_LANG_CODES)[number];
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (imageUrls.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % imageUrls.length);
    }, interval);
    return () => clearInterval(timer);
  }, [imageUrls, interval]);

  if (!imageUrls.length) return null;

  return (
    <div className="relative w-full h-[240px] md:h-[360px] lg:h-[480px] overflow-hidden">
      {imageUrls.map((url, idx) => (
        <Image
          key={url}
          src={generateStorageImageUrl(bucket, url) ?? ""}
          alt={`City background ${idx}`}
          fill
          className={clsx(
            "absolute inset-0 object-cover transition-opacity duration-1000 ease-in-out",
            idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
          sizes="100vw"
          priority={idx === 0}
        />
      ))}

      {/* 블랙 오버레이 */}
      <div className="absolute inset-0 bg-black/50 z-20" />

      {/* 텍스트 영역 (예시) */}
      {cityDetail && (
        <div className="absolute inset-0 z-30 flex gap-4 md:gap-6 lg:gap-8 flex-col items-center justify-center text-white text-center px-4">
          <HeadlineTagsDetail
            targetCountryCode={cityDetail.country_code || null}
            targetCountryName={cityDetail.country_native || null}
            langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
          />
          <div id="city-title" className="text-center font-extrabold text-4xl md:text-5xl lg:text-6xl"
            data-city-code={cityDetail.city_code}
          >
            <div>{cityDetail.name_native}</div>
          </div>
        </div>
      )}
    </div>
  );
}
