"use client";

import { calculateDaysFromToday } from "@/utils/calc-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { computeBadgeColors } from "@/utils/color-generator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date-utils";
import { useNavigationSave } from "@/contexts/navigation-save-context";

interface DdayItemBaseProps {
  eventCode: string;
  date: string | null;
  time: string | null | undefined;
  title: string;
  bgColor?: string;
  fgColor?: string;
  thumbnailUrl: string | null;
  fullLocale: string;
  cityTag?: React.ReactNode;
  categoryTags?: React.ReactNode;
  useClientWrapper?: boolean;
}

export default function CompCommonDdayItemBase({
  eventCode,
  date,
  time,
  title,
  bgColor,
  fgColor,
  thumbnailUrl,
  fullLocale,
  cityTag,
  categoryTags,
  useClientWrapper = true,
}: DdayItemBaseProps) {
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

  const getDdayFontSize = (label: string | undefined) => {
    if (!label) return "text-lg sm:text-xl md:text-3xl";

    const length = label.length;
    if (label === "Today") return "text-lg sm:text-xl md:text-2xl";
    if (length <= 6) return "text-lg sm:text-xl md:text-3xl";
    if (length <= 7) return "text-base sm:text-xl md:text-2xl";
    if (length <= 8) return "text-sm sm:text-lg md:text-xl";
    if (length <= 9) return "text-xs sm:text-sm md:text-xl";

    return "text-[10px] sm:text-xs md:text-base";
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a[data-tag-link]')) return;

    saveBeforeNav?.();
    router.push(`/event/${eventCode}`);
  };

  const CardContent = (
    <div
      onClick={handleCardClick}
      className="p-4 m-auto w-full flex flex-row gap-5 sm:gap-6 md:gap-8 items-center rounded-2xl sm:rounded-full border border-white bg-white/90 transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_1px_0px_rgba(0,0,0,0.15)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_16px_16px_rgba(0,0,0,0.1)] group"
    >
      {/* D-Day Badge */}
      <div
        className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border border-white"
        style={{ background: `linear-gradient(20deg, ${bg} 0%, ${bgBrighter} 100%)` }}
        aria-label="D-day badge"
      >
        <div
          className="w-full h-full flex items-center justify-center p-2 md:p-3"
          style={{ color: fg }}
        >
          <span className={`font-rubik font-bold tracking-tight ${getDdayFontSize(ddayLabel)}`}>
            {ddayLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow gap-0">
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm md:text-base text-gray-400 transition-all duration-200">
          <span suppressHydrationWarning>
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
            <span className="inline-flex items-center px-2 py-1 whitespace-nowrap rounded-md text-gray-700 bg-gray-100 text-xs sm:text-sm md:text-base">
              {formatTimeOnly(combinedDate, fullLocale, null, null, {
                timeFormat: "12h",
                compactTime: true
              })}
            </span>
          )}
        </div>

        {/* Title */}
        <div className="mt-1 flex items-center gap-2 text-base sm:text-lg md:text-2xl font-medium leading-normal transition-all duration-200 group-hover:text-gray-800">
          <span className="font-bold text-gray-700 group-hover:text-gray-900">{title}</span>
        </div>

        {/* Tags */}
        {(cityTag || categoryTags) && (
          <div className="mt-1 flex items-center gap-1 flex-wrap">
            {cityTag}
            {categoryTags}
          </div>
        )}
      </div>

      {/* Thumbnail */}
      {thumbnailUrl && (
        <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden">
          <Image
            src={generateStorageImageUrl("events", thumbnailUrl) || ""}
            alt={title ?? "thumbnail"}
            width={128}
            height={128}
            className="w-full h-full object-cover"
            sizes="(min-width: 768px) 8rem, 6rem"
          />
        </div>
      )}
    </div>
  );

  if (useClientWrapper) {
    return (
      <div className="group m-auto w-full cursor-pointer" data-event-code={eventCode}>
        {CardContent}
      </div>
    );
  }

  return (
    <Link href={`/event/${eventCode}`}>
      {CardContent}
    </Link>
  );
}