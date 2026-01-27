"use client";

import { TMapCategoryEventWithEventInfo, TMapCityEventWithEventInfo, TMapCountryEventWithEventInfo, TMapFolderEventWithEventInfo, TMapGroupEventWithEventInfo, TMapPlaceEventWithEventInfo, TMapStagEventWithEventInfo, TMapTagEventWithEventInfo } from "dplus_common_v1";
import Link from "next/link";
import DdayCardBoxType from "./DdayCardBoxType";

type EventType = TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo | TMapCategoryEventWithEventInfo | TMapCountryEventWithEventInfo | TMapPlaceEventWithEventInfo;

export default function DdayCardBoxTypeForDetailPage({
  event,
  fullLocale,
  langCode,
}: { 
  event: EventType; 
  fullLocale: string;
  langCode: string;
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
    <DdayCardBoxType
      eventCode={code}
      date={event?.event_info?.date ?? null}
      time={event?.event_info?.time}
      endDate={event?.event_info?.end_date ?? null}
      endTime={event?.event_info?.end_time}
      startAtUtc={event?.event_info?.start_at_utc ?? null}
      endAtUtc={event?.event_info?.end_at_utc ?? null}
      title={event?.event_info?.title ?? ""}
      bgColor={event?.event_info?.bg_color ?? undefined}
      fgColor={event?.event_info?.fg_color ?? undefined}
      thumbnailUrl={thumbnailUrl ?? null}
      fullLocale={fullLocale}
      langCode={langCode}
      placeId={event?.event_info?.place_id?.toString() ?? undefined}
      placeName={event?.event_info?.place_name ?? undefined}
      tags={tags}
    />
  );
}

function getThumbnailUrl(event: EventType) {
  return event?.event_info?.thumbnail_square || event?.event_info?.thumbnail_vertical || event?.event_info?.thumbnail_horizontal;
}