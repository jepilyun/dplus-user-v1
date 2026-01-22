"use client";

import { reqGetCategoryDetail, reqGetCategoryEvents } from "@/req/req-category";
import {
  LIST_LIMIT,
  ResponseCategoryDetailForUserFront,
  TMapCategoryEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CompLoadMore } from "../button/comp-load-more";
import CompCommonDdayItem from "../dday-card/comp-common-dday-item";
import CompCommonDdayCard from "../dday-card/comp-common-dday-card";
import { useCategoryPageRestoration } from "@/contexts/scroll-restoration-context";
import { incrementCategoryViewCount } from "@/utils/increment-count";
import { getSessionDataVersion } from "@/utils/get-session-data-version";
import { CompLoading } from "../common/comp-loading";
import { CompNotFound } from "../common/comp-not-found";
import { CompNetworkError } from "../common/comp-network-error";

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
  initialData,
}: {
  categoryCode: string;
  countryCode: string;
  langCode: string;
  fullLocale: string;
  initialData: ResponseCategoryDetailForUserFront | null;
}) {
  const router = useRouter();
  const { save, restore } = useCategoryPageRestoration(categoryCode);

  const viewCountIncrementedRef = useRef(false);
  const restorationAttemptedRef = useRef(false);

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(!initialData);

  const [categoryDetail, setCategoryDetail] = useState<ResponseCategoryDetailForUserFront | null>(
    initialData ?? null
  );

  const [dataVersion, setDataVersion] = useState<string>(getSessionDataVersion);

  const [events, setEvents] = useState<TMapCategoryEventWithEventInfo[]>(
    initialData?.mapCategoryEvent?.items ?? []
  );
  const [eventsStart, setEventsStart] = useState(
    initialData?.mapCategoryEvent?.items?.length ?? 0
  );
  const [eventsHasMore, setEventsHasMore] = useState(
    Boolean(initialData?.mapCategoryEvent?.hasMore)
  );
  const [eventsLoading, setEventsLoading] = useState(false);

  const seenEventCodesRef = useRef<Set<string>>(
    new Set(
      initialData?.mapCategoryEvent?.items
        ?.map(item => item?.event_code)
        .filter(Boolean) ?? []
    )
  );

  const [viewCount, setViewCount] = useState(initialData?.categoryDetail?.categoryInfo?.view_count ?? 0);

  const fetchAndMergeData = async (restoredEvents?: TMapCategoryEventWithEventInfo[]) => {
    if (initialData && !restoredEvents) {
      setLoading(false);
      return;
    }

    try {
      const res = await reqGetCategoryDetail(countryCode, categoryCode, langCode, 0, LIST_LIMIT.default);
  
      if (!res?.dbResponse || !res?.dbResponse?.categoryDetail) {
        setError("not-found");
        setLoading(false);
        return;
      }
  
      setCategoryDetail(res.dbResponse);
      setViewCount(res.dbResponse?.categoryDetail?.categoryInfo?.view_count ?? 0);

      const serverEvents = res?.dbResponse?.mapCategoryEvent?.items ?? [];
      
      const newVersion = getSessionDataVersion();
      setDataVersion(newVersion);
      
      console.log('[Category Merge] 📊 Data versions:', {
        new: newVersion,
        old: dataVersion,
        changed: newVersion !== dataVersion
      });
      
      if (restoredEvents && restoredEvents.length > LIST_LIMIT.default) {
        console.log('[Category Merge] 🔄 서버 데이터와 복원 데이터 병합 시작');
        console.log('[Category Merge] Server events:', serverEvents.length);
        console.log('[Category Merge] Restored total:', restoredEvents.length);
        
        const serverCodes = new Set(
          serverEvents.map(item => item?.event_code).filter(Boolean)
        );
        
        const additionalEvents = restoredEvents
          .slice(LIST_LIMIT.default)
          .filter(item => {
            const code = item?.event_code;
            return code && !serverCodes.has(code);
          });
        
        console.log('[Category Merge] Additional events from restore:', additionalEvents.length);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        const futureEvents = additionalEvents.filter(item => {
          const eventDate = item?.event_info?.date;
          if (eventDate) {
            const date = new Date(eventDate);
            return date.getTime() >= todayTimestamp;
          }
          return true;
        });
        
        console.log('[Category Merge] Future events after filter:', futureEvents.length);
        
        const finalEvents = [...serverEvents, ...futureEvents];
        
        console.log('[Category Merge] ✅ Final merged:', {
          server: serverEvents.length,
          additional: futureEvents.length,
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
        console.log('[Category Merge] ✅ Using server data only');
        setEvents(serverEvents);
        setEventsStart(serverEvents.length);
        
        seenEventCodesRef.current.clear();
        serverEvents.forEach(item => {
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

      setEvents(prev => [...prev, ...newItems]);
      setEventsStart(prev => prev + newItems.length);
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    if (!viewCountIncrementedRef.current && categoryCode) {
      viewCountIncrementedRef.current = true;
      incrementCategoryViewCount(categoryCode)
        .then(newCount => {
          if (newCount !== null) setViewCount(newCount);
        });
    }
  }, [categoryCode]);

  useEffect(() => {
    if (restorationAttemptedRef.current) return;
    restorationAttemptedRef.current = true;

    console.log('[Category Mount] 🚀 Component mounted, attempting restore...');
    console.log('[Category Mount] Current data version:', dataVersion);
    
    const saved = restore<CategoryPageState>(dataVersion);
    
    console.log('[Category Mount] Restored data:', {
      hasSaved: !!saved,
      eventsCount: saved?.events?.length || 0,
    });
    
    if (saved && saved.events && saved.events.length > 0) {
      console.log('[Category Mount] ✅ Restoring state with', saved.events.length, 'events');
      
      setEvents(saved.events);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
      
      if (saved.events.length > LIST_LIMIT.default) {
        console.log('[Category Mount] 📡 Fetching server data for merge...');
        fetchAndMergeData(saved.events);
      }
    } else {
      console.log('[Category Mount] ⚠️ No valid saved data found');
      if (!initialData) {
        fetchAndMergeData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryCode, countryCode]);

  useEffect(() => {
    const saveCurrentState = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY === 0) {
        console.log('[Category Save] ⚠️ 스크롤이 0이므로 저장 건너뜀');
        return;
      }
      
      console.log('[Category Save] 💾 현재 상태 저장:', {
        scrollY: currentScrollY,
        eventsCount: events.length,
        dataVersion,
      });

      const state: CategoryPageState = {
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      };

      save<CategoryPageState>(state, dataVersion);
    };

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
        
        console.log('[Category Click] 🎯 네비게이션 요소 클릭 감지, 저장 실행');
        saveCurrentState();
      }
    };

    document.addEventListener("click", handleClick, true);
    
    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, [events, eventsStart, eventsHasMore, dataVersion, save]);

  useEffect(() => {
    const persist = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY === 0) return;
      
      save<CategoryPageState>({
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

  if (loading) {
    return (
      <CompLoading message="Loading..." />
    );
  }

  if (error === "not-found") {
    return (
      <CompNotFound
        title="Category Not Found"
        message="해당 카테고리는 존재하지 않습니다."
        returnPath={`/${langCode}`}
        returnLabel="홈 화면으로 이동"
      />
    );
  }

  if (error === "network") {
    return (
      <CompNetworkError
        title="ERROR"
        message="Failed to load category details. Please try again."
        onRetry={() => fetchAndMergeData()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4" data-view-count={viewCount}>
      <div>
        {categoryDetail?.categoryDetail?.i18n?.items?.[0]?.name ? (
          <div className="my-4 text-center font-extrabold">
            <div className="text-4xl">{categoryDetail?.categoryDetail?.i18n?.items?.[0]?.name}</div>
            <div className="text-gray-400 text-lg font-thin">{categoryDetail?.categoryDetail?.categoryInfo?.name}</div>
          </div>
        ) : (
          <div className="my-4 text-center font-extrabold">
            <div className="text-4xl">{categoryDetail?.categoryDetail?.categoryInfo?.name}</div>
          </div>
        )}
      </div>

      {events?.length ? (
        <>
          {/* 모바일: CompCommonDdayItem */}
          <div className="sm:hidden mx-auto w-full max-w-[1024px] grid grid-cols-1 gap-4">
            {events.map((item) => (
              <CompCommonDdayCard 
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
                <CompCommonDdayItem key={item.event_code} event={item} fullLocale={fullLocale} langCode={langCode} />
              ))}
            </div>
            {eventsHasMore && <div className="mt-4"><CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} locale={langCode} /></div>}
          </div>
        </>
      ) : (
        <div className="mx-auto w-full max-w-[1024px] px-2 sm:px-4 lg:px-6 text-center py-12 text-gray-500">
          No events found for this category.
        </div>
      )}
    </div>
  );
}