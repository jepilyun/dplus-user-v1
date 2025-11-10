"use client";

import { reqGetDateList } from "@/actions/action";
import { DplusGetListDataResponse, LIST_LIMIT, TEventCardForDateDetail } from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CompLoadMore } from "../comp-common/comp-load-more";
import DateNavigation from "./comp-date-navigation";
import CompCommonDdayItemForDate from "../comp-common/comp-common-dday-item-for-date";
import { useDatePageRestoration } from "@/contexts/scroll-restoration-context"; // ✅ 변경

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

  // ✅ 변경: 전용 hook 사용
  const { save, restore } = useDatePageRestoration(dateString, countryCode);

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(!initialData); // ✅ 초기 데이터 있으면 false

  const [events, setEvents] = useState<TEventCardForDateDetail[]>(
    initialData?.items ?? [] // ✅ 초기 이벤트 설정
  );
  const [eventsStart, setEventsStart] = useState(
    initialData?.items?.length ?? 0 // ✅ 초기 시작점 설정
  );
  const [eventsHasMore, setEventsHasMore] = useState(
    Boolean(initialData?.hasMore) // ✅ 초기 hasMore 설정
  );
  const [eventsLoading, setEventsLoading] = useState(false);

  const seenEventCodesRef = useRef<Set<string>>(
    new Set(
      initialData?.items?.map(item => item?.event_code).filter(Boolean) ?? []
    )
  );
  const hydratedFromRestoreRef = useRef(false);

  const fetchDateDetail = async (restoredEvents?: TEventCardForDateDetail[]) => {
    // ✅ 초기 데이터가 있고 복원 데이터도 없으면 fetch 생략
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
  
      const initItems = res?.dbResponse?.items ?? [];
      
      // ✅ 핵심 수정: 복원 여부와 관계없이 항상 서버 최신 36개를 기준으로
      if (restoredEvents && restoredEvents.length > LIST_LIMIT.default) {
        console.log('[Date Fetch] Merging server data with restored pagination');
        console.log('[Date Fetch] Server events:', initItems.length);
        console.log('[Date Fetch] Restored total:', restoredEvents.length);
        
        // 서버의 최신 36개 이벤트 코드
        const serverCodes = new Set(
          initItems.map(item => item?.event_code).filter(Boolean)
        );
        
        // ✅ 복원된 이벤트 중 37번째 이후만 추출 (더보기로 로드한 것들)
        const additionalEvents = restoredEvents
          .slice(LIST_LIMIT.default)
          .filter(item => {
            const code = item?.event_code;
            return code && !serverCodes.has(code);
          });
        
        console.log('[Date Fetch] Additional events from restore:', additionalEvents.length);
        
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
        
        console.log('[Date Fetch] Valid events after filter:', validEvents.length);
        
        // ✅ 서버 최신 36개 + 더보기로 로드한 이벤트들
        const finalEvents = [...initItems, ...validEvents];
        
        console.log('[Date Fetch] Final merged:', {
          server: initItems.length,
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
        // 더보기를 안 한 경우: 서버 데이터만 사용
        console.log('[Date Fetch] Using server data only');
        setEvents(initItems);
        setEventsStart(initItems.length);
        
        seenEventCodesRef.current.clear();
        initItems.forEach(item => {
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

      setEvents((prev) => prev.concat(newItems));
      setEventsStart((prev) => prev + newItems.length);
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    console.log('[Date Mount] Component mounted, attempting restore...');
    const saved = restore<DatePageState>();
    
    console.log('[Date Mount] Restored data:', {
      hasSaved: !!saved,
      eventsCount: saved?.events?.length || 0,
    });
    
    if (saved && saved.events && saved.events.length > 0) {
      console.log('[Date Mount] Restoring state with', saved.events.length, 'events');
      hydratedFromRestoreRef.current = true;
      
      // ✅ 복원 데이터로 먼저 화면 표시 (스크롤 위치 복원을 위해)
      setEvents(saved.events);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
      
      // ✅ 백그라운드에서 서버 데이터 가져와서 업데이트
      fetchDateDetail(saved.events);
    } else {
      console.log('[Date Mount] No valid saved data found');
      // ✅ 초기 데이터가 있으면 fetch 생략
      if (!initialData) {
        fetchDateDetail();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, dateString]);

  // 라우팅 직전 저장
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) return;

      console.log('[Date Save] Saving state:', {
        eventsCount: events.length,
        eventsStart,
        eventsHasMore,
      });

      save<DatePageState>({
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      });
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [events, eventsStart, eventsHasMore, save]);

  // 새로고침/탭 숨김 시 저장
  useEffect(() => {
    const persist = () =>
      save<DatePageState>({
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      });

    window.addEventListener("beforeunload", persist);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") persist();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("beforeunload", persist);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [events, eventsStart, eventsHasMore, save]);

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
            onClick={() => fetchDateDetail()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <DateNavigation currentDate={dateString} langCode={langCode} />

      {events?.length ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {events.map((item) => (
            <CompCommonDdayItemForDate key={item.event_code} event={item} fullLocale={fullLocale} />
          ))}
          {eventsHasMore && <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} />}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1024px] px-2 sm:px-4 lg:px-6 text-center py-12 text-gray-500">
          No events found for this date.
        </div>
      )}
    </div>
  );
}