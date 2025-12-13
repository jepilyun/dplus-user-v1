import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date-utils";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { ArrowRight } from "lucide-react";
import Link from "next/link";


/**
 * 이벤트 상세화면에서 날짜와 시간을 표시하는 컴포넌트
 * @param datetime - 날짜
 * @param fullLocale - 전체 로케일
 * @param time - 시간
 * @param isRepeatAnnually - 반복 여부
 */
export function CompEventDatetime({ 
  datetime, 
  fullLocale, 
  time, 
  isRepeatAnnually 
}: { 
  datetime: Date | null | undefined, 
  fullLocale: string, 
  time: string | null | undefined, 
  isRepeatAnnually: boolean 
}) {
  if (!datetime) {
    return null;
  }

  // 시간 유효성 체크
  const hasValidTime = (timeStr: string | null | undefined): boolean => {
    return !!timeStr && timeStr.trim() !== '' && timeStr !== '00:00:00';
  };

  // 날짜와 시간 합치기
  const combinedDate = new Date(datetime);
  if (time) {
    parseAndSetTime(combinedDate, time);
  }

  return (
    <Link href={`/date/${datetime}`}>
      <div className="flex flex-wrap gap-1 justify-start items-center font-bold text-lg sm:text-2xl opacity-70 hover:opacity-100 transition-all duration-300">
        <div>
          {formatDateTime(
            new Date(datetime),
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
