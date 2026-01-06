"use client";

import { reqGetCityDetail, reqGetCityEvents } from "@/actions/action";
import {
  LIST_LIMIT,
  ResponseCityDetailForUserFront,
  SUPPORT_LANG_CODES,
  TMapCityEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { getCityDetailImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { CompLoadMore } from "../comp-button/comp-load-more";
import { HeroImageBackgroundCarouselCity } from "../comp-image/hero-background-carousel-city";
import { useCityPageRestoration } from "@/contexts/scroll-restoration-context";
import { incrementCityViewCount } from "@/utils/increment-count";
import { getSessionDataVersion } from "@/utils/get-session-data-version";
import CompCommonDdayCard from "../comp-common/comp-common-dday-card";
import { CompLoading } from "../comp-common/comp-loading";
import { CompNotFound } from "../comp-common/comp-not-found";
import { CompNetworkError } from "../comp-common/comp-network-error";

type CityPageState = {
  events: TMapCityEventWithEventInfo[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

export default function CompCityDetailPage({
  cityCode,
  langCode,
  fullLocale,
  initialData,
}: {
  cityCode: string;
  langCode: string;
  fullLocale: string;
  initialData: ResponseCityDetailForUserFront | null;
}) {
  const router = useRouter();
  const { save, restore } = useCityPageRestoration(cityCode);

  const viewCountIncrementedRef = useRef(false);
  const restorationAttemptedRef = useRef(false);

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(!initialData);

  const [cityDetail, setCityDetail] = useState<ResponseCityDetailForUserFront | null>(
    initialData ?? null
  );
  
  // ✅ 데이터 버전: 2시간 블록
  const [dataVersion, setDataVersion] = useState<string>(getSessionDataVersion);

  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData ? getCityDetailImageUrls(initialData.cityDetail?.cityInfo) : []
  );

  const [events, setEvents] = useState<TMapCityEventWithEventInfo[]>(
    initialData?.mapCityEvent?.items ?? []
  );
  const [eventsStart, setEventsStart] = useState(
    initialData?.mapCityEvent?.items?.length ?? 0
  );
  const [eventsHasMore, setEventsHasMore] = useState(
    Boolean(initialData?.mapCityEvent?.hasMore)
  );
  const [eventsLoading, setEventsLoading] = useState(false);

  const seenEventCodesRef = useRef<Set<string>>(
    new Set(
      initialData?.mapCityEvent?.items
        ?.map(item => item?.event_info?.event_code ?? item?.event_code)
        .filter(Boolean) ?? []
    )
  );

  const [viewCount, setViewCount] = useState(initialData?.cityDetail?.cityInfo?.view_count ?? 0);

  /**
   * ✅ 서버 데이터와 복원 데이터를 병합하는 함수
   */
  const fetchAndMergeData = async (restoredEvents?: TMapCityEventWithEventInfo[]) => {
    if (initialData && !restoredEvents) {
      setLoading(false);
      return;
    }

    try {
      const res = await reqGetCityDetail(cityCode, langCode, 0, LIST_LIMIT.default);
  
      const isEmptyObj =
        !res?.dbResponse ||
        (typeof res?.dbResponse === "object" &&
          !Array.isArray(res?.dbResponse) &&
          Object.keys(res?.dbResponse).length === 0);
  
      if (!res?.success || isEmptyObj || !res?.dbResponse?.cityDetail) {
        setError("not-found");
        setLoading(false);
        return;
      }
  
      setCityDetail(res.dbResponse);
      setImageUrls(getCityDetailImageUrls(res.dbResponse.cityDetail?.cityInfo));
      setViewCount(res.dbResponse?.cityDetail?.cityInfo?.view_count ?? 0);

      const serverEvents = res?.dbResponse?.mapCityEvent?.items ?? [];
      
      // ✅ 새 데이터 버전 업데이트
      const newVersion = getSessionDataVersion();
      setDataVersion(newVersion);
      
      console.log('[City Merge] 📊 Data versions:', {
        new: newVersion,
        old: dataVersion,
        changed: newVersion !== dataVersion
      });
      
      // ✅ 복원된 데이터가 있고 더보기를 했던 경우 (36개 초과)
      if (restoredEvents && restoredEvents.length > LIST_LIMIT.default) {
        console.log('[City Merge] 🔄 서버 데이터와 복원 데이터 병합 시작');
        console.log('[City Merge] Server events:', serverEvents.length);
        console.log('[City Merge] Restored total:', restoredEvents.length);
        
        const serverCodes = new Set(
          serverEvents.map(item => item?.event_info?.event_code ?? item?.event_code).filter(Boolean)
        );
        
        const additionalEvents = restoredEvents
          .slice(LIST_LIMIT.default)
          .filter(item => {
            const code = item?.event_info?.event_code ?? item?.event_code;
            return code && !serverCodes.has(code);
          });
        
        console.log('[City Merge] Additional events from restore:', additionalEvents.length);
        
        // 오늘 이후 이벤트만 필터링
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        const futureEvents = additionalEvents.filter(item => {
          const eventDate = item.event_info?.date;
          
          if (eventDate) {
            const date = new Date(eventDate);
            return date.getTime() >= todayTimestamp;
          }
          return true;
        });
        
        console.log('[City Merge] Future events after filter:', futureEvents.length);
        
        const finalEvents = [...serverEvents, ...futureEvents];
        
        console.log('[City Merge] ✅ Final merged:', {
          server: serverEvents.length,
          additional: futureEvents.length,
          total: finalEvents.length
        });
        
        setEvents(finalEvents);
        setEventsStart(finalEvents.length);
        
        seenEventCodesRef.current.clear();
        finalEvents.forEach(item => {
          const code = item?.event_info?.event_code ?? item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      } else {
        console.log('[City Merge] ✅ Using server data only');
        setEvents(serverEvents);
        setEventsStart(serverEvents.length);
        
        seenEventCodesRef.current.clear();
        serverEvents.forEach(item => {
          const code = item?.event_info?.event_code ?? item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      }
      
      setEventsHasMore(Boolean(res?.dbResponse?.mapCityEvent?.hasMore));
      setError(null);
    } catch (e) {
      console.error("Failed to fetch city detail:", e);
      setError("network");
    } finally {
      setLoading(false);
    }
  };

  // const handleShareClick = async () => {
  //   const shareData = {
  //     title: cityDetail?.cityDetail?.cityInfo?.name || "이벤트 세트 공유",
  //     text: cityDetail?.cityDetail?.cityInfo?.name || "이벤트 세트 정보를 확인해보세요!",
  //     url: window.location.href,
  //   };

  //   if (navigator.share) {
  //     try {
  //       await navigator.share(shareData);
  //     } catch (error) {
  //       console.error("공유 실패:", error);
  //     }
  //   } else {
  //     const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
  //       shareData.text
  //     )}&url=${encodeURIComponent(shareData.url)}`;
  //     window.open(twitterUrl, "_blank", "width=600,height=400");
  //   }
  // };

  const loadMoreEvents = async () => {
    if (eventsLoading || !eventsHasMore) return;
    setEventsLoading(true);

    try {
      const res = await reqGetCityEvents(cityCode, eventsStart, LIST_LIMIT.default, langCode);
      const fetchedItems = res?.dbResponse?.items ?? [];
      
      const newItems = fetchedItems.filter((it: TMapCityEventWithEventInfo) => {
        const code = it?.event_info?.event_code ?? it?.event_code;
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

  // ✅ 조회수 증가 (한 번만)
  useEffect(() => {
    if (!viewCountIncrementedRef.current && cityCode) {
      viewCountIncrementedRef.current = true;
      incrementCityViewCount(cityCode)
        .then(newCount => {
          if (newCount !== null) setViewCount(newCount);
        });
    }
  }, [cityCode]);

  // ✅ 초기 마운트 시 복원 시도
  useEffect(() => {
    if (restorationAttemptedRef.current) return;
    restorationAttemptedRef.current = true;

    console.log('[City Mount] 🚀 Component mounted, attempting restore...');
    console.log('[City Mount] Current data version:', dataVersion);
    
    const saved = restore<CityPageState>(dataVersion);
    
    console.log('[City Mount] Restored data:', {
      hasSaved: !!saved,
      eventsCount: saved?.events?.length || 0,
    });
    
    if (saved && saved.events && saved.events.length > 0) {
      console.log('[City Mount] ✅ Restoring state with', saved.events.length, 'events');
      
      setEvents(saved.events);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
      
      // ✅ 더보기를 했던 경우에만 백그라운드 병합
      if (saved.events.length > LIST_LIMIT.default) {
        console.log('[City Mount] 📡 Fetching server data for merge...');
        fetchAndMergeData(saved.events);
      }
    } else {
      console.log('[City Mount] ⚠️ No valid saved data found');
      if (!initialData) {
        fetchAndMergeData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityCode]);

  // ✅ 클릭 이벤트 감지하여 저장
  useEffect(() => {
    const saveCurrentState = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY === 0) {
        console.log('[City Save] ⚠️ 스크롤이 0이므로 저장 건너뜀');
        return;
      }
      
      console.log('[City Save] 💾 현재 상태 저장:', {
        scrollY: currentScrollY,
        eventsCount: events.length,
        dataVersion,
      });

      const state: CityPageState = {
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      };

      save<CityPageState>(state, dataVersion);
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
        
        console.log('[City Click] 🎯 네비게이션 요소 클릭 감지, 저장 실행');
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
      
      save<CityPageState>({
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
      <CompLoading message="Loading..." />
    );
  }

  if (error === "not-found") {
    return (
      <CompNotFound
        title="City Not Found"
        message="해당 도시는 존재하지 않습니다."
        returnPath={`/${langCode}`}
        returnLabel="홈 화면으로 이동"
      />
    );
  }

  if (error === "network") {
    return (
      <CompNetworkError
        title="ERROR"
        message="Failed to load city details. Please try again."
        onRetry={() => fetchAndMergeData()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4" data-view-count={viewCount}>
      <HeroImageBackgroundCarouselCity
        bucket="cities"
        imageUrls={imageUrls}
        interval={5000}
        cityDetail={cityDetail?.cityDetail?.cityInfo || null}
        langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
      />

      {events?.length ? (
        <>
          {/* 모바일: CompCommonDdayItem */}
          <div className="sm:hidden mx-auto w-full max-w-[1024px] grid grid-cols-1 gap-4">
            {events.map((item) => (
              <CompCommonDdayCard key={item.event_code} event={item} fullLocale={fullLocale} />
            ))}
            {eventsHasMore && <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} locale={langCode} />}
          </div>

          {/* 데스크톱: CompCommonDdayItemCard */}
          <div className="hidden sm:block mx-auto w-full max-w-[1024px] px-4 lg:px-6">
            <div className="flex flex-col gap-4">
              {events.map((item) => (
                <CompCommonDdayItem key={item.event_code} event={item} fullLocale={fullLocale} />
              ))}
            </div>
            {eventsHasMore && <div className="mt-4"><CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} locale={langCode} /></div>}
          </div>
        </>
      ) : null}
    </div>
  );
}