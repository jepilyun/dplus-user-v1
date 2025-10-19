"use client";

import { reqGetCategoryDetail, reqGetCategoryEvents } from "@/actions/action";
import { ResponseCategoryDetailForUserFront, TMapCategoryEventWithEventInfo } from "dplus_common_v1";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CompLoadMore } from "../comp-common/comp-load-more";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";

/**
 * Category 상세 페이지
 * @param param0 - Category Code, 언어 코드, 전체 로케일
 * @returns 이벤트 상세 페이지
 */
export default function CompCategoryDetailPage({ 
  categoryCode, 
  countryCode,
  langCode, 
  fullLocale 
}: { 
  categoryCode: string;
  countryCode: string;
  langCode: string;
  fullLocale: string;
}) {
  const router = useRouter();

  const [categoryDetail, setCategoryDetail] = useState<ResponseCategoryDetailForUserFront | null>(null);
  const [events, setEvents] = useState<TMapCategoryEventWithEventInfo[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [seenEventCodes] = useState<Set<string>>(new Set());

  const EVENTS_LIMIT = 10;

  const fetchCategoryDetail = async () => {
    try {
      const res = await reqGetCategoryDetail(countryCode, categoryCode, 0, EVENTS_LIMIT, langCode);

      const initItems = res?.dbResponse?.mapCategoryEvent?.items ?? [];
      setCategoryDetail(res?.dbResponse ?? null);
      setEvents(initItems);
      setEventsStart(initItems.length);
      setEventsHasMore(Boolean(res?.dbResponse?.mapCategoryEvent?.hasMore));

      for (const it of initItems) {
        const code = it?.event_code;
        if (code) seenEventCodes.add(code);
      }
    } catch (e) {
      router.replace(`/error/content-not-found?type=category&lang=${encodeURIComponent(langCode)}`);
    }
  };

  const loadMoreEvents = async () => {
    if (eventsLoading) return;
    setEventsLoading(true);

    try {
      const res = await reqGetCategoryEvents(countryCode, categoryCode, eventsStart, EVENTS_LIMIT);
      const events = res?.dbResponse?.mapCategoryEvent?.items ?? [];
      const newItems = events.filter((it: TMapCategoryEventWithEventInfo) => {
        const code = it?.event_code;
        if (!code || seenEventCodes.has(code)) return false;
        seenEventCodes.add(code);
        return true;
      });

      setEvents(prev => prev.concat(newItems));
      setEventsStart(eventsStart + (newItems.length || 0));
      setEventsHasMore(Boolean(res?.dbResponse?.mapCategoryEvent?.hasMore));
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryDetail();
  }, [categoryCode, countryCode]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        {categoryDetail?.i18n?.name ? (
          <div className="text-center font-extrabold">
            <div className="text-3xl">{categoryDetail?.i18n?.name}</div>
            <div className="text-lg">{categoryDetail?.category?.name}</div>
          </div>
        ): (
          <div className="text-center font-extrabold">
            <div className="text-3xl">{categoryDetail?.category?.name}</div>
          </div>
        )}
      </div>

      {/* 이벤트 목록 */}
      {events?.length ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {events.map(item => (
            <CompCommonDdayItem
              key={item.event_code} 
              event={item} 
              fullLocale={fullLocale} 
            />
          ))}

          {eventsHasMore && (
            <CompLoadMore 
              onLoadMore={loadMoreEvents} 
              loading={eventsLoading} 
            />
          )}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1024px] px-2 sm:px-4 lg:px-6 text-center py-12 text-gray-500">
          No events found for this date.
        </div>
      )}
    </div>
  );
}