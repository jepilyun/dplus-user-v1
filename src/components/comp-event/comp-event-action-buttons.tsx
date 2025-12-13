import { getDplusI18n } from "@/utils/get-dplus-i18n"
import { IconApple } from "@/icons/icon-apple"
import { IconGoogle } from "@/icons/icon-google"
import { SUPPORT_LANG_CODES } from "dplus_common_v1"
import { CalendarDays, Share2 } from "lucide-react"
import { DeviceType } from "@/utils/device-detector"

export const CompEventActionButtons = ({
  langCode,
  deviceType,
  handleCalendarSave,
  handleShareClick,
}: {
  langCode: string;
  deviceType: DeviceType;
  handleCalendarSave: (type: "google" | "apple" | "ics") => void;
  handleShareClick: () => void;
}) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Google Calendar */}
      <button
        onClick={() => handleCalendarSave("google")}
        className="w-full group cursor-pointer"
      >
        <div className="flex items-center justify-center gap-2 py-4 border border-gray-400 rounded-2xl sm:rounded-full hover:bg-gray-100 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 group-hover:scale-110 transition-all duration-300">
            <IconGoogle className="w-5 h-5" />
            <span className="text-sm font-bold">
              {getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.google_calendar}
            </span>
          </div>
        </div>
      </button>

      {/* Apple Calendar / ICS Download */}
      <button
        onClick={() => handleCalendarSave(deviceType === "ios" ? "apple" : "ics")}
        className="w-full group cursor-pointer"
      >
        <div className="flex items-center justify-center gap-2 py-4 border border-gray-400 rounded-2xl sm:rounded-full hover:bg-gray-100 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 group-hover:scale-110 transition-all duration-300">
            {deviceType === "ios" ? (
              <IconApple className="w-5 h-5 fill-white" />
            ) : (
              <CalendarDays className="w-5 h-5" />
            )}
            <span className="text-sm font-bold">
              {deviceType === "ios"
                ? getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.apple_calendar
                : getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.ics_download}
            </span>
          </div>
        </div>
      </button>

      {/* Share */}
      <button
        onClick={handleShareClick}
        className="w-full group cursor-pointer"
      >
        <div className="flex items-center justify-center gap-2 py-4 border border-gray-400 rounded-2xl sm:rounded-full hover:bg-gray-100 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 group-hover:scale-110 transition-all duration-300">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-bold">
              {getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.share}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};