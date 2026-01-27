"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import clsx from "clsx";
import { generateStorageImageUrl } from "@/utils/image/generateImageUrl";
import { SUPPORT_LANG_CODES, TCountryDetail } from "dplus_common_v1";

export function HeroImageBackgroundCarouselCountry({ 
  bucket, 
  imageUrls = [], 
  interval = 5000, 
  countryDetail, 
  // langCode 
}: {
  bucket: string;
  imageUrls: string[];
  interval?: number;
  countryDetail: TCountryDetail | null;
  langCode: (typeof SUPPORT_LANG_CODES)[number];
}) {
  const [current, setCurrent] = useState(0);
  const hasImages = imageUrls.length > 0;

  useEffect(() => {
    if (imageUrls.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % imageUrls.length);
    }, interval);
    return () => clearInterval(timer);
  }, [imageUrls, interval]);

  return (
    <div className={clsx(
      "relative w-full overflow-hidden rounded-4xl sm:rounded-xl",
      hasImages 
        ? "h-[200px] md:h-[280px]" 
        : "h-[120px] md:h-[180px] bg-white"
    )}>
      {hasImages && imageUrls.map((url, idx) => (
        <Image
          key={url}
          src={generateStorageImageUrl(bucket, url) ?? ""}
          alt={`Country background ${idx}`}
          fill
          className={clsx(
            "absolute inset-0 object-cover transition-opacity duration-1000 ease-in-out",
            idx === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
          sizes="100vw"
          priority={idx === 0}
        />
      ))}

      {/* 블랙 오버레이 - 이미지 있을 때만 */}
      {hasImages && <div className="absolute inset-0 bg-black/50 z-20" />}

      {/* 텍스트 영역 */}
      {countryDetail && (
        <div className={clsx(
          "absolute inset-0 flex gap-4 md:gap-6 lg:gap-8 flex-col items-center justify-center text-center px-4",
          hasImages ? "z-30 text-white" : "z-10 text-gray-900"
        )}>
          {/* <HeadlineTagsDetail
            targetCountryCode={countryDetail.country_code || null}
            targetCountryName={countryDetail.country_name || null}
            langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
          /> */}
          <div id="city-title" className="text-center font-extrabold"
            data-country-code={countryDetail.country_code}
          >
            <div className="flex flex-col gap-2">
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold">{countryDetail.native}</div>
              <div className="font-thin text-md md:text-lg lg:text-xl text-gray-400">{countryDetail.country_name}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}