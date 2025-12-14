"use client";

import { calculateDaysFromToday } from "@/utils/calc-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { computeBadgeColors } from "@/utils/color-generator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { TEventCardForDateDetail } from "dplus_common_v1";
import Image from "next/image";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date-utils";
import { useNavigationSave } from "@/contexts/navigation-save-context";
import { ArrowRight } from "lucide-react";

export default function CompCommonDdayItemCardForDate({
  event,
  fullLocale,
}: { 
  event: TEventCardForDateDetail; 
  fullLocale: string;
}) {
  const router = useRouter();
  const saveBeforeNav = useNavigationSave();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const code = event?.event_code ?? "default";
  const { bg, bgBrighter, fg } = computeBadgeColors(
    event?.date ?? null,
    event?.bg_color ?? undefined,
    event?.fg_color ?? undefined
  );

  const combinedDate = new Date(event?.date ?? "");
  if (event?.time) {
    parseAndSetTime(combinedDate, event.time);
  }

  const hasValidTime = (timeStr: string | null | undefined): boolean => {
    return !!timeStr && timeStr.trim() !== '' && timeStr !== '00:00:00';
  };

  const ddayLabel = event?.date
    ? getDdayLabel(calculateDaysFromToday(event?.date))
    : "";

  const thumbnailUrl = getThumbnailUrl(event);
  const hasImage = !!thumbnailUrl;
  const textColor = hasImage ? 'text-white' : 'text-gray-500';

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a[data-tag-link]')) return;
    
    saveBeforeNav?.();
    router.push(`/event/${code}`);
  };

  return (
    <div 
      className="group w-full cursor-pointer" 
      data-event-code={code}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-2xl shadow-[0_1px_3px_0_rgba(0,0,0,0.15)] hover:shadow-[0_10px_10px_rgba(0,0,0,0.1)] transition-all duration-300 h-full">
        {/* 배경 레이어 */}
        {hasImage ? (
          <>
            <Image
              src={generateStorageImageUrl("events", thumbnailUrl) || ""}
              alt={event?.title ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div 
              className="absolute inset-0"
              style={{ background: `linear-gradient(135deg, #000000CC 0%, #00000010 200%)` }}
              aria-hidden="true"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-white" />
        )}

        {/* 콘텐츠 */}
        <div 
          className="relative z-10 p-5 h-full flex flex-col justify-start"
          style={{ color: hasImage ? '#FFFFFF' : '#222222' }}
        >
          {/* 상단: D-Day Badge + 날짜/시간 */}
          <div className="flex justify-end items-end gap-4">
            <div 
              className="inline-flex items-center justify-center rounded-full font-rubik font-bold text-lg flex-shrink-0 aspect-square w-20"
              style={{ 
                background: `linear-gradient(20deg, ${bg} 0%, ${bgBrighter} 100%)`,
                color: fg
              }}
            >
              {ddayLabel}
            </div>
            <div className="flex flex-grow flex-wrap items-center gap-0.5 text-base">
              <span suppressHydrationWarning className={`truncate ${textColor} ${hasImage ? 'opacity-90' : ''}`}>
                {event?.date
                  ? formatDateTime(
                      new Date(event?.date),
                      fullLocale,
                      null,
                      null,
                      { includeTime: false, style: 'long' }
                    )
                  : ""}
              </span>
              {mounted && hasValidTime(event?.time) && (
                <span className="inline-flex items-center whitespace-nowrap text-base flex-shrink-0">
                  {formatTimeOnly(combinedDate, fullLocale, null, null, {
                    timeFormat: "12h",
                    compactTime: true
                  })}
                </span>
              )}
            </div>
          </div>
          
          {/* 중간: 제목 */}
          <div 
            className="py-6 font-bold text-2xl flex-grow"
            title={event?.title ?? ""}
          >
            {event?.title}
          </div>

          {/* 하단: 화살표만 (태그 없음) */}
          <div className="flex items-center justify-end">
            <ArrowRight className={`flex-shrink-0 w-6 h-6 ${hasImage ? 'text-white' : 'text-black'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function getThumbnailUrl(event: TEventCardForDateDetail) {
  return event?.thumbnail_square || event?.thumbnail_vertical || event?.thumbnail_horizontal;
}