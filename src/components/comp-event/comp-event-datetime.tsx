import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date-utils";
import { ResponseEventDetailForUserFront } from "dplus_common_v1";
import { ArrowRight } from "lucide-react";
import Link from "next/link";


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

  // 날짜와 시간 합치기
  const combinedDate = new Date(eventDetail.eventDetail?.eventInfo?.date);
  if (time) {
    parseAndSetTime(combinedDate, time);
  }

  return (
    <Link href={`/date/${eventDetail.eventDetail?.eventInfo?.date}`}>
      <div className="flex flex-wrap gap-1 justify-start items-center font-bold text-lg sm:text-2xl opacity-70 hover:opacity-100 transition-all duration-300">
        <div>
          {formatDateTime(
            new Date(eventDetail.eventDetail?.eventInfo?.date),
            fullLocale,
            null,
            null,
            {
              includeTime: false,
              style: 'long'
            }
          )}
        </div>
        {/* 시간 라벨 */}
        {hasValidTime(time) && (
          <div className="whitespace-nowrap">
            {formatTimeOnly(combinedDate, "ko-KR", null, null, {
              timeFormat: "12h",
              compactTime: true
            })}
          </div>
        )}
        <ArrowRight className="w-6 h-6 sm:hidden" />
      </div>
    </Link>
  );
}
