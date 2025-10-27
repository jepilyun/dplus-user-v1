import { generateDdayDatetime } from "@/utils/dday-utils";
import { getDplusI18n } from "@/utils/get-dplus-i18n";


export default function CompCommonDatetime({ datetime, fullLocale, time, isRepeatAnnually }: { datetime: Date | null | undefined, fullLocale: string, time: string | null | undefined, isRepeatAnnually: boolean }) {
  if (!datetime) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
      {isRepeatAnnually && (
        <div className="text-center font-extrabold text-sm text-white bg-gray-900 px-2 py-1 rounded-md">
          {getDplusI18n(fullLocale).repeat_annually}
        </div>
      )}
      <div className="text-center font-poppins font-medium text-gray-700 text-xl sm:text-2xl md:text-3xl">
        {generateDdayDatetime(datetime, fullLocale, time ?? null, {
          style: "long",
          timeFormat: "12h",   // ★ "4PM" 스타일
          compactTime: true,   // ★ ":00"이면 분 생략 + 공백 제거
          // tz: "Asia/Seoul",
        })}
      </div>
    </div>
  );
}