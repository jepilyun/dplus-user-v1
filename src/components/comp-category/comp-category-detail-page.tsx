"use client";

import { reqGetCategoryDetail, reqGetCategoryEvents } from "@/actions/action";
import {
  LIST_LIMIT,
  ResponseCategoryDetailForUserFront,
  TMapCategoryEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CompLoadMore } from "../comp-common/comp-load-more";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { useScrollRestoration } from "@/contexts/scroll-restoration-context";

type CategoryPageState = {
  events: TMapCategoryEventWithEventInfo[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

export default function CompCategoryDetailPage({
  categoryCode,
  countryCode,
  langCode,
  fullLocale,
}: {
  categoryCode: string;
  countryCode: string;
  langCode: string;
  fullLocale: string;
}) {
  const router = useRouter();

  const { savePage, restorePage } = useScrollRestoration();
  const STATE_KEY = `dplus:category-${countryCode}-${categoryCode}`;

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(true);

  const [categoryDetail, setCategoryDetail] = useState<ResponseCategoryDetailForUserFront | null>(null);
  const [events, setEvents] = useState<TMapCategoryEventWithEventInfo[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  const seenEventCodesRef = useRef<Set<string>>(new Set());
  const hydratedFromRestoreRef = useRef(false);

  // ✅ 수정: 복원된 이벤트를 매개변수로 받음
  const fetchCategoryDetail = async (restoredEvents?: TMapCategoryEventWithEventInfo[]) => {
    try {
      const res = await reqGetCategoryDetail(countryCode, categoryCode, langCode, 0, LIST_LIMIT.default);
  
      if (!res?.dbResponse || !res?.dbResponse?.category) {
        setError("not-found");
        setLoading(false);
        return;
      }
  
      setCategoryDetail(res.dbResponse);
      const initItems = res?.dbResponse?.mapCategoryEvent?.items ?? [];
      
      // ✅ 수정: restoredEvents 사용
      if (hydratedFromRestoreRef.current && restoredEvents) {
        console.log('[Category Fetch] Hydrated from restore, merging with server data');
        console.log('[Category Fetch] Restored events:', restoredEvents.length);
        console.log('[Category Fetch] Server events:', initItems.length);
        
        const serverCodes = new Set(
          initItems.map(item => item?.event_code).filter(Boolean)
        );
        
        if (restoredEvents.length > LIST_LIMIT.default) {
          // ✅ 복원된 전체 이벤트에서 서버에 없는 것만 추출
          const extraLoadedEvents = restoredEvents.filter(item => {
            const code = item?.event_code;
            return code && !serverCodes.has(code);
          });
          
          console.log('[Category Fetch] Extra loaded events (before date filter):', extraLoadedEvents.length);
          
          // ✅ 날짜 필터링 (과거 이벤트 제거)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayTimestamp = today.getTime();
          
          const futureExtraEvents = extraLoadedEvents.filter(item => {
            const eventDate = item?.event_info?.date || item?.date;
            
            if (eventDate) {
              const date = new Date(eventDate);
              return date.getTime() >= todayTimestamp;
            }
            return true; // 날짜 정보 없으면 일단 포함
          });
          
          console.log('[Category Fetch] Future extra events (after date filter):', futureExtraEvents.length);
          
          const finalEvents = [...initItems, ...futureExtraEvents];
          console.log('[Category Fetch] Final merged events:', finalEvents.length);
          
          setEvents(finalEvents);
          setEventsStart(finalEvents.length);
          
          seenEventCodesRef.current.clear();
          finalEvents.forEach(item => {
            const code = item?.event_code;
            if (code) seenEventCodesRef.current.add(code);
          });
        } else {
          // 더보기 안 한 경우: 서버 데이터만
          console.log('[Category Fetch] No extra events, using server data');
          setEvents(initItems);
          setEventsStart(initItems.length);
          
          seenEventCodesRef.current.clear();
          initItems.forEach(item => {
            const code = item?.event_code;
            if (code) seenEventCodesRef.current.add(code);
          });
        }
      } else {
        // 복원 없음: 서버 데이터만
        console.log('[Category Fetch] No restore, using server data');
        setEvents(initItems);
        setEventsStart(initItems.length);
        
        seenEventCodesRef.current.clear();
        initItems.forEach(item => {
          const code = item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      }
      
      setEventsHasMore(Boolean(res?.dbResponse?.mapCategoryEvent?.hasMore));
      setError(null);
    } catch (e) {
      console.error("Failed to fetch category detail:", e);
      setError("network");
    } finally {
      setLoading(false);
    }
  };
  
  const loadMoreEvents = async () => {
    if (eventsLoading || !eventsHasMore) return;
    setEventsLoading(true);

    try {
      const res = await reqGetCategoryEvents(countryCode, categoryCode, eventsStart, LIST_LIMIT.default);
      const fetchedItems = res?.dbResponse?.items ?? [];
      const newItems = fetchedItems.filter((it: TMapCategoryEventWithEventInfo) => {
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

  // ✅ 수정: 복원된 데이터를 fetchCategoryDetail에 전달
  useEffect(() => {
    console.log('[Category Mount] Component mounted, attempting restore...');
    const saved = restorePage<CategoryPageState>(STATE_KEY);
    
    console.log('[Category Mount] Restored data:', {
      hasSaved: !!saved,
      eventsCount: saved?.events?.length || 0,
    });
    
    if (saved && saved.events && saved.events.length > 0) {
      console.log('[Category Mount] Restoring state with', saved.events.length, 'events');
      hydratedFromRestoreRef.current = true;
      setEvents(saved.events);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
      
      // ✅ 복원된 이벤트를 전달
      fetchCategoryDetail(saved.events);
    } else {
      console.log('[Category Mount] No valid saved data found');
      fetchCategoryDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryCode, countryCode]);

  // 라우팅 직전 저장
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) return;

      console.log('[Category Save] Saving state:', {
        eventsCount: events.length,
        eventsStart,
        eventsHasMore,
      });

      savePage<CategoryPageState>(STATE_KEY, {
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      });
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [events, eventsStart, eventsHasMore, savePage, STATE_KEY]);

  // 새로고침/탭 숨김 시 저장 (선택적)
  useEffect(() => {
    const persist = () =>
      savePage<CategoryPageState>(STATE_KEY, {
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
  }, [events, eventsStart, eventsHasMore, savePage, STATE_KEY]);

  // ========================= 렌더 =========================
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
          <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
          <p className="text-gray-600 mb-6">해당 카테고리는 존재하지 않습니다.</p>
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
          <p className="text-gray-600 mb-6">Failed to load category details. Please try again.</p>
          <button
            onClick={() => fetchCategoryDetail()}
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
      <div>
        {categoryDetail?.i18n?.name ? (
          <div className="text-center font-extrabold">
            <div className="text-3xl">{categoryDetail?.i18n?.name}</div>
            <div className="text-gray-400 text-lg font-thin">{categoryDetail?.category?.name}</div>
          </div>
        ) : (
          <div className="text-center font-extrabold">
            <div className="text-3xl">{categoryDetail?.category?.name}</div>
          </div>
        )}
      </div>

      {/* 이벤트 목록 */}
      {events?.length ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {events.map((item) => (
            <CompCommonDdayItem key={item.event_code} event={item} fullLocale={fullLocale} />
          ))}

          {eventsHasMore && <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} />}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1024px] px-2 sm:px-4 lg:px-6 text-center py-12 text-gray-500">
          No events found for this category.
        </div>
      )}
    </div>
  );
}