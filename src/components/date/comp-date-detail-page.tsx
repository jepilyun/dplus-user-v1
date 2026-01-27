"use client";

import { clientReqGetDateList } from "@/api/date/clientReqDate";
import { DplusGetListDataResponse, LIST_LIMIT, TEventCardForDateDetail } from "dplus_common_v1";
import { useRef, useState } from "react";
import { CompLoadMore } from "../button/comp-load-more";
import DateNavigation from "./comp-date-navigation";
import CompCommonDdayItemForDate from "../dday-card/comp-common-dday-item-for-date";
import { getSessionDataVersion } from "@/utils/get-session-data-version";
import CompCommonDdayCardForDate from "../dday-card/comp-common-dday-card-for-date";
import { CompLoading } from "../common/comp-loading";
import { CompNotFound } from "../common/comp-not-found";
import { CompNetworkError } from "../common/comp-network-error";

export default function CompDateDetailPage({
  dateString,
  countryCode,
  langCode,
  fullLocale,
  initialData,
}: {
  dateString: string;
  countryCode: string;
  langCode: string;
  fullLocale: string;
  initialData: DplusGetListDataResponse<TEventCardForDateDetail> | null;
}) {
  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(!initialData);

  // ✅ 데이터 버전: 2시간 블록
  const [dataVersion, setDataVersion] = useState<string>(getSessionDataVersion);

  const [events, setEvents] = useState<TEventCardForDateDetail[]>(
    initialData?.items ?? []
  );
  const [eventsStart, setEventsStart] = useState(
    initialData?.items?.length ?? 0
  );
  const [eventsHasMore, setEventsHasMore] = useState(
    Boolean(initialData?.hasMore)
  );
  const [eventsLoading, setEventsLoading] = useState(false);

  const seenEventCodesRef = useRef<Set<string>>(
    new Set(
      initialData?.items?.map(item => item?.event_code).filter(Boolean) ?? []
    )
  );

  /**
   * ✅ 서버 데이터와 복원 데이터를 병합하는 함수
   */
  const fetchAndMergeData = async (restoredEvents?: TEventCardForDateDetail[]) => {
    if (initialData && !restoredEvents) {
      setLoading(false);
      return;
    }

    try {
      const res = await clientReqGetDateList(countryCode, dateString, 0, LIST_LIMIT.default);
  
      if (!res?.dbResponse || !res?.dbResponse?.items) {
        setError("not-found");
        setLoading(false);
        return;
      }
  
      const serverEvents = res?.dbResponse?.items ?? [];
      
      // ✅ 새 데이터 버전 업데이트
      const newVersion = getSessionDataVersion();
      setDataVersion(newVersion);
      
      console.log('[Date Merge] 📊 Data versions:', {
        new: newVersion,
        old: dataVersion,
        changed: newVersion !== dataVersion
      });
      
      // ✅ 복원된 데이터가 있고 더보기를 했던 경우 (36개 초과)
      if (restoredEvents && restoredEvents.length > LIST_LIMIT.default) {
        console.log('[Date Merge] 🔄 서버 데이터와 복원 데이터 병합 시작');
        console.log('[Date Merge] Server events:', serverEvents.length);
        console.log('[Date Merge] Restored total:', restoredEvents.length);
        
        const serverCodes = new Set(
          serverEvents.map(item => item?.event_code).filter(Boolean)
        );
        
        const additionalEvents = restoredEvents
          .slice(LIST_LIMIT.default)
          .filter(item => {
            const code = item?.event_code;
            return code && !serverCodes.has(code);
          });
        
        console.log('[Date Merge] Additional events from restore:', additionalEvents.length);
        
        // ✅ 날짜 필터링 (특정 날짜의 이벤트만)
        const targetDate = new Date(dateString);
        targetDate.setHours(0, 0, 0, 0);
        const targetTimestamp = targetDate.getTime();
        
        const validEvents = additionalEvents.filter(item => {
          const eventDate = item.date;
          
          if (eventDate) {
            const date = new Date(eventDate);
            date.setHours(0, 0, 0, 0);
            return date.getTime() === targetTimestamp;
          }
          return true;
        });
        
        console.log('[Date Merge] Valid events after filter:', validEvents.length);
        
        const finalEvents = [...serverEvents, ...validEvents];
        
        console.log('[Date Merge] ✅ Final merged:', {
          server: serverEvents.length,
          additional: validEvents.length,
          total: finalEvents.length
        });
        
        setEvents(finalEvents);
        setEventsStart(finalEvents.length);
        
        seenEventCodesRef.current.clear();
        finalEvents.forEach(item => {
          const code = item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      } else {
        console.log('[Date Merge] ✅ Using server data only');
        setEvents(serverEvents);
        setEventsStart(serverEvents.length);
        
        seenEventCodesRef.current.clear();
        serverEvents.forEach(item => {
          const code = item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      }
      
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));
      setError(null);
    } catch (e) {
      console.error("Failed to fetch date detail:", e);
      setError("network");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreEvents = async () => {
    if (eventsLoading || !eventsHasMore) return;
    setEventsLoading(true);

    try {
      const res = await clientReqGetDateList(countryCode, dateString, eventsStart, LIST_LIMIT.default);
      const fetchedItems = res?.dbResponse?.items ?? [];
      
      const newItems = fetchedItems.filter((it: TEventCardForDateDetail) => {
        const code = it?.event_code;
        if (!code || seenEventCodesRef.current.has(code)) return false;
        seenEventCodesRef.current.add(code);
        return true;
      });

      setEvents(prev => [...prev, ...newItems]);
      setEventsStart(prev => prev + newItems.length);
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));
    } finally {
      setEventsLoading(false);
    }
  };

  // ================= 렌더 =================

  if (loading) {
    return (
      <CompLoading message="Loading..." />
    );
  }

  if (error === "not-found") {
    return (
      <CompNotFound
        title="Date Not Found"
        message="해당 날짜의 이벤트를 찾을 수 없습니다."
        returnPath={`/${langCode}`}
        returnLabel="홈 화면으로 이동"
      />
    );
  }

  if (error === "network") {
    return (
      <CompNetworkError
        title="ERROR"
        message="Failed to load date details. Please try again."
        onRetry={() => fetchAndMergeData()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <DateNavigation currentDate={dateString} langCode={langCode} />

      {events?.length ? (
        <>
        {/* 모바일: CompCommonDdayItem */}
          <div className="sm:hidden mx-auto w-full max-w-[1024px] grid grid-cols-1 gap-4">
            {events.map((item) => (
              <CompCommonDdayCardForDate 
                key={item.event_code} 
                event={item} 
                fullLocale={fullLocale} 
                langCode={langCode}
              />
            ))}
            {eventsHasMore && <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} locale={langCode} />}
          </div>

          {/* 데스크톱: CompCommonDdayItemCard */}
          <div className="hidden sm:block mx-auto w-full max-w-[1024px] px-4 lg:px-6">
            <div className="flex flex-col gap-4">
              {events.map((item) => (
                <CompCommonDdayItemForDate key={item.event_code} event={item} fullLocale={fullLocale} langCode={langCode} />
              ))}
            </div>
            {eventsHasMore && <div className="mt-4"><CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} locale={langCode} /></div>}
          </div>
        </>
      ) : (
        <div className="mx-auto w-full max-w-[1024px] px-2 sm:px-4 lg:px-6 text-center py-12 text-gray-500">
          No events found for this date.
        </div>
      )}
    </div>
  );
}