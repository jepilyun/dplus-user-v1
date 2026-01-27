"use client";

import { calculateDaysFromToday } from "@/utils/date/calcDates";
import { getDdayLabel, type SupportedLocale } from "@/utils/date/ddayLabel";
import { computeBadgeColors } from "@/utils/color/colorGenerator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { generateStorageImageUrl } from "@/utils/image/generateImageUrl";
import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date/dateUtils";
import { MapPin, Calendar } from "lucide-react";
import {
  END_DATE_LABELS,
  formatShortDate,
  isAfterStartUtc,
  getEffectiveDateForDday,
  hasValidTime,
} from "@/utils/date/ddayCardUtils";

interface DdayItemBaseProps {
  eventCode: string;
  date: string | null;
  time: string | null | undefined;
  endDate?: string | null;
  endTime?: string | null;
  startAtUtc?: string | null;
  endAtUtc?: string | null;
  title: string;
  bgColor?: string;
  fgColor?: string;
  thumbnailUrl: string | null;
  fullLocale: string;
  langCode: string;
  cityTag?: React.ReactNode;
  categoryTags?: React.ReactNode;
  placeId?: string | null;
  placeName?: string | null;
  useClientWrapper?: boolean;
}

export default function DdayCardListType({
  eventCode,
  date,
  time,
  endDate,
  endTime,
  startAtUtc,
  endAtUtc,
  title,
  bgColor,
  fgColor,
  thumbnailUrl,
  fullLocale,
  langCode,
  cityTag,
  categoryTags,
  placeId,
  placeName,
  useClientWrapper = true,
}: DdayItemBaseProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ✅ 날짜 파싱
  const startDateObj = date ? new Date(date) : null;
  const endDateObj = endDate ? new Date(endDate) : null;

  // ✅ D-Day 계산용 날짜 (UTC 기준으로 비교, 시작일이 지났으면 종료일 사용)
  const effectiveDate = getEffectiveDateForDday(startDateObj, endDateObj, startAtUtc, endAtUtc);
  const effectiveDateStr = effectiveDate?.toISOString().split("T")[0] ?? null;

  // ✅ 기간 이벤트 여부
  const isMultiDayEvent = !!endDate && date !== endDate;

  // ✅ 시작 시간이 지났는지
  const showEndDateLabel = isMultiDayEvent && isAfterStartUtc(startAtUtc);
  const endDateLabel = END_DATE_LABELS[langCode] || END_DATE_LABELS.en;

  const { bg, bgBrighter, fg } = computeBadgeColors(effectiveDateStr, bgColor, fgColor);

  const combinedDate = new Date(date ?? "");
  if (time) {
    parseAndSetTime(combinedDate, time);
  }

  // ✅ D-Day 라벨 (다국어 지원)
  const supportedLangCode = (["en", "id", "ja", "ko", "th", "tw", "vi", "zh", "cn"].includes(langCode)
    ? langCode
    : "en") as SupportedLocale;
  const ddayLabel = effectiveDateStr ? getDdayLabel(calculateDaysFromToday(effectiveDateStr), supportedLangCode) : "";

  // ✅ 보조 날짜 텍스트 (기간 이벤트일 때)
  const getSecondaryDateText = (): string => {
    if (!isMultiDayEvent || !startDateObj || !endDateObj) return "";

    const startStr = formatShortDate(startDateObj, langCode);
    const endStr = formatShortDate(endDateObj, langCode);

    const separator = ["ko", "ja", "zh", "cn", "tw"].includes(langCode) ? " ~ " : " – ";

    return `${startStr}${separator}${endStr}`;
  };

  const secondaryDateText = getSecondaryDateText();

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
    if (target.closest('a[data-tag-link]') || target.closest('a[data-place-link]')) return;

    router.push(`/event/${eventCode}`);
  };

  const handlePlaceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/place/${placeId}`);
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
          {showEndDateLabel && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-dplus-red text-white">
              {endDateLabel}
            </span>
          )}
          <span suppressHydrationWarning>
            {effectiveDate
              ? formatDateTime(
                  effectiveDate,
                  fullLocale,
                  null,
                  null,
                  { includeTime: false, style: 'long' }
                )
              : ""}
          </span>
          {mounted && (
            showEndDateLabel && hasValidTime(endTime)
              ? (
                <span className="inline-flex items-center px-2 py-1 whitespace-nowrap rounded-md text-gray-700 bg-gray-100 text-xs sm:text-sm">
                  {formatTimeOnly((() => {
                    const d = new Date(endDate ?? "");
                    if (endTime) parseAndSetTime(d, endTime);
                    return d;
                  })(), fullLocale, null, null, {
                    timeFormat: "12h",
                    compactTime: true
                  })}
                </span>
              )
              : hasValidTime(time) && (
                <span className="inline-flex items-center px-2 py-1 whitespace-nowrap rounded-md text-gray-700 bg-gray-100 text-xs sm:text-sm">
                  {formatTimeOnly(combinedDate, fullLocale, null, null, {
                    timeFormat: "12h",
                    compactTime: true
                  })}
                </span>
              )
          )}
        </div>

        {/* Title */}
        <div className="mt-1 flex items-center gap-2 text-base sm:text-lg md:text-2xl font-medium leading-normal transition-all duration-200 group-hover:text-gray-800">
          <span className="font-bold text-gray-700 group-hover:text-gray-900">{title}</span>
        </div>

        <div className="flex items-center gap-1 flex-wrap text-gray-500">
          {secondaryDateText && (
            <>
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span
                suppressHydrationWarning
                className="text-xs md:text-sm"
              >
                {secondaryDateText}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Place */}
          {placeId && placeName && (
            useClientWrapper ? (
              <Link
                href={`/place/${placeId}`}
                onClick={handlePlaceClick}
                data-place-link
                className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors mt-1 w-fit"
              >
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{placeName}</span>
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 mt-1 w-fit">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{placeName}</span>
              </span>
            )
          )}

          {/* Tags */}
          {(cityTag || categoryTags) && (
            <div className="mt-1 flex items-center gap-1 flex-wrap">
              {cityTag}
              {categoryTags}
            </div>
          )}
        </div>
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