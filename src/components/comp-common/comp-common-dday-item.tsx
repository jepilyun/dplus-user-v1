import { calculateDaysFromToday } from "@/utils/calc-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { computeBadgeColors } from "@/utils/color-generator";
import Link from "next/link";
import { TMapCategoryEventWithEventInfo, TMapCityEventWithEventInfo, TMapCountryEventWithEventInfo, TMapFolderEventWithEventInfo, TMapGroupEventWithEventInfo, TMapStagEventWithEventInfo, TMapTagEventWithEventInfo } from "dplus_common_v1";
import Image from "next/image";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date-utils";


export default function CompCommonDdayItem({
  event,
  fullLocale,
}: { event: TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo | TMapCategoryEventWithEventInfo | TMapCountryEventWithEventInfo; fullLocale: string }) {
  const code = event?.event_info?.event_code ?? event?.event_code ?? "default";
  const { bg, fg } = computeBadgeColors(
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

  // D-day 레이블과 폰트 크기 계산
  const ddayLabel = event?.event_info?.date
    ? getDdayLabel(calculateDaysFromToday(event?.event_info?.date))
    : "";
  
  const getDdayFontSize = (label: string | undefined) => {
    if (!label) return "text-lg sm:text-xl md:text-3xl";

    const length = label.length;
    if (label === "Today") return "text-lg sm:text-xl md:text-2xl";
    if (length <= 6) return "text-lg sm:text-xl md:text-3xl"; // D-100
    if (length <= 7) return "text-base sm:text-xl md:text-2xl"; // D-1000
    if (length <= 8) return "text-sm sm:text-lg md:text-xl"; // D-10000
    if (length <= 9) return "text-xs sm:text-sm md:text-xl"; // D-10000

    return "text-[10px] sm:text-xs md:text-base"; // D-10000+
  };

  return (
    <Link href={`/event/${code}`}>
      <div className="group m-auto w-full flex flex-row gap-5 sm:gap-6 md:gap-8 items-center p-4 rounded-full border-0 hover:bg-gray-50 sm:border border-gray-200" data-event-code={code}>
        <div
          className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full"
          style={{ backgroundColor: bg }}
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

        {/* 나머지 코드 동일 */}
        <div className="flex flex-col flex-grow gap-0">
          <div className="flex items-center gap-2 text-sm md:text-base text-gray-400 transition-all duration-200 group-hover:text-gray-800 group-hover:font-bold">
            <span>
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
            {hasValidTime(event?.event_info?.time) && (
              <span className="md:hidden inline-flex items-center px-2 py-1 whitespace-nowrap rounded-md text-gray-700 bg-gray-100 group-hover:text-white group-hover:bg-gray-700 text-xs">
                {formatTimeOnly(combinedDate, "ko-KR", null, null, {
                  timeFormat: "12h",
                  compactTime: true
                })}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2 text-base sm:text-lg md:text-2xl font-medium leading-normal transition-all duration-200 group-hover:text-gray-800">
            {hasValidTime(event?.event_info?.time) && (
              <span className="hidden md:inline-flex items-center px-2 py-1 whitespace-nowrap rounded-md text-gray-700 bg-gray-100 group-hover:text-white group-hover:bg-gray-700 text-xs sm:text-sm md:text-base">
                {formatTimeOnly(combinedDate, "ko-KR", null, null, {
                  timeFormat: "12h",
                  compactTime: true
                })}
              </span>
            )}
            <span>{event?.event_info?.title}</span>
          </div>
        </div>

        {checkIfThumbnailExists(event) && (
          <div className="hidden sm:block shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden">
            <Image
              src={generateStorageImageUrl("events", getThumbnailUrl(event) || null) || ""}
              alt={event?.event_info?.title ?? "thumbnail"}
              width={128}
              height={128}
              className="w-full h-full object-cover"
              sizes="(min-width: 768px) 8rem, 6rem"
            />
          </div>
        )}
      </div>
    </Link>
  );
}


function checkIfThumbnailExists(event: TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo | TMapCategoryEventWithEventInfo | TMapCountryEventWithEventInfo) {
  return event?.event_info?.thumbnail_square || event?.event_info?.thumbnail_vertical || event?.event_info?.thumbnail_horizontal;
}

function getThumbnailUrl(event: TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo | TMapCategoryEventWithEventInfo | TMapCountryEventWithEventInfo) {
  return event?.event_info?.thumbnail_square || event?.event_info?.thumbnail_vertical || event?.event_info?.thumbnail_horizontal;
}

// {"date":"2025-12-25",
//   "added_at":"2025-10-15T07:56:13.028129+00:00",
//   "event_code":"202512-NnD-3bD-lFY",
//   "event_info":{
//     "url":null,
//     "date":"2025-12-25",
//     "time":null,
//     "title":"메리크리스마스",
//     "profile":null,
//     "bg_color":null,
//     "duration":null,
//     "fg_color":null,
//     "is_active":true,
//     "event_code":"202512-NnD-3bD-lFY",
//     "is_display":true,
//     "description":null,
//     "utc_minutes":540,
//     "thumbnail_square":null,
//     "is_repeat_annually":false,
//     "thumbnail_vertical":null,"
//     thumbnail_horizontal":null},
//     "folder_code":"F-2025-7a8-e1f-e0c",
//     "is_selected":false
// }
