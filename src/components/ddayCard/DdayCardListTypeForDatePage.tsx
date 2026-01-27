import { TEventCardForDateDetail } from "dplus_common_v1";
import DdayCardListType from "./DdayCardListType";

export default function DdayCardListTypeForDatePage({
  event,
  fullLocale,
  langCode,
}: { event: TEventCardForDateDetail; fullLocale: string; langCode: string }) {
  const code = event?.event_code ?? "default";
  const thumbnailUrl = event?.thumbnail_square || event?.thumbnail_vertical || event?.thumbnail_horizontal;

  return (
    <DdayCardListType
      eventCode={code}
      date={event?.date ?? null}
      time={event?.time}
      endDate={event?.end_date ?? null}
      endTime={event?.end_time}
      startAtUtc={event?.start_at_utc ?? null}
      endAtUtc={event?.end_at_utc ?? null}
      title={event?.title ?? ""}
      bgColor={event?.bg_color ?? undefined}
      fgColor={event?.fg_color ?? undefined}
      thumbnailUrl={thumbnailUrl || null}
      fullLocale={fullLocale}
      langCode={langCode}
      placeId={event?.place_id?.toString() ?? undefined}
      placeName={event?.place_name ?? undefined}
      useClientWrapper={false}
    />
  );
}