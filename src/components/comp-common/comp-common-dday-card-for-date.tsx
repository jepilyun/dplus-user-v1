"use client";

import { TEventCardForDateDetail } from "dplus_common_v1";
import CompCommonDdayCardBase from "./comp-common-dday-card-base";

export default function CompCommonDdayCardForDate({
  event,
  fullLocale,
}: { 
  event: TEventCardForDateDetail; 
  fullLocale: string;
}) {
  const code = event?.event_code ?? "default";
  const thumbnailUrl = getThumbnailUrl(event);

  return (
    <CompCommonDdayCardBase
      eventCode={code}
      date={event?.date ?? null}
      time={event?.time}
      title={event?.title ?? ""}
      bgColor={event?.bg_color ?? undefined}
      fgColor={event?.fg_color ?? undefined}
      thumbnailUrl={thumbnailUrl ?? null}
      fullLocale={fullLocale}
      // tags prop 생략 (태그 없음)
    />
  );
}

function getThumbnailUrl(event: TEventCardForDateDetail) {
  return event?.thumbnail_square || event?.thumbnail_vertical || event?.thumbnail_horizontal;
}