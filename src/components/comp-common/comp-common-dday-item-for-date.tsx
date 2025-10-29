import { calculateDaysFromToday } from "@/utils/calc-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { computeBadgeColors } from "@/utils/color-generator";
import Link from "next/link";
import { TEventCardForDateDetail } from "dplus_common_v1";
import Image from "next/image";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date-utils";


export default function CompCommonDdayItemForDate({
  event,
  fullLocale,
}: { event: TEventCardForDateDetail; fullLocale: string }) {
  const code = event?.event_code ?? "default";
  const { bg, fg } = computeBadgeColors(
    event?.date ?? null,
    event?.bg_color ?? undefined,
    event?.fg_color ?? undefined
  );

  
  const combinedDate = new Date(event?.date ?? "");

  if (event?.time) {
    parseAndSetTime(combinedDate, event.time);
  }

  // 컴포넌트 상단에 추가
  const hasValidTime = (timeStr: string | null | undefined): boolean => {
    return !!timeStr && timeStr.trim() !== '' && timeStr !== '00:00:00';
  };

  return (
    <Link href={`/event/${code}`}>
      <div className="m-auto w-full flex flex-row gap-8 items-center p-4 rounded-xs border-0 hover:bg-gray-50 sm:border border-gray-200" data-event-code={code}>
        <div
          className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-sm"
          style={{ backgroundColor: bg }}
          aria-label="D-day badge"
        >
          <div
            className="w-full h-full flex items-center justify-center rounded-[1rem] p-2 md:p-3"
            style={{ color: fg }}
          >
            <span className="font-candal font-extrabold text-lg sm:text-xl md:text-3xl tracking-tight">
              {event?.date
                ? getDdayLabel(calculateDaysFromToday(event?.date))
                : ""}
            </span>
          </div>
        </div>

        {/* 텍스트 */}
        <div className="flex flex-col flex-grow gap-1 md:gap-2">
          <div className="text-sm md:text-base text-gray-600">
          {event?.date
            ? formatDateTime(
                new Date(event?.date),
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
          <div className="flex flex-col sm:flex-row sm:inline-flex gap-2 items-center">
            {hasValidTime(event?.time) && (
              <div className="px-2 py-1 whitespace-nowrap rounded-md text-gray-600 bg-gray-100 text-xs sm:text-sm">
                {formatTimeOnly(combinedDate, "ko-KR", null, null, {
                  timeFormat: "12h",
                  compactTime: true
                })}
              </div>
            )}
            <div className="text-base sm:text-lg md:text-2xl font-medium">
              {event?.title}
            </div>
          </div>
        </div>

        {checkIfThumbnailExistsForDate(event) && (
          <div className="hidden sm:block shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-sm overflow-hidden">
            <Image
              src={generateStorageImageUrl("events", getThumbnailUrlForDate(event) || null) || ""}
              alt={event?.title ?? "thumbnail"}
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


function checkIfThumbnailExistsForDate(event: TEventCardForDateDetail) {
  return event?.thumbnail_square || event?.thumbnail_vertical || event?.thumbnail_horizontal;
}

function getThumbnailUrlForDate(event: TEventCardForDateDetail) {
  return event?.thumbnail_square || event?.thumbnail_vertical || event?.thumbnail_horizontal;
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
