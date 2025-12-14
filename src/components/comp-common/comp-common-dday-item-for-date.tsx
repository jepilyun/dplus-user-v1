import { calculateDaysFromToday } from "@/utils/calc-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { computeBadgeColors } from "@/utils/color-generator";
import Link from "next/link";
import { TEventCardForDateDetail } from "dplus_common_v1";
import Image from "next/image";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date-utils";
import { useRouter } from "next/navigation";
import { useNavigationSave } from "@/contexts/navigation-save-context";


export default function CompCommonDdayItemForDate({
  event,
  fullLocale,
}: { event: TEventCardForDateDetail; fullLocale: string }) {
  const router = useRouter();
  const saveBeforeNav = useNavigationSave(); // ✅ 저장 함수 가져오기

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

  const ddayLabel = event?.date
    ? getDdayLabel(calculateDaysFromToday(event?.date))
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

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a[data-tag-link]')) {
      return;
    }

    // ✅ 네비게이션 직전에 저장
    saveBeforeNav?.();

    router.push(`/event/${code}`);
  };

  return (
    <Link href={`/event/${code}`}>
      <div 
        className="p-4 m-auto w-full flex flex-row gap-5 sm:gap-6 md:gap-8 items-start sm:items-center rounded-3xl sm:rounded-full border-0 group sm:border border-white sm:bg-white/90 hover:bg-white sm:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_5px_0_rgba(0,0,0,0.15)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_6px_8px_6px_rgba(0,0,0,0.05)]" 
        data-event-code={code}
      >
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

        {/* 텍스트 */}
        <div className="flex flex-col flex-grow gap-0">
        <div className="flex items-center gap-2 text-sm md:text-base text-gray-400 transition-all duration-200 group-hover:text-gray-800 group-hover:font-bold">
            <span>
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
            </span>
            {/* 모바일에서만 시간 표시 */}
            {hasValidTime(event?.time) && (
              <span className="md:hidden inline-flex items-center px-2 py-1 whitespace-nowrap rounded-md text-gray-700 bg-gray-100 group-hover:text-white group-hover:bg-gray-700 text-xs">
                {formatTimeOnly(combinedDate, "ko-KR", null, null, {
                  timeFormat: "12h",
                  compactTime: true
                })}
              </span>
            )}
          </div>

          {/* 제목 (md 이상에서는 시간 포함) */}
          <div className="mt-1 flex items-center gap-2 text-base sm:text-lg md:text-2xl font-medium leading-normal">
            {/* md 이상에서만 시간 표시 */}
            {hasValidTime(event?.time) && (
              <span className="hidden md:inline-flex items-center px-2 py-1 whitespace-nowrap rounded-md text-gray-700 bg-gray-100 group-hover:text-white group-hover:bg-gray-700 text-xs sm:text-sm md:text-base">
                {formatTimeOnly(combinedDate, "ko-KR", null, null, {
                  timeFormat: "12h",
                  compactTime: true
                })}
              </span>
            )}
            <span>{event?.title}</span>
          </div>
          {/* ✅ 모바일: 직사각형 이미지 (상단) */}
          {checkIfThumbnailExistsForDate(event) && (
            <div 
              onClick={handleCardClick}
              className="sm:hidden w-full aspect-[16/9] rounded-lg overflow-hidden mt-2 mb-3"
            >
              <Image
                src={generateStorageImageUrl("events", getThumbnailUrlForDate(event) || null) || ""}
                alt={event?.title ?? "thumbnail"}
                width={600}
                height={338}
                className="w-full h-full object-cover"
                sizes="100vw"
              />
            </div>
          )}
        </div>

        {checkIfThumbnailExistsForDate(event) && (
          <div className="hidden sm:block shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden">
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
