import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date-utils";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { Clock10 } from "lucide-react";
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
      <div className="px-4 py-8 flex flex-col gap-6 justify-center items-center font-medium text-xl text-gray-900 bg-gray-100 rounded-2xl hover:text-white hover:bg-gray-900 transition-all duration-300">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Clock10 className="w-6 h-6" />
          <div className="text-center">
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
        </div>
      </div>
    </Link>
  );
}
