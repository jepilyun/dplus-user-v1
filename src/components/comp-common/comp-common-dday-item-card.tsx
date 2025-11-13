"use client";

import { calculateDaysFromToday } from "@/utils/calc-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { computeBadgeColors } from "@/utils/color-generator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  TMapCategoryEventWithEventInfo, 
  TMapCityEventWithEventInfo, 
  TMapCountryEventWithEventInfo, 
  TMapFolderEventWithEventInfo, 
  TMapGroupEventWithEventInfo, 
  TMapStagEventWithEventInfo, 
  TMapTagEventWithEventInfo 
} from "dplus_common_v1";
import Image from "next/image";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date-utils";

type EventType = 
  | TMapFolderEventWithEventInfo 
  | TMapCityEventWithEventInfo 
  | TMapStagEventWithEventInfo 
  | TMapGroupEventWithEventInfo 
  | TMapTagEventWithEventInfo 
  | TMapCategoryEventWithEventInfo 
  | TMapCountryEventWithEventInfo;

export default function CompCommonDdayItemCard({
  event,
  fullLocale,
}: { 
  event: EventType;
  fullLocale: string;
}) {
  const router = useRouter();
  const code = event?.event_info?.event_code ?? event?.event_code ?? "default";
  const { bg, fg } = computeBadgeColors(
    event?.event_info?.date ?? null,
    event?.event_info?.bg_color ?? undefined,
    event?.event_info?.fg_color ?? undefined
  );

  // D-day 레이블
  const ddayLabel = event?.event_info?.date
    ? getDdayLabel(calculateDaysFromToday(event?.event_info?.date))
    : "";

  // 썸네일 확인
  const thumbnailUrl = 
    event?.event_info?.thumbnail_square || 
    event?.event_info?.thumbnail_vertical || 
    event?.event_info?.thumbnail_horizontal;
  
  const thumbnailSrc = thumbnailUrl 
    ? generateStorageImageUrl("events", thumbnailUrl) 
    : null;

  const combinedDate = new Date(event?.event_info?.date ?? "");

  // ✅ 시간 파싱 및 설정
  if (event?.event_info?.time) {
    parseAndSetTime(combinedDate, event.event_info.time);
  }

  const hasValidTime = (timeStr: string | null | undefined): boolean => {
    return !!timeStr && timeStr.trim() !== '' && timeStr !== '00:00:00';
  };

  // 카드 클릭 핸들러
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a[data-tag-link]')) {
      return;
    }
    router.push(`/event/${code}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-300/50 bg-white hover:shadow-xl transition-all duration-200 cursor-pointer"
      data-event-code={code}
    >
      {/* 상단 박스 - 이미지 또는 D-day */}
      <div className="relative h-48 sm:h-56 overflow-hidden">
        {thumbnailSrc ? (
          <>
            {/* 배경 이미지 */}
            <Image
              src={thumbnailSrc}
              alt={event?.event_info?.title ?? "thumbnail"}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            
            {/* ✅ 어두운 오버레이 - hover 시 더 밝아짐 */}
            <div className="absolute inset-0 bg-black/60 transition-all duration-300 group-hover:bg-black/30" />
            
            {/* ✅ D-day와 날짜 - hover 시 opacity 감소 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 group-hover:opacity-70">
              <div className="flex flex-col items-center justify-center gap-3">
                {/* D-day 텍스트 */}
                <div 
                  className="text-5xl font-rubik font-bold tracking-tight whitespace-nowrap text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]"
                >
                  {ddayLabel}
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                  <div className="text-base font-medium" style={{ color: fg }}>
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
                  </div>
                  {hasValidTime(event?.event_info?.time) && (
                    <span className="items-center whitespace-nowrap font-semibold" style={{ color: fg }}>
                      {formatTimeOnly(combinedDate, "ko-KR", null, null, {
                        timeFormat: "12h",
                        compactTime: true
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* 이미지 없을 때 - D-day 배경 */
          <div 
            className="absolute inset-0 flex flex-col gap-3 items-center justify-center"
            style={{ backgroundColor: bg }}
          >
            <div 
              className="text-center text-5xl font-rubik font-bold tracking-tight"
              style={{ color: fg }}
            >
              {ddayLabel}
            </div>
            {/* 날짜 */}
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="text-base font-medium" style={{ color: fg }}>
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
              </div>
              {hasValidTime(event?.event_info?.time) && (
                <span className="items-center whitespace-nowrap font-semibold" style={{ color: fg }}>
                  {formatTimeOnly(combinedDate, "ko-KR", null, null, {
                    timeFormat: "12h",
                    compactTime: true
                  })}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 좌측 상단 태그들 */}
        {(event?.event_info?.city || (event?.event_info?.categories && event?.event_info?.categories?.length > 0)) && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-2">
            {event?.event_info?.city && (
              <Link
                href={`/city/${event.event_info.city.city_code}`}
                data-tag-link
                className="flex items-center justify-center min-w-[80px] h-8 px-3 text-sm bg-tag-city-for-thumbnail hover:opacity-90 transition-opacity rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="px-2 text-md font-bold truncate text-center leading-none">
                  {event.event_info.city.name_native}
                </span>
              </Link>
            )}
            {event?.event_info?.categories?.slice(0, 2).map((category) => (
              <Link
                key={category.category_code}
                href={`/category/${category.category_code}`}
                data-tag-link
                className="flex items-center justify-center min-w-[80px] h-8 px-3 text-sm bg-tag-category-for-thumbnail hover:opacity-90 transition-opacity rounded-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="px-2 text-md font-bold truncate text-center leading-none">
                  {category.name_display}
                </span>
              </Link>
            ))}
            {event?.event_info?.categories && event.event_info.categories.length > 2 && (
              <div className="flex items-center justify-center min-w-[40px] h-8 px-2 text-xs bg-gray-800/80 text-white rounded-lg">
                <span className="px-2 text-md font-bold leading-none">
                  +{event.event_info.categories.length - 2}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 하단 정보 */}
      <div className="p-4 flex flex-col gap-2">
        <div className="mt-1 flex items-center gap-2 text-base sm:text-lg font-bold leading-normal transition-all duration-200 text-gray-700 group-hover:text-gray-800">
          <span>{event?.event_info?.title}</span>
        </div>
      </div>
    </div>
  );
}


// function checkIfThumbnailExists(event: TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo | TMapCategoryEventWithEventInfo | TMapCountryEventWithEventInfo) {
//   return event?.event_info?.thumbnail_square || event?.event_info?.thumbnail_vertical || event?.event_info?.thumbnail_horizontal;
// }

// function getThumbnailUrl(event: TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo | TMapCategoryEventWithEventInfo | TMapCountryEventWithEventInfo) {
//   return event?.event_info?.thumbnail_square || event?.event_info?.thumbnail_vertical || event?.event_info?.thumbnail_horizontal;
// }