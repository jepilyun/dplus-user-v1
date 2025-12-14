"use client";

import { calculateDaysFromToday } from "@/utils/calc-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { computeBadgeColors } from "@/utils/color-generator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TMapCategoryEventWithEventInfo, TMapCityEventWithEventInfo, TMapCountryEventWithEventInfo, TMapFolderEventWithEventInfo, TMapGroupEventWithEventInfo, TMapStagEventWithEventInfo, TMapTagEventWithEventInfo } from "dplus_common_v1";
import Image from "next/image";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date-utils";
import { useNavigationSave } from "@/contexts/navigation-save-context";

export default function CompCommonDdayItemCard({
  event,
  fullLocale,
}: { 
  event: TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo | TMapCategoryEventWithEventInfo | TMapCountryEventWithEventInfo; 
  fullLocale: string;
}) {
  const router = useRouter();
  const saveBeforeNav = useNavigationSave();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const code = event?.event_info?.event_code ?? event?.event_code ?? "default";
  const { bg, bgBrighter, fg } = computeBadgeColors(
    event?.event_info?.date ?? null,
    event?.event_info?.bg_color ?? undefined,
    event?.event_info?.fg_color ?? undefined
  );

  const combinedDate = new Date(event?.event_info?.date ?? "");

  if (event?.event_info?.time) {
    parseAndSetTime(combinedDate, event.event_info.time);
  }

  const hasValidTime = (timeStr: string | null | undefined): boolean => {
    return !!timeStr && timeStr.trim() !== '' && timeStr !== '00:00:00';
  };

  const ddayLabel = event?.event_info?.date
    ? getDdayLabel(calculateDaysFromToday(event?.event_info?.date))
    : "";

  const thumbnailUrl = getThumbnailUrl(event);
  const hasImage = !!thumbnailUrl;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a[data-tag-link]')) {
      return;
    }
    
    saveBeforeNav?.();
    router.push(`/event/${code}`);
  };

  return (
    <div 
      className="group w-full cursor-pointer" 
      data-event-code={code}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-xl shadow-[0_1px_5px_0_rgba(0,0,0,0.15)] hover:shadow-[0_16px_16px_rgba(0,0,0,0.2)] transition-all duration-300 aspect-square">
        {/* 배경 레이어 */}
        {hasImage ? (
          <>
            {/* 배경 이미지 */}
            <Image
              src={generateStorageImageUrl("events", thumbnailUrl) || ""}
              alt={event?.event_info?.title ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            
            {/* 반투명 그라데이션 오버레이 */}
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, #00000080 0%, #00000040 100%)`
              }}
              aria-hidden="true"
            />
          </>
        ) : (
          <>
            {/* 배경 그라데이션 */}
            <div 
              className="absolute inset-0 bg-white"
            />
            <div 
              className="absolute inset-0"
            />
          </>
        )}

        {/* 콘텐츠 */}
        <div 
          className="relative z-10 p-6 h-full flex flex-col justify-start gap-6"
          style={{ color: hasImage ? '#FFFFFF' : '#222222' }}
        >
          {/* 상단: D-Day Badge */}
          <div className="flex justify-start">
            <div 
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-rubik font-bold text-lg backdrop-blur-sm"
              style={{ 
                backgroundColor: hasImage ? '#FFFFFF' : bg,
                color: hasImage ? '#000000' : fg
              }}
            >
              {ddayLabel}
            </div>
          </div>
          
          {/* 하단: 날짜, 제목, 태그 */}
          <div className="flex flex-col gap-3 justify-start">
            {/* 날짜 & 시간 */}
            <div className="flex items-center gap-2 text-base font-bold opacity-80">
              <span suppressHydrationWarning className="truncate">
                {event?.event_info?.date
                  ? formatDateTime(
                      new Date(event?.event_info?.date),
                      fullLocale,
                      null,
                      null,
                      {
                        includeTime: false,
                        style: 'long'
                      }
                    )
                  : ""}
              </span>
              {mounted && hasValidTime(event?.event_info?.time) && (
                <span 
                  className="inline-flex items-center px-2 py-1 whitespace-nowrap rounded-md text-xs backdrop-blur-sm flex-shrink-0" 
                  style={{ 
                    backgroundColor: `${fg}40`, 
                    color: fg 
                  }}
                >
                  {formatTimeOnly(combinedDate, fullLocale, null, null, {
                    timeFormat: "12h",
                    compactTime: true
                  })}
                </span>
              )}
            </div>

            <div 
              className="font-bold text-2xl"
              title={event?.event_info?.title ?? ""}
            >
              {event?.event_info?.title}
            </div>

            {/* City & Categories 태그 */}
            {(event?.event_info?.city || (event?.event_info?.categories && event?.event_info?.categories?.length > 0)) && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {event?.event_info?.city && (
                  <Link 
                    href={`/city/${event.event_info.city.city_code}`}
                    data-tag-link
                    className="text-xs px-2.5 py-1 rounded-full backdrop-blur-sm transition-opacity hover:opacity-80 truncate max-w-[140px]"
                    style={{ 
                      backgroundColor: `${hasImage ? '#FFFFFF80' : `#22222210`}`, 
                      color: hasImage ? '#FFFFFF' : '#222222' 
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {event.event_info.city.name_native}
                  </Link>
                )}
                {event?.event_info?.categories?.slice(0, 2).map((category) => (
                  <Link
                    key={category.category_code}
                    href={`/category/${category.category_code}`}
                    data-tag-link
                    className="text-xs px-2.5 py-1 rounded-full backdrop-blur-sm transition-opacity hover:opacity-80 truncate max-w-[140px]"
                    style={{ 
                      backgroundColor: `${hasImage ? '#FFFFFF80' : `#22222210`}`, 
                      color: hasImage ? '#FFFFFF' : '#222222' 
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {category.name_display}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getThumbnailUrl(event: TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo | TMapCategoryEventWithEventInfo | TMapCountryEventWithEventInfo) {
  return event?.event_info?.thumbnail_square || event?.event_info?.thumbnail_vertical || event?.event_info?.thumbnail_horizontal;
}