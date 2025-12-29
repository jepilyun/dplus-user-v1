"use client";

import { getDdayLabel } from "@/utils/dday-label"
import { CompEventCountdown } from "./comp-event-countdown"
import { getDdayFromUTC, getLocalTimeFromUTC } from "@/utils/calc-dates"
import { ResponseEventDetailForUserFront, SUPPORT_LANG_CODES } from "dplus_common_v1"
import { computeBadgeColors } from "@/utils/color-generator"
import { CompEventTimer } from "./comp-event-timer"
import { SupportedLocale } from "@/consts/const-config"
import { HeadlineTagsDetail } from "../headline-tags-detail"
import { CompEventDatetime } from "./comp-event-datetime"
import { useEffect, useRef, useState, useMemo } from "react"
import Image from "next/image"
import { generateStorageImageUrl } from "@/utils/generate-image-url"

/*
 * 이벤트 상세 헤더
 * @param eventDetail - 이벤트 상세 데이터
 * @param fullLocale - 전체 로케일
 * @param langCode - 언어 코드
 * @returns 이벤트 상세 헤더
 */
export const CompEventHeader = ({ 
  eventDetail, 
  fullLocale,
  langCode 
}: { 
  eventDetail: ResponseEventDetailForUserFront | null;
  fullLocale: string;
  langCode: SupportedLocale;
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // ✅ 이미지 배열 생성 (early return 전에 모든 hooks 호출)
  const availableImages = useMemo(() => {
    if (!eventDetail) return [];
    
    const urls: string[] = [];
    
    [
      eventDetail?.eventDetail?.images?.items?.[0]?.url,
      eventDetail?.eventDetail?.images?.items?.[1]?.url,
      eventDetail?.eventDetail?.images?.items?.[2]?.url,
      eventDetail?.eventDetail?.images?.items?.[3]?.url,
      eventDetail?.eventDetail?.images?.items?.[4]?.url,
    ]
      .filter(Boolean)
      .forEach((url) => {
        const imageUrl = generateStorageImageUrl("events", url!);
        if (imageUrl) urls.push(imageUrl);
      });

    return Array.from(new Set(urls));
  }, [eventDetail]);

  const hasImages = availableImages.length > 0;
  const totalSlides = 1 + availableImages.length;

  // ✅ 스크롤 이벤트 핸들러
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const itemWidth = container.offsetWidth;
      const index = Math.round(scrollLeft / itemWidth);
      setCurrentSlideIndex(index);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Dot 클릭 핸들러
  const scrollToSlide = (index: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const itemWidth = container.offsetWidth;
    container.scrollTo({
      left: itemWidth * index,
      behavior: 'smooth'
    });
  };

  // ✅ early return은 모든 hooks 호출 후에
  if (!eventDetail) return null;

  // UTC 시간을 사용자 타임존으로 변환
  const startAtUtc = eventDetail?.eventDetail?.eventInfo?.start_at_utc;
  const dday = startAtUtc ? getDdayFromUTC(startAtUtc) : 0;
  const localTime = startAtUtc ? getLocalTimeFromUTC(startAtUtc) : undefined;
  
  // D-Day 라벨 생성 (시간 포함)
  const ddayLabel = getDdayLabel(dday, langCode, localTime);

  const { bg, bgBrighter, fg } = computeBadgeColors(eventDetail?.eventDetail?.eventInfo?.date?.toString() ?? null);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-4xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_1px_3px_0_rgba(0,0,0,0.1)]">
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* ========================================
              첫 번째 슬라이드: 항상 그라데이션 배경
              ======================================== */}
          <div className="flex-shrink-0 w-full snap-center relative">
            {/* 배경 그라데이션 */}
            <div 
              className="absolute inset-0"
              style={{ 
                background: `linear-gradient(60deg, ${bg} 0%, ${bgBrighter} 100%)`
              }}
            />
            
            {/* 상단 하이라이트 */}
            <div 
              className="absolute inset-0 bg-gradient-to-tr from-white/10 via-white/5 to-transparent pointer-events-none"
              aria-hidden="true"
            />
            
            {/* 콘텐츠 */}
            <div 
              className="relative z-10 p-6 sm:p-8 flex flex-col items-center justify-between gap-8 sm:gap-12 aspect-[3/4] sm:aspect-[2/1]"
              style={{ color: fg }}
            >
              <div className="w-full flex flex-row flex-wrap gap-4 justify-between items-center">
                <CompEventCountdown 
                  ddayLabel={ddayLabel}
                  fgColor={bg}
                  bgColor={fg}
                />
                <CompEventTimer startAtUtc={startAtUtc || ''} />
              </div>
              
              <div className="w-full flex flex-col gap-3 justify-center items-start">
                <CompEventDatetime 
                  datetime={eventDetail?.eventDetail?.eventInfo?.date ? new Date(eventDetail?.eventDetail?.eventInfo?.date) : null}
                  fullLocale={fullLocale}
                  time={eventDetail?.eventDetail?.eventInfo?.time ?? null}
                  isRepeatAnnually={eventDetail?.eventDetail?.eventInfo?.is_repeat_annually ?? false}
                />
                <div
                  id="event-title"
                  className="font-black text-4xl sm:text-5xl drop-shadow-[0_1px_1px_rgba(0,0,0,0.1)]"
                  data-event-code={eventDetail?.eventDetail?.eventInfo?.event_code}
                >
                  {eventDetail?.eventDetail?.eventInfo?.title}
                </div>
                <HeadlineTagsDetail
                  targetCountryCode={eventDetail?.eventDetail?.eventInfo?.target_country_code || null}
                  targetCountryName={eventDetail?.eventDetail?.eventInfo?.target_country_native || null}
                  targetCityCode={eventDetail?.eventDetail?.eventInfo?.target_city_code || null}
                  targetCityName={eventDetail?.eventDetail?.eventInfo?.target_city_native || null}
                  categories={eventDetail?.mapCategoryEvent?.items ?? null}
                  langCode={langCode}
                  showCountry={false}
                  fgColor={fg}
                  fgHoverColor={fg}
                />
              </div>
            </div>
          </div>

          {/* ========================================
              두 번째 슬라이드부터: 이미지들
              ======================================== */}
          {availableImages.map((imageUrl, index) => (
            <div 
              key={index}
              className="flex-shrink-0 w-full snap-center relative"
            >
              {/* 배경 이미지 */}
              <div className="relative aspect-[3/4] sm:aspect-[2/1]">
                <Image
                  src={imageUrl}
                  alt={`${eventDetail?.eventDetail?.eventInfo?.title} - ${index + 1}`}
                  fill
                  priority={false}
                  style={{ objectFit: "cover" }}
                  sizes="100vw"
                  quality={85}
                  className="transition-opacity duration-300"
                />
              </div>

              {/* 콘텐츠 */}
              <div 
                className="absolute inset-0 z-10 p-6 sm:p-8 flex flex-col items-center justify-between gap-8 sm:gap-12"
                style={{ color: '#FFFFFF' }}
              >
                <div className="w-full flex flex-row flex-wrap gap-4 justify-between items-center">
                  <CompEventCountdown 
                    ddayLabel={ddayLabel}
                    fgColor="#FFFFFF"
                    bgColor={bg}
                  />
                  {/* <CompEventTimer startAtUtc={startAtUtc || ''} /> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Dot Navigation - 이미지 영역 밖 */}
      <div className="flex justify-center py-4">
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => scrollToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              disabled={totalSlides === 1}
              className={`rounded-full transition-all ${
                totalSlides === 1 
                  ? 'bg-gray-300 w-2.5 h-2.5 cursor-default'
                  : idx === currentSlideIndex 
                    ? "border border-gray-300 bg-white w-3 h-3 cursor-pointer" 
                    : "bg-gray-300 w-2.5 h-2.5 hover:bg-gray-400 cursor-pointer"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}