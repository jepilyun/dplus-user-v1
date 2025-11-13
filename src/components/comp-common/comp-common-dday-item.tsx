import { calculateDaysFromToday } from "@/utils/calc-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { computeBadgeColors } from "@/utils/color-generator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TMapCategoryEventWithEventInfo, TMapCityEventWithEventInfo, TMapCountryEventWithEventInfo, TMapFolderEventWithEventInfo, TMapGroupEventWithEventInfo, TMapStagEventWithEventInfo, TMapTagEventWithEventInfo } from "dplus_common_v1";
import Image from "next/image";
import { generateStorageImageUrl } from "@/utils/generate-image-url";
import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date-utils";


export default function CompCommonDdayItem({
  event,
  fullLocale,
}: { event: TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo | TMapCategoryEventWithEventInfo | TMapCountryEventWithEventInfo; fullLocale: string }) {
  const router = useRouter();
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
    if (length <= 6) return "text-lg sm:text-xl md:text-3xl";
    if (length <= 7) return "text-base sm:text-xl md:text-2xl";
    if (length <= 8) return "text-sm sm:text-lg md:text-xl";
    if (length <= 9) return "text-xs sm:text-sm md:text-xl";

    return "text-[10px] sm:text-xs md:text-base";
  };

  // ✅ 전체 카드 클릭 핸들러
  const handleCardClick = (e: React.MouseEvent) => {
    // 태그나 다른 Link를 클릭한 경우 무시
    const target = e.target as HTMLElement;
    if (target.closest('a[data-tag-link]')) {
      return;
    }
    router.push(`/event/${code}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group m-auto w-full flex flex-row gap-5 sm:gap-6 md:gap-8 items-center p-4 rounded-sm sm:rounded-full border-0 hover:bg-gray-50 sm:border border-gray-200 cursor-pointer" 
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

      <div className="flex flex-col flex-grow gap-0">
        {/* 날짜 */}
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

        {/* 제목 & 시간 */}
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

        {/* ✅ City & Categories 태그 - 독립적인 Link */}
        {(event?.event_info?.city || (event?.event_info?.categories && event?.event_info?.categories?.length > 0)) && (
          <div className="mt-1 flex items-center gap-1 flex-wrap">
            {event?.event_info?.city && (
              <Link 
                href={`/city/${event.event_info.city.city_code}`}
                data-tag-link // ✅ 태그임을 표시
                className="text-xs md:text-sm bg-tag-city-for-list hover:opacity-80 transition-opacity"
              >
                {event.event_info.city.name_native}
              </Link>
            )}
            {event?.event_info?.categories?.map((category) => (
              <Link
                key={category.category_code}
                href={`/category/${category.category_code}`}
                data-tag-link // ✅ 태그임을 표시
                className="text-xs md:text-sm bg-tag-category-for-list hover:opacity-80 transition-opacity"
              >
                {category.name_display}
              </Link>
            ))}
          </div>
        )}
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
  );
}


function checkIfThumbnailExists(event: TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo | TMapCategoryEventWithEventInfo | TMapCountryEventWithEventInfo) {
  return event?.event_info?.thumbnail_square || event?.event_info?.thumbnail_vertical || event?.event_info?.thumbnail_horizontal;
}

function getThumbnailUrl(event: TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo | TMapCategoryEventWithEventInfo | TMapCountryEventWithEventInfo) {
  return event?.event_info?.thumbnail_square || event?.event_info?.thumbnail_vertical || event?.event_info?.thumbnail_horizontal;
}