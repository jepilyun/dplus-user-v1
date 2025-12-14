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
  const saveBeforeNav = useNavigationSave();

  const code = event?.event_code ?? "default";
  const { bg, bgBrighter, fg } = computeBadgeColors(
    event?.date ?? null,
    event?.bg_color ?? undefined,
    event?.fg_color ?? undefined
  );
  
  const combinedDate = new Date(event?.date ?? "");
  if (event?.time) {
    parseAndSetTime(combinedDate, event.time);
  }

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
    router.push(`/event/${code}`);
  };

  return (
    <Link href={`/event/${code}`}>
      <div 
        className="p-4 m-auto w-full flex flex-row gap-5 sm:gap-6 md:gap-8 items-center rounded-2xl sm:rounded-full border border-white bg-white/90 hover:bg-white transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_5px_0_rgba(0,0,0,0.15)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_16px_16px_rgba(0,0,0,0.1)] group" 
        data-event-code={code}
      >
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

        <div className="flex flex-col flex-grow gap-0">
          <div className="flex items-center gap-2 text-sm md:text-base text-gray-400 transition-all duration-200">
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
            {hasValidTime(event?.time) && (
              <span className="inline-flex items-center px-2 py-1 whitespace-nowrap rounded-md text-gray-700 bg-gray-100 text-xs sm:text-sm md:text-base">
                {formatTimeOnly(combinedDate, fullLocale, null, null, {
                  timeFormat: "12h",
                  compactTime: true
                })}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-2 text-base sm:text-lg md:text-2xl font-medium leading-normal transition-all duration-200 group-hover:text-gray-800">
            <span className="font-bold text-gray-700 group-hover:text-gray-900">{event?.title}</span>
          </div>
        </div>

        {checkIfThumbnailExistsForDate(event) && (
          <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden">
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