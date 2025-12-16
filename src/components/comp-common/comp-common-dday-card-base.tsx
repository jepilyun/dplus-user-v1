"use client";

import { calculateDaysFromToday } from "@/utils/calc-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { computeBadgeColors } from "@/utils/color-generator";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date-utils";
import { useNavigationSave } from "@/contexts/navigation-save-context";
import { ArrowRight } from "lucide-react";

interface DdayItemCardBaseProps {
  eventCode: string;
  date: string | null;
  time: string | null | undefined;
  title: string;
  bgColor?: string;
  fgColor?: string;
  thumbnailUrl: string | null;
  fullLocale: string;
  tags?: React.ReactNode;
}

export default function CompCommonDdayItemCardBase({
  eventCode,
  date,
  time,
  title,
  bgColor,
  fgColor,
  thumbnailUrl,
  fullLocale,
  tags,
}: DdayItemCardBaseProps) {
  const router = useRouter();
  const saveBeforeNav = useNavigationSave();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { bg, bgBrighter, fg } = computeBadgeColors(date, bgColor, fgColor);

  const combinedDate = new Date(date ?? "");
  if (time) {
    parseAndSetTime(combinedDate, time);
  }

  const hasValidTime = (timeStr: string | null | undefined): boolean => {
    return !!timeStr && timeStr.trim() !== '' && timeStr !== '00:00:00';
  };

  const ddayLabel = date ? getDdayLabel(calculateDaysFromToday(date)) : "";

  const hasImage = !!thumbnailUrl;
  const textColor = hasImage ? 'text-white' : 'text-gray-500';

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a[data-tag-link]')) return;
    
    saveBeforeNav?.();
    router.push(`/event/${eventCode}`);
  };

  return (
    <div 
      className="group w-full cursor-pointer" 
      data-event-code={eventCode}
      onClick={handleCardClick}
    >
      <div className="relative overflow-hidden rounded-4xl shadow-[0_1px_3px_0_rgba(0,0,0,0.15)] hover:shadow-[0_10px_10px_rgba(0,0,0,0.1)] transition-all duration-300 h-full">
        {/* 배경 레이어 */}
        {hasImage ? (
          <>
            <Image
              src={generateStorageImageUrl("events", thumbnailUrl) || ""}
              alt={title ?? ""}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
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
            <div className="flex flex-grow flex-wrap items-center gap-1 text-base">
              <span suppressHydrationWarning className={`truncate ${textColor} ${hasImage ? 'opacity-90' : ''}`}>
                {date
                  ? formatDateTime(
                      new Date(date),
                      fullLocale,
                      null,
                      null,
                      { includeTime: false, style: 'long' }
                    )
                  : ""}
              </span>
              {mounted && hasValidTime(time) && (
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
            title={title ?? ""}
          >
            {title}
          </div>

          {/* 하단: 태그 + 화살표 */}
          <div className="flex items-center justify-between gap-1.5">
            {tags ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {tags}
              </div>
            ) : (
              <div />
            )}
            <ArrowRight className={`flex-shrink-0 w-6 h-6 ${hasImage ? 'text-white' : 'text-black'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}