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
import { ArrowRight } from "lucide-react";

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
      <div className="relative overflow-hidden rounded-4xl shadow-[0_1px_3px_0_rgba(0,0,0,0.15)] hover:shadow-[0_10px_10px_rgba(0,0,0,0.1)] transition-all duration-300 h-auto md:aspect-square">
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
                background: `linear-gradient(135deg, #000000CC 0%, #00000010 200%)`,
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
          className="relative z-10 p-5 h-full flex flex-col justify-start w-full"
          style={{ color: hasImage ? '#FFFFFF' : '#222222' }}
        >
          <div className="flex justify-end items-end gap-4">
            <div 
              className="inline-flex items-center justify-center p-0 rounded-full font-rubik font-bold text-lg backdrop-blur-sm flex-shrink-0 aspect-square w-20"
              style={{ 
                background: `linear-gradient(20deg, ${bg} 0%, ${bgBrighter} 100%)`,
                color: fg
              }}
            >
              {ddayLabel}
            </div>
            <div className="flex flex-grow flex-wrap items-center gap-0.5 text-base text-gray-500">
              <span suppressHydrationWarning className={`truncate ${hasImage ? 'text-white opacity-90' : 'text-gray-500'}`}>
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
                  className="inline-flex items-center whitespace-nowrap text-base backdrop-blur-sm flex-shrink-0" 
                >
                  {formatTimeOnly(combinedDate, fullLocale, null, null, {
                    timeFormat: "12h",
                    compactTime: true
                  })}
                </span>
              )}
            </div>
          </div>
          
          {/* 하단: 제목, 태그 */}
          <div className="flex flex-col gap-1 justify-start h-full">
            <div 
              className="py-4 font-bold text-2xl flex-grow"
              title={event?.event_info?.title ?? ""}
            >
              {event?.event_info?.title}
            </div>

            <div className="flex items-center justify-between gap-1.5">
            {(event?.event_info?.city || (event?.event_info?.categories && event?.event_info?.categories?.length > 0)) ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {event?.event_info?.city && (
                  <Link 
                    href={`/city/${event.event_info.city.city_code}`}
                    data-tag-link
                    className="text-sm px-3 py-1.5 rounded-full backdrop-blur-sm transition-opacity hover:opacity-80 truncate max-w-[140px]"
                    style={{ 
                      backgroundColor: `${hasImage ? '#FFFFFF' : `#22222210`}`, 
                      color: '#222222' 
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
                    className="text-sm px-3 py-1.5 rounded-full backdrop-blur-sm transition-opacity hover:opacity-80 truncate max-w-[140px]"
                    style={{ 
                      backgroundColor: `${hasImage ? '#FFFFFF' : `#22222210`}`, 
                      color: '#222222' 
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    {category.name_display}
                  </Link>
                ))}
              </div>
            ) : <div></div>}
            <ArrowRight className={`flex-shrink-0 w-6 h-6 ${hasImage ? 'text-white' : 'text-black'}`} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getThumbnailUrl(event: TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo | TMapCategoryEventWithEventInfo | TMapCountryEventWithEventInfo) {
  return event?.event_info?.thumbnail_square || event?.event_info?.thumbnail_vertical || event?.event_info?.thumbnail_horizontal;
}