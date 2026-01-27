"use client";

import { calculateDaysFromToday } from "@/utils/date/calcDates";
import { getDdayLabel, type SupportedLocale } from "@/utils/date/ddayLabel";
import { computeBadgeColors } from "@/utils/color/colorGenerator";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { generateStorageImageUrl } from "@/utils/image/generateImageUrl";
import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date/dateUtils";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import {
  END_DATE_LABELS,
  formatShortDate,
  isAfterStartUtc,
  getEffectiveDateForDday,
  hasValidTime,
} from "@/utils/date/ddayCardUtils";

interface DdayItemCardBaseProps {
  eventCode: string;
  date: string | null;
  time: string | null | undefined;
  endDate?: string | null;
  endTime?: string | null;
  startAtUtc?: string | null;     // ✅ UTC 시작 시간 (비교용)
  endAtUtc?: string | null;       // ✅ UTC 종료 시간 (비교용)
  title: string;
  bgColor?: string;
  fgColor?: string;
  thumbnailUrl: string | null;
  fullLocale: string;
  langCode: string;
  tags?: React.ReactNode;
  placeId?: string | null;        // ✅ Place ID
  placeName?: string | null;      // ✅ Place 이름
}

export default function DdayCardBoxType({
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
  tags,
  placeId,
  placeName,
}: DdayItemCardBaseProps) {
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

  // ✅ 시작 시간이 지났는지 (종료일 라벨 표시용) - UTC 기준
  const showEndDateLabel = isMultiDayEvent && isAfterStartUtc(startAtUtc);
  const endDateLabel = END_DATE_LABELS[langCode] || END_DATE_LABELS.en;

  // ✅ 뱃지 색상 계산 (effectiveDate 기준)
  const { bg, bgBrighter, fg } = computeBadgeColors(effectiveDateStr, bgColor, fgColor);

  const combinedDate = new Date(date ?? "");
  if (time) {
    parseAndSetTime(combinedDate, time);
  }

  // ✅ D-Day 라벨 (effectiveDate 기준)
  const supportedLangCode = (["en", "id", "ja", "ko", "th", "tw", "vi", "zh", "cn"].includes(langCode)
    ? langCode
    : "en") as SupportedLocale;
  const ddayLabel = effectiveDateStr ? getDdayLabel(calculateDaysFromToday(effectiveDateStr), supportedLangCode) : "";

  // ✅ D-Day 뱃지 텍스트 길이에 따른 폰트 크기 결정
  const getBadgeFontSize = (label: string): string => {
    const length = label.length;
    if (length <= 3) return 'text-xl'; // "D-1", "오늘" 등 - 더 크게
    // if (length <= 4) return 'text-lg'; // "D-10", "내일" 등
    if (length <= 6) return 'text-lg'; // "D-100" 등
    if (length <= 8) return 'text-base'; // "Today", "Tomorrow" 등
    if (length <= 10) return 'text-sm'; // "D-10000" 등
    return 'text-[0.625rem]'; // "D-99999" 등 매우 긴 텍스트 - 더 작게
  };
  const badgeFontSize = getBadgeFontSize(ddayLabel);

  const hasImage = !!thumbnailUrl;
  const textColor = hasImage ? 'text-white' : 'text-gray-500';

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a[data-tag-link]') || target.closest('a[data-place-link]')) return;

    router.push(`/event/${eventCode}`);
  };

  const handlePlaceClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/place/${placeId}`);
  };

  // ✅ 보조 날짜 텍스트 (제목 위에 표시)
  // 한국어: 1월 20일(화) ~ 1월 22일(목)
  // 영어: Jan. 19 (Mon) – Jan. 23 (Fri)
  const getSecondaryDateText = (): string => {
    if (!isMultiDayEvent || !startDateObj || !endDateObj) return "";

    const startStr = formatShortDate(startDateObj, langCode);
    const endStr = formatShortDate(endDateObj, langCode);

    // 언어별 구분자: 한국어/일본어/중국어는 ~, 영어/기타는 –
    const separator = ["ko", "ja", "zh", "cn", "tw"].includes(langCode) ? " ~ " : " – ";

    return `${startStr}${separator}${endStr}`;
  };

  const secondaryDateText = getSecondaryDateText();

  return (
    <div 
      className="group w-full cursor-pointer group" 
      data-event-code={eventCode}
      onClick={handleCardClick}
    >
      <div className={[
        "relative overflow-hidden rounded-4xl transition-all duration-300 h-full",
        hasImage 
          ? "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_1px_1px_0px_rgba(0,0,0,0.15)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_16px_16px_rgba(0,0,0,0.1)]"
          : "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_1px_0px_rgba(0,0,0,0.15)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_16px_16px_rgba(0,0,0,0.1)]"
      ].join(" ")}>
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
          <div className="w-full flex justify-end items-end gap-4">
            <div
              className={`inline-flex items-center justify-center rounded-full font-rubik font-bold ${badgeFontSize} flex-shrink-0 aspect-square w-20 px-1`}
              style={{
                background: `linear-gradient(20deg, ${bg} 0%, ${bgBrighter} 100%)`,
                color: fg
              }}
            >
              {ddayLabel}
            </div>
            <div className="w-full flex flex-col gap-1">
              {/* ✅ 종료일 라벨 (기간 이벤트이고 시작일이 지난 경우에만 표시) */}
              {showEndDateLabel && (
                <span className="inline-flex items-center self-start px-2 py-1 rounded-full text-xs font-medium bg-dplus-red text-white">
                  {endDateLabel}
                </span>
              )}
              {/* 기준 날짜 표시 (기간 이벤트: effectiveDate / 단일 이벤트: date) */}
              <div className="flex flex-col items-start gap-0 text-base">
                <span
                  suppressHydrationWarning
                  className={`break-words whitespace-normal ${textColor} ${hasImage ? 'opacity-90' : ''}`}
                >
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
                {/* 시간 표시 (기간 이벤트: endTime 사용 가능 시 / 단일 이벤트: time) */}
                {mounted && (
                  showEndDateLabel && hasValidTime(endTime)
                    ? (
                      <span className="inline-flex items-center whitespace-nowrap text-lg text-gray-500 flex-shrink-0">
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
                      <span className="inline-flex items-center whitespace-nowrap text-lg text-gray-500 flex-shrink-0">
                        {formatTimeOnly(combinedDate, fullLocale, null, null, {
                          timeFormat: "12h",
                          compactTime: true
                        })}
                      </span>
                    )
                )}
              </div>
            </div>
          </div>
          
          {/* 중간: 보조 날짜 + 장소 + 제목 */}
          <div className="py-6 flex-grow">
            {/* ✅ 보조 날짜 텍스트 (기간 이벤트일 때만 표시) - 제목 위 */}
            <div className="flex flex-col gap-1">
              <div className="flex flex-row items-center gap-2">
                {secondaryDateText && (
                  <div
                    suppressHydrationWarning
                    className={`mb-1 flex items-center gap-1 text-sm ${hasImage ? 'bg-black opacity-90 text-white' : 'bg-gray-100 text-gray-500'} px-2 py-1 rounded-md`}
                  >
                    <CalendarDays className="w-4 h-4 flex-shrink-0" />
                    {secondaryDateText}
                  </div>
                )}
              </div>
              <div
                className="font-bold text-2xl"
                title={title ?? ""}
                >
                {title}
              </div>
              {/* ✅ Place 정보 (있는 경우 표시) */}
              {placeId && placeName && (
                <Link
                  href={`/place/${placeId}`}
                  onClick={handlePlaceClick}
                  data-place-link
                  className={`inline-flex items-center gap-1.5 text-sm ${hasImage ? 'text-white hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'} transition-colors my-1 w-fit`}
                >
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{placeName}</span>
                </Link>
              )}
            </div>
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
            <ArrowRight className={`flex-shrink-0 w-6 h-6 ${hasImage ? 'text-white' : 'text-gray-300 group-hover:text-gray-900'}`} />
          </div>
        </div>
      </div>
    </div>
  );
}
