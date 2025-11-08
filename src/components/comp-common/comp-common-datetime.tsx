import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date-utils";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import Link from "next/link";


/**
 * 이벤트 상세화면에서 날짜와 시간을 표시하는 컴포넌트
 * @param datetime - 날짜
 * @param fullLocale - 전체 로케일
 * @param time - 시간
 * @param isRepeatAnnually - 반복 여부
 */
export default function CompCommonDatetime({ 
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
    <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
      {isRepeatAnnually && (
        <div className="text-center font-extrabold text-sm text-white bg-gray-900 px-2 py-1 rounded-md">
          {getDplusI18n(fullLocale).repeat_annually}
        </div>
      )}
      
      {/* 날짜와 시간을 한 줄로 */}
      <Link href={`/date/${datetime}`}>
        <div className="flex flex-wrap items-center justify-center gap-4 font-medium text-md sm:text-xl md:text-2xl lg:text-3xl rounded-full p-2 px-4 sm:p-3 sm:px-6 md:p-4 md:px-8 hover:text-black hover:bg-gray-100">
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
      </Link>
    </div>
  );
}