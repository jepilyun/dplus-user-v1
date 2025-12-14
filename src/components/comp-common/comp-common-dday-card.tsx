"use client";

import { TMapCategoryEventWithEventInfo, TMapCityEventWithEventInfo, TMapCountryEventWithEventInfo, TMapFolderEventWithEventInfo, TMapGroupEventWithEventInfo, TMapStagEventWithEventInfo, TMapTagEventWithEventInfo } from "dplus_common_v1";
import Link from "next/link";
import CompCommonDdayCardBase from "./comp-common-dday-card-base";

type EventType = TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo | TMapCategoryEventWithEventInfo | TMapCountryEventWithEventInfo;

export default function CompCommonDdayCard({
  event,
  fullLocale,
}: { 
  event: EventType; 
  fullLocale: string;
}) {
  const code = event?.event_info?.event_code ?? event?.event_code ?? "default";
  const thumbnailUrl = getThumbnailUrl(event);
  const hasImage = !!thumbnailUrl;

  const tags = (
    <>
      {event?.event_info?.city && (
        <Link 
          href={`/city/${event.event_info.city.city_code}`}
          data-tag-link
          className="text-sm px-3 py-1.5 rounded-full backdrop-blur-sm transition-opacity hover:opacity-80 truncate max-w-[140px]"
          style={{ 
            backgroundColor: hasImage ? '#FFFFFF' : '#22222210', 
            color: '#222222' 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {event.event_info.city.name_native}
        </Link>
      )}
      {event?.event_info?.categories?.slice(0, 2).map((category) => (
        <Link
          key={category.category_code}
          href={`/category/${category.category_code}`}
          data-tag-link
          className="text-sm px-3 py-1.5 rounded-full backdrop-blur-sm transition-opacity hover:opacity-80 truncate max-w-[140px]"
          style={{ 
            backgroundColor: hasImage ? '#FFFFFF' : '#22222210', 
            color: '#222222' 
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {category.name_display}
        </Link>
      ))}
    </>
  );

  return (
    <CompCommonDdayCardBase
      eventCode={code}
      date={event?.event_info?.date ?? null}
      time={event?.event_info?.time}
      title={event?.event_info?.title ?? ""}
      bgColor={event?.event_info?.bg_color ?? undefined}
      fgColor={event?.event_info?.fg_color ?? undefined}
      thumbnailUrl={thumbnailUrl ?? null}
      fullLocale={fullLocale}
      tags={tags}
    />
  );
}

function getThumbnailUrl(event: EventType) {
  return event?.event_info?.thumbnail_square || event?.event_info?.thumbnail_vertical || event?.event_info?.thumbnail_horizontal;
}