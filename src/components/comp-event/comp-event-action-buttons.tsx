import { getDplusI18n } from "@/utils/get-dplus-i18n"
import { IconApple } from "@/icons/icon-apple"
import { SUPPORT_LANG_CODES } from "dplus_common_v1"
import { CalendarDays, Share2 } from "lucide-react"
import { DeviceType } from "@/utils/device-detector"
import { IconGoogle } from "@/icons/icon-google"

export const CompEventActionButtons = (
  { langCode, deviceType, handleCalendarSave, handleShareClick }: { langCode: string, deviceType: DeviceType, handleCalendarSave: (type: 'google' | 'apple' | 'ics') => void, handleShareClick: () => void }
) => {
  return (
    <div className="my-12 flex flex-col gap-4 sm:flex-row sm:flex-wrap items-center justify-center">
      <button onClick={() => handleCalendarSave('google')} className="cursor-pointer w-full sm:min-w-[160px] sm:max-w-[200px] group">
        <div className="flex items-center justify-center gap-3 border border-dplus-red text-white bg-dplus-red rounded-full py-4 hover:opacity-90 transition-all duration-300">
          <div className="flex items-center justify-center gap-2 group-hover:scale-110 transition-all duration-300">
            <IconGoogle className="w-5 h-5" />
            <span className="text-sm font-bold">{getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.google_calendar}</span>
          </div>
        </div>
      </button>
      
      {/* ✅ onClick 핸들러 추가! */}
      <button 
        onClick={() => handleCalendarSave(deviceType === 'ios' ? 'apple' : 'ics')} 
        className="cursor-pointer w-full sm:min-w-[160px] sm:max-w-[200px] group"
      >
        <div className="flex items-center justify-center gap-3 border border-gray-900 bg-gray-900 text-white rounded-full py-4 hover:opacity-90 transition-all duration-300">
          <div className="flex items-center justify-center gap-2 group-hover:scale-110 transition-all duration-300">
            {deviceType === 'ios' ? (
              <IconApple className="w-5 h-5 fill-white" />
            ) : (
              <CalendarDays className="w-5 h-5" />
            )}
            <span className="text-sm font-bold">
              {deviceType === 'ios' 
                ? getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.apple_calendar 
                : getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.ics_download}
            </span>
          </div>
        </div>
      </button>
      
      <button onClick={handleShareClick} className="cursor-pointer w-full sm:min-w-[160px] sm:max-w-[200px] group">
        <div className="flex items-center justify-center gap-3 border border-gray-900 rounded-full py-4 hover:bg-gray-100 transition-all duration-300">
          <div className="flex items-center justify-center gap-2 group-hover:scale-110 transition-all duration-300">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-bold">{getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.share}</span>
          </div>
        </div>
      </button>
    </div>
  )
}