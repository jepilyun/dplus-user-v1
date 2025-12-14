"use client";

import { reqGetDateList } from "@/actions/action";
import { DplusGetListDataResponse, LIST_LIMIT, TEventCardForDateDetail } from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CompLoadMore } from "../comp-common/comp-load-more";
import DateNavigation from "./comp-date-navigation";
import CompCommonDdayItemForDate from "../comp-common/comp-common-dday-item-for-date";
import { useDatePageRestoration } from "@/contexts/scroll-restoration-context";
import { getSessionDataVersion } from "@/utils/get-session-data-version";
import CompCommonDdayCardForDate from "../comp-common/comp-common-dday-card-for-date";

type DatePageState = {
  events: TEventCardForDateDetail[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

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
  const router = useRouter();
  const { save, restore } = useDatePageRestoration(dateString, countryCode);

  const restorationAttemptedRef = useRef(false);

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
      const res = await reqGetDateList(countryCode, dateString, 0, LIST_LIMIT.default);
  
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
      const res = await reqGetDateList(countryCode, dateString, eventsStart, LIST_LIMIT.default);
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

  // ✅ 초기 마운트 시 복원 시도
  useEffect(() => {
    if (restorationAttemptedRef.current) return;
    restorationAttemptedRef.current = true;

    console.log('[Date Mount] 🚀 Component mounted, attempting restore...');
    console.log('[Date Mount] Current data version:', dataVersion);
    
    const saved = restore<DatePageState>(dataVersion);
    
    console.log('[Date Mount] Restored data:', {
      hasSaved: !!saved,
      eventsCount: saved?.events?.length || 0,
    });
    
    if (saved && saved.events && saved.events.length > 0) {
      console.log('[Date Mount] ✅ Restoring state with', saved.events.length, 'events');
      
      setEvents(saved.events);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
      
      // ✅ 더보기를 했던 경우에만 백그라운드 병합
      if (saved.events.length > LIST_LIMIT.default) {
        console.log('[Date Mount] 📡 Fetching server data for merge...');
        fetchAndMergeData(saved.events);
      }
    } else {
      console.log('[Date Mount] ⚠️ No valid saved data found');
      if (!initialData) {
        fetchAndMergeData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, dateString]);

  // ✅ 클릭 이벤트 감지하여 저장
  useEffect(() => {
    const saveCurrentState = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY === 0) {
        console.log('[Date Save] ⚠️ 스크롤이 0이므로 저장 건너뜀');
        return;
      }
      
      console.log('[Date Save] 💾 현재 상태 저장:', {
        scrollY: currentScrollY,
        eventsCount: events.length,
        dataVersion,
      });

      const state: DatePageState = {
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      };

      save<DatePageState>(state, dataVersion);
    };

    // ✅ 모든 네비게이션 요소 클릭 감지
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const eventCard = target.closest('[data-event-code]');
      const link = target.closest('a');
      const button = target.closest('button, [role="button"]');
      
      if (eventCard || link || button) {
        if (link) {
          const href = link.getAttribute('href') || '';
          if (link.getAttribute('target') === '_blank' || href.startsWith('mailto:')) {
            return;
          }
        }
        
        console.log('[Date Click] 🎯 네비게이션 요소 클릭 감지, 저장 실행');
        saveCurrentState();
      }
    };

    document.addEventListener("click", handleClick, true);
    
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [events, eventsStart, eventsHasMore, dataVersion, save]);

  // ✅ 새로고침/탭 숨김 시 저장
  useEffect(() => {
    const persist = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY === 0) return;
      
      save<DatePageState>({
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      }, dataVersion);
    };

    window.addEventListener("beforeunload", persist);
    
    const onVisibility = () => {
      if (document.visibilityState === "hidden") persist();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("beforeunload", persist);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [events, eventsStart, eventsHasMore, dataVersion, save]);

  // ================= 렌더 =================

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div>Loading...</div>
      </div>
    );
  }

  if (error === "not-found") {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Date Not Found</h2>
          <p className="text-gray-600 mb-6">해당 날짜의 이벤트를 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push(`/${langCode}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            홈 화면으로 이동
          </button>
        </div>
      </div>
    );
  }

  if (error === "network") {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">ERROR</h2>
          <p className="text-gray-600 mb-6">Failed to load date details. Please try again.</p>
          <button
            onClick={() => fetchAndMergeData()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col gap-8">
      <DateNavigation currentDate={dateString} langCode={langCode} />

      {events?.length ? (
        <>
        {/* 모바일: CompCommonDdayItem */}
          <div className="sm:hidden mx-auto w-full max-w-[1024px] grid grid-cols-1 gap-4">
            {events.map((item) => (
              <CompCommonDdayCardForDate key={item.event_code} event={item} fullLocale={fullLocale} />
            ))}
            {eventsHasMore && <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} locale={langCode} />}
          </div>

          {/* 데스크톱: CompCommonDdayItemCard */}
          <div className="hidden sm:block mx-auto w-full max-w-[1024px] px-4 lg:px-6">
            <div className="flex flex-col gap-4">
              {events.map((item) => (
                <CompCommonDdayItemForDate key={item.event_code} event={item} fullLocale={fullLocale} />
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