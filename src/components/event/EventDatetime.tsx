import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date/dateUtils";
import { ResponseEventDetailForUserFront } from "dplus_common_v1";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { isAfterStartUtc } from "@/utils/date/ddayCardUtils";


/**
 * 이벤트 상세화면에서 날짜와 시간을 표시하는 컴포넌트
 * @param eventDetail - 이벤트 상세 데이터
 * @param fullLocale - 전체 로케일
 * @param time - 시간
 * @param isRepeatAnnually - 반복 여부
 */
export function CompEventDatetime({
  eventDetail,
  fullLocale,
  time,
  // isRepeatAnnually
}: {
  eventDetail: ResponseEventDetailForUserFront | null,
  fullLocale: string,
  time: string | null | undefined,
  isRepeatAnnually: boolean
}) {
  if (!eventDetail || !eventDetail.eventDetail?.eventInfo?.date) {
    return null;
  }

  // 시간 유효성 체크
  const hasValidTime = (timeStr: string | null | undefined): boolean => {
    return !!timeStr && timeStr.trim() !== '' && timeStr !== '00:00:00';
  };

  const startDate = eventDetail.eventDetail?.eventInfo?.date;
  const endDate = eventDetail.eventDetail?.eventInfo?.end_date;
  const endTime = eventDetail.eventDetail?.eventInfo?.end_time;
  const startAtUtc = eventDetail.eventDetail?.eventInfo?.start_at_utc;

  // ✅ 기간 이벤트 여부
  const isMultiDayEvent = !!endDate && startDate !== endDate;

  // ✅ 시작 시간이 지났는지 (UTC 기준)
  const showEndDateLabel = isMultiDayEvent && isAfterStartUtc(startAtUtc);

  // 날짜와 시간 합치기
  const combinedStartDate = new Date(startDate);
  if (time) {
    parseAndSetTime(combinedStartDate, time);
  }

  const combinedEndDate = endDate ? new Date(endDate) : null;
  if (combinedEndDate && endTime) {
    parseAndSetTime(combinedEndDate, endTime);
  }

  // ✅ 글자 크기 결정: 시작일 지났으면 end가 크고, 아직 안 지났으면 start가 크다
  const startTextSize = showEndDateLabel ? "text-base sm:text-lg" : "text-lg sm:text-2xl";
  const endTextSize = showEndDateLabel ? "text-lg sm:text-2xl" : "text-base sm:text-lg";

  return (
    <div className="flex flex-col gap-2 justify-start items-start font-bold transition-all duration-300">
      <Link href={`/date/${startDate}`}>
        <div className={`flex gap-2 items-center opacity-70 hover:opacity-100 ${startTextSize}`}>
          <div>
            {formatDateTime(
              new Date(startDate),
              fullLocale,
              null,
              null,
              {
                includeTime: false,
                style: 'long'
              }
            )}
          </div>
          {/* 시작 시간 */}
          {hasValidTime(time) && (
            <div className="whitespace-nowrap">
              {formatTimeOnly(combinedStartDate, fullLocale, null, null, {
                timeFormat: "12h",
                compactTime: true
              })}
            </div>
          )}
          {!isMultiDayEvent && <ArrowRight className="w-6 h-6 sm:hidden" />}
        </div>
      </Link>

      {/* ✅ end date가 있을 때만 렌더링 */}
      {isMultiDayEvent && combinedEndDate && (
        <Link href={`/date/${endDate}`}>
          <div className={`flex gap-2 items-center opacity-70 hover:opacity-100 ${endTextSize}`}>
            <span>~</span>
            <div>
              {formatDateTime(
                combinedEndDate,
                fullLocale,
                null,
                null,
                {
                  includeTime: false,
                  style: 'long'
                }
              )}
            </div>
            {hasValidTime(endTime) && (
              <div className="whitespace-nowrap">
                {formatTimeOnly(combinedEndDate, fullLocale, null, null, {
                  timeFormat: "12h",
                  compactTime: true
                })}
              </div>
            )}
          </div>
        </Link>
      )}
    </div>
  );
}
