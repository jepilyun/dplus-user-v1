"use client";

import { TMapCategoryEventWithEventInfo, TMapCityEventWithEventInfo, TMapCountryEventWithEventInfo, TMapFolderEventWithEventInfo, TMapGroupEventWithEventInfo, TMapPlaceEventWithEventInfo, TMapStagEventWithEventInfo, TMapTagEventWithEventInfo } from "dplus_common_v1";
import Link from "next/link";
import CompCommonDdayItemBase from "./comp-common-dday-item-base";

type EventType = TMapFolderEventWithEventInfo | TMapCityEventWithEventInfo | TMapStagEventWithEventInfo | TMapGroupEventWithEventInfo | TMapTagEventWithEventInfo | TMapCategoryEventWithEventInfo | TMapCountryEventWithEventInfo | TMapPlaceEventWithEventInfo;

export default function CompCommonDdayItem({
  event,
  fullLocale,
  langCode
}: { event: EventType, fullLocale: string, langCode: string}) {
  const code = event?.event_info?.event_code ?? event?.event_code ?? "default";
  
  const cityTag = event?.event_info?.city && (
    <Link 
      href={`/city/${event.event_info.city.city_code}`}
      data-tag-link
      className="text-xs md:text-sm bg-tag-city-for-list hover:opacity-80 transition-opacity"
    >
      {event.event_info.city.name_native}
    </Link>
  );

  const categoryTags = event?.event_info?.categories?.map((category) => (
    <Link
      key={category.category_code}
      href={`/category/${category.category_code}`}
      data-tag-link
      className="text-xs md:text-sm bg-tag-category-for-list hover:opacity-80 transition-opacity"
    >
      {category.name_display}
    </Link>
  ));

  const thumbnailUrl = event?.event_info?.thumbnail_square || event?.event_info?.thumbnail_vertical || event?.event_info?.thumbnail_horizontal;

  return (
    <CompCommonDdayItemBase
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
      thumbnailUrl={thumbnailUrl || null}
      fullLocale={fullLocale}
      langCode={langCode}
      placeId={event?.event_info?.place_id?.toString() ?? undefined}
      placeName={event?.event_info?.place_name ?? undefined}
      cityTag={cityTag}
      categoryTags={categoryTags}
      useClientWrapper={true}
    />
  );
}