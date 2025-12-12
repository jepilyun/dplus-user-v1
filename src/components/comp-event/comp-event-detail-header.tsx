import { getDdayLabel } from "@/utils/dday-label"
import CompCommonDatetime from "../comp-common/comp-common-datetime"
import { CompEventCountdown } from "./comp-event-countdown"
import { CompEventCountdownTimer } from "./comp-event-countdown-timer"
import { calculateDaysFromToday } from "@/utils/calc-dates"
import { ResponseEventDetailForUserFront } from "dplus_common_v1"
import { computeBadgeColors } from "@/utils/color-generator"

/*
 * 이벤트 상세 헤더
 * @param eventDetail - 이벤트 상세 데이터
 * @param fullLocale - 전체 로케일
 * @returns 이벤트 상세 헤더
 */
export const CompEventDetailHeader = ({ eventDetail, fullLocale }: { eventDetail: ResponseEventDetailForUserFront | null, fullLocale: string }) => {
  if (!eventDetail) return null;

  const { bg, fg } = computeBadgeColors(
    eventDetail.event.date ? eventDetail.event.date.toString() : null,
    eventDetail.event.bg_color ?? undefined,
    eventDetail.event.fg_color ?? undefined
  );

  return (
    <div 
      className="rounded-xl px-1 pt-12 pb-6 lg:pt-16 lg:pb-8 flex flex-col items-center justify-center gap-4 sm:gap-6"
      style={{ backgroundColor: bg, color: fg }}
    >
      <CompEventCountdownTimer
        startAtUtc={eventDetail?.event.start_at_utc || ''}
      />
      <CompEventCountdown 
        ddayLabel={eventDetail?.event.date ? getDdayLabel(calculateDaysFromToday(eventDetail?.event.date)) : ''}
        fgColor={bg ?? "#EF007D"}
      />
      <CompCommonDatetime 
        datetime={eventDetail?.event.date ?? null}
        fullLocale={fullLocale}
        time={eventDetail?.event.time ?? null}
        isRepeatAnnually={eventDetail?.event.is_repeat_annually ?? false}
      />
    </div>
  )
}