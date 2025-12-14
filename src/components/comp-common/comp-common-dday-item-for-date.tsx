import { TEventCardForDateDetail } from "dplus_common_v1";
import CompCommonDdayItemBase from "./comp-common-dday-item-base";

export default function CompCommonDdayItemForDate({
  event,
  fullLocale,
}: { event: TEventCardForDateDetail; fullLocale: string }) {
  const code = event?.event_code ?? "default";
  const thumbnailUrl = event?.thumbnail_square || event?.thumbnail_vertical || event?.thumbnail_horizontal;

  return (
    <CompCommonDdayItemBase
      eventCode={code}
      date={event?.date ?? null}
      time={event?.time}
      title={event?.title ?? ""}
      bgColor={event?.bg_color ?? undefined}
      fgColor={event?.fg_color ?? undefined}
      thumbnailUrl={thumbnailUrl || null}
      fullLocale={fullLocale}
      useClientWrapper={false}
    />
  );
}