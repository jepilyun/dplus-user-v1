import { getDdayLabel } from "@/utils/dday-label"
import { CompEventCountdown } from "./comp-event-countdown"
import { getDdayFromUTC, getLocalTimeFromUTC } from "@/utils/calc-dates"
import { ResponseEventDetailForUserFront, SUPPORT_LANG_CODES } from "dplus_common_v1"
import { computeBadgeColors } from "@/utils/color-generator"
import { CompEventTimer } from "./comp-event-timer"
import { SupportedLocale } from "@/consts/const-config"
import { HeadlineTagsDetail } from "../headline-tags-detail"
import { CompEventDatetime } from "./comp-event-datetime"

/*
 * 이벤트 상세 헤더
 * @param eventDetail - 이벤트 상세 데이터
 * @param fullLocale - 전체 로케일
 * @param langCode - 언어 코드
 * @returns 이벤트 상세 헤더
 */
export const CompEventHeader = ({ 
  eventDetail, 
  fullLocale,
  langCode 
}: { 
  eventDetail: ResponseEventDetailForUserFront | null;
  fullLocale: string;
  langCode: SupportedLocale;
}) => {
  if (!eventDetail) return null;

  // UTC 시간을 사용자 타임존으로 변환
  const startAtUtc = eventDetail?.event.start_at_utc;
  const dday = startAtUtc ? getDdayFromUTC(startAtUtc) : 0;
  const localTime = startAtUtc ? getLocalTimeFromUTC(startAtUtc) : undefined;
  
  // D-Day 라벨 생성 (시간 포함)
  const ddayLabel = getDdayLabel(dday, langCode, localTime);

  const { bg, bgBrighter, fg } = computeBadgeColors(eventDetail?.event.date?.toString() ?? null);

  return (
    <div 
      className="p-6 sm:p-8 rounded-2xl flex flex-col items-center justify-between gap-8 sm:gap-12 aspect-[3/4] sm:aspect-[2/1]"
      style={{ 
        background: `linear-gradient(20deg, ${bg} 0%, ${bgBrighter} 100%)`,
        color: fg
      }}
    >
      <div className="w-full flex flex-row flex-wrap gap-4 justify-between items-center">
        <CompEventCountdown 
          ddayLabel={ddayLabel}
          fgColor={bg}
          bgColor={fg}
        />
        <CompEventTimer startAtUtc={startAtUtc || ''} />
      </div>
      
      <div className="w-full flex flex-col gap-3 justify-center items-start">
        <CompEventDatetime 
          datetime={eventDetail?.event.date ?? null}
          fullLocale={fullLocale}
          time={eventDetail?.event.time ?? null}
          isRepeatAnnually={eventDetail?.event.is_repeat_annually ?? false}
        />
        <div
          id="event-title"
          className="font-black text-4xl sm:text-5xl"
          data-event-code={eventDetail?.event.event_code}
        >
          {eventDetail?.event.title}
        </div>
        <HeadlineTagsDetail
          targetCountryCode={eventDetail?.event.target_country_code || null}
          targetCountryName={eventDetail?.event.target_country_native || null}
          targetCityCode={eventDetail?.event.target_city_code || null}
          targetCityName={eventDetail?.event.target_city_native || null}
          categories={eventDetail?.mapCategoryEvent?.items ?? null}
          langCode={langCode}
          showCountry={false}
          fgColor={fg}
          fgHoverColor={fg}
        />
      </div>
    </div>
  )
}