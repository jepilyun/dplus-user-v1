"use client";

import { reqGetDateDetail } from "@/actions/action";
import { TEventCardForDateDetail } from "dplus_common_v1";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CompLoadMore } from "../comp-common/comp-load-more";
import DateNavigation from "./comp-date-navigation"; // 새로운 컴포넌트 import
import CompCommonDdayItemForDate from "../comp-common/comp-common-dday-item-for-date";

/**
 * Date 상세 페이지
 * @param param0 - 날짜, 언어 코드, 전체 로케일
 * @returns 이벤트 상세 페이지
 */
export default function CompDateDetailPage({ 
  dateString, 
  countryCode,
  langCode, 
  fullLocale 
}: { 
  dateString: string;
  countryCode: string;
  langCode: string;
  fullLocale: string;
}) {
  const router = useRouter();

  const [events, setEvents] = useState<TEventCardForDateDetail[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [seenEventCodes] = useState<Set<string>>(new Set());

  const EVENTS_LIMIT = 10;

  const fetchDateDetail = async () => {
    try {
      const res = await reqGetDateDetail(countryCode, dateString, 0, EVENTS_LIMIT);

      const initItems = res?.dbResponse?.items ?? [];
      setEvents(initItems);
      setEventsStart(initItems.length);
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));

      for (const it of initItems) {
        const code = it?.event_code;
        if (code) seenEventCodes.add(code);
      }
    } catch (e) {
      // router.replace(`/error/content-not-found?type=date&lang=${encodeURIComponent(langCode)}`);
    }
  };

  const loadMoreEvents = async () => {
    if (eventsLoading) return;
    setEventsLoading(true);

    try {
      const res = await reqGetDateDetail(countryCode, dateString, eventsStart, EVENTS_LIMIT);
      const events = res?.dbResponse?.items ?? [];
      const newItems = events.filter((it: TEventCardForDateDetail) => {
        const code = it?.event_code;
        if (!code || seenEventCodes.has(code)) return false;
        seenEventCodes.add(code);
        return true;
      });

      setEvents(prev => prev.concat(newItems));
      setEventsStart(eventsStart + (newItems.length || 0));
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchDateDetail();
  }, [dateString]);

  return (
    <div className="flex flex-col gap-8">
      {/* 날짜 네비게이션 컴포넌트 추가 */}
      <DateNavigation currentDate={dateString} langCode={langCode} />

      {/* 이벤트 목록 */}
      {events?.length ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {events.map(item => (
            <CompCommonDdayItemForDate
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