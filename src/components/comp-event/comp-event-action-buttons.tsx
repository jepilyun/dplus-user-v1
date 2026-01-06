// comp-event-action-buttons.tsx
import { getDplusI18n } from "@/utils/get-dplus-i18n"
import { IconApple } from "@/icons/icon-apple"
import { IconGoogle } from "@/icons/icon-google"
import { SUPPORT_LANG_CODES } from "dplus_common_v1"
import { CalendarDays, Share2 } from "lucide-react"
import { DeviceType } from "@/utils/device-detector"
import { CompActionButton } from "@/components/comp-button/comp-action-button"

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
  const i18n = getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail;

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {/* Google Calendar */}
      <CompActionButton
        icon={<IconGoogle className="w-5 h-5" />}
        label={i18n.google_calendar}
        onClick={() => handleCalendarSave("google")}
      />

      {/* Apple Calendar / ICS Download */}
      <CompActionButton
        icon={
          deviceType === "ios" ? (
            <IconApple className="w-5 h-5" />
          ) : (
            <CalendarDays className="w-5 h-5" />
          )
        }
        label={deviceType === "ios" ? i18n.apple_calendar : i18n.ics_download}
        onClick={() => handleCalendarSave(deviceType === "ios" ? "apple" : "ics")}
      />

      {/* Share */}
      <CompActionButton
        icon={<Share2 className="w-5 h-5" />}
        label={i18n.share}
        onClick={handleShareClick}
      />
    </div>
  );
};