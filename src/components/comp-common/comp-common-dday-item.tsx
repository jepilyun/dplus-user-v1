import { calculateDaysFromToday } from "@/utils/calc-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { generateDdayDatetime } from "@/utils/dday-utils";
import { computeBadgeColors } from "@/utils/color-generator";
import Link from "next/link";
import { TMapCityEventWithEventInfo, TMapFolderEventWithEventInfo, TMapGroupEventWithEventInfo, TMapStagEventWithEventInfo, TMapTagEventWithEventInfo } from "dplus_common_v1";
import Image from "next/image";
import { generateStorageImageUrl } from "@/utils/generate-image-url";


export default function CompCommonDdayItem({
  event,
  fullLocale,
}: { event: TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo; fullLocale: string }) {
  const code = event?.event_info?.event_code ?? event?.event_code ?? "default";
  const { bg, fg } = computeBadgeColors(
    event?.event_info?.date ?? null,
    event?.event_info?.bg_color ?? undefined,
    event?.event_info?.fg_color ?? undefined
  );

  console.log("event>>>>", event);

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
            <span className="font-poppins font-extrabold text-lg sm:text-xl md:text-3xl tracking-tight">
              {event?.event_info?.date
                ? getDdayLabel(calculateDaysFromToday(event?.event_info?.date))
                : ""}
            </span>
          </div>
        </div>

        {/* 텍스트 */}
        <div className="flex flex-col flex-grow gap-1 md:gap-2">
          <div className="text-sm md:text-base text-gray-600">
            {event?.event_info?.date
              ? generateDdayDatetime(
                  new Date(event?.event_info?.date),
                  fullLocale,
                  event?.event_info?.time ?? null,
                  { style: "long", timeFormat: "12h", compactTime: true }
                )
              : ""}
          </div>
          <div className="text-base sm:text-lg md:text-2xl font-medium">
            {event?.event_info?.title}
          </div>
        </div>

        {checkIfThumbnailExists(event) && (
          <div className="hidden sm:block shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-sm overflow-hidden">
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


function checkIfThumbnailExists(event: TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo) {
  return event?.event_info?.thumbnail_square || event?.event_info?.thumbnail_vertical || event?.event_info?.thumbnail_horizontal;
}

function getThumbnailUrl(event: TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo) {
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
