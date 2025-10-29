import { formatDateTime, formatTimeOnly, parseAndSetTime } from "@/utils/date-utils";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import Link from "next/link";


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
      
      <div className="flex flex-col items-center gap-2">
        <Link href={`/date/${datetime}`}>
          <div className="p-2 px-4 rounded-md sm:p-3 sm:px-6 sm:rounded-lg md:p-4 md:px-8 md:rounded-xl hover:text-black hover:bg-gray-100 text-center font-noto-sans font-medium text-gray-500 text-md sm:text-xl md:text-2xl lg:text-3xl">
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
        </Link>

        {/* 시간 라벨 */}
        {hasValidTime(time) && (
          <div className="px-3 py-1.5 sm:px-4 sm:py-2 whitespace-nowrap rounded-xs font-bold text-white bg-gray-700 text-sm sm:text-base md:text-lg">
            {formatTimeOnly(combinedDate, "ko-KR", null, null, {
              timeFormat: "12h",
              compactTime: true
            })}
          </div>
        )}
      </div>
    </div>
  );
}