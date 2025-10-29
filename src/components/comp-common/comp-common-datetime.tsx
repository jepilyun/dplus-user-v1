
import { formatDateTime } from "@/utils/date-utils";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import Link from "next/link";


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
    </div>
  );
}