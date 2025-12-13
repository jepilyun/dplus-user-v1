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
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {/* Google Calendar */}
      <button
        onClick={() => handleCalendarSave("google")}
        className="group relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-200/40 to-gray-300/60 rounded-2xl sm:rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-70"></div>
        <div className="relative flex items-center justify-center px-2 py-4 bg-gradient-to-b from-white/90 via-gray-50/90 to-gray-100/90 text-gray-900 rounded-2xl sm:rounded-full backdrop-blur-2xl transition-all duration-500 border border-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_3px_6px_-1px_rgba(0,0,0,0.15)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_6px_8px_-3px_rgba(0,0,0,0.2)] active:translate-y-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-2xl sm:rounded-full pointer-events-none"></div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2 w-full min-w-0">
            <IconGoogle className="w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110 filter" />
            <span className="text-xs sm:text-sm font-semibold relative z-10 filter truncate w-full text-center sm:w-auto">
              {getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.google_calendar}
            </span>
          </div>
        </div>
      </button>

      {/* Apple Calendar / ICS Download */}
      <button
        onClick={() => handleCalendarSave(deviceType === "ios" ? "apple" : "ics")}
        className="group relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-200/40 to-gray-300/60 rounded-2xl sm:rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-70"></div>
        <div className="relative flex items-center justify-center px-2 py-4 bg-gradient-to-b from-white/90 via-gray-50/90 to-gray-100/90 text-gray-900 rounded-2xl sm:rounded-full backdrop-blur-2xl transition-all duration-500 border border-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_3px_6px_-1px_rgba(0,0,0,0.15)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_6px_8px_-3px_rgba(0,0,0,0.2)] active:translate-y-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-2xl sm:rounded-full pointer-events-none"></div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2 w-full min-w-0">
            {deviceType === "ios" ? (
              <IconApple className="w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110 filter" />
            ) : (
              <CalendarDays className="w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110 filter" />
            )}
            <span className="text-xs sm:text-sm font-semibold relative z-10 filter truncate w-full text-center sm:w-auto">
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
        className="group relative"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-gray-200/40 to-gray-300/60 rounded-2xl sm:rounded-full blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-70"></div>
        <div className="relative flex items-center justify-center px-2 py-4 bg-gradient-to-b from-white/90 via-gray-50/90 to-gray-100/90 text-gray-900 rounded-2xl sm:rounded-full backdrop-blur-2xl transition-all duration-500 border border-white/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_3px_6px_-1px_rgba(0,0,0,0.15)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_6px_8px_-3px_rgba(0,0,0,0.2)] active:translate-y-0">
          <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/20 to-transparent rounded-2xl sm:rounded-full pointer-events-none"></div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-2 w-full min-w-0">
            <Share2 className="w-5 h-5 flex-shrink-0 relative z-10 transition-transform duration-300 group-hover:scale-110 filter" />
            <span className="text-xs sm:text-sm font-semibold relative z-10 filter truncate w-full text-center sm:w-auto">
              {getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.share}
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};