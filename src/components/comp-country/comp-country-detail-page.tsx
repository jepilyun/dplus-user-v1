"use client";

import { reqGetCountryDetail, reqGetCountryEvents } from "@/actions/action";
import {
  LIST_LIMIT,
  ResponseCountryDetailForUserFront,
  TCountryDetail,
  TMapCountryEventWithEventInfo,
} from "dplus_common_v1";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCountryImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { CompLoadMore } from "../comp-common/comp-load-more";
import Link from "next/link";
import { getCityBgUrl } from "@/utils/get-city-bg-image";
import { useCountryPageRestoration } from "@/contexts/scroll-restoration-context";
import { incrementCountryViewCount } from "@/utils/increment-count";
import { NavigationSaveContext } from "@/contexts/navigation-save-context";
import { getSessionDataVersion } from "@/utils/get-session-data-version";

type CountryPageState = {
  events: TMapCountryEventWithEventInfo[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

export default function CompCountryDetailPage({
  countryCode,
  fullLocale,
  langCode,
  initialData,
}: {
  countryCode: string;
  fullLocale: string;
  langCode: string;
  initialData: ResponseCountryDetailForUserFront | null;
}) {
  const router = useRouter();
  const { save, restore } = useCountryPageRestoration(countryCode);

  const viewCountIncrementedRef = useRef(false);
  const restorationAttemptedRef = useRef(false);

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(!initialData);

  const [countryDetail, setCountryDetail] = useState<ResponseCountryDetailForUserFront | null>(
    initialData ?? null
  );
  
  // ✅ 데이터 버전: 2시간 블록 (예: "123456" → 2시간마다 변경)
  const [dataVersion, setDataVersion] = useState<string>(getSessionDataVersion);

  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData ? getCountryImageUrls(initialData.country as TCountryDetail) : []
  );
  const [hasCategories, setHasCategories] = useState(
    (initialData?.categories?.items?.length ?? 0) > 0
  );
  const [hasCities, setHasCities] = useState(
    (initialData?.cities?.items?.length ?? 0) > 0
  );

  const seenEventCodesRef = useRef<Set<string>>(
    new Set(
      initialData?.mapCountryEvent?.items
        ?.map(item => item?.event_info?.event_code ?? item?.event_code)
        .filter(Boolean) ?? []
    )
  );

  const [events, setEvents] = useState<TMapCountryEventWithEventInfo[]>(
    initialData?.mapCountryEvent?.items ?? []
  );
  const [eventsStart, setEventsStart] = useState(
    initialData?.mapCountryEvent?.items?.length ?? 0
  );
  const [eventsHasMore, setEventsHasMore] = useState(
    Boolean(initialData?.mapCountryEvent?.hasMore)
  );
  const [eventsLoading, setEventsLoading] = useState(false);

  const [viewCount, setViewCount] = useState(
    initialData?.country?.view_count ?? 0
  );

  /**
   * ✅ 서버 데이터와 복원 데이터를 병합하는 함수
   */
  const fetchAndMergeData = async (restoredEvents?: TMapCountryEventWithEventInfo[]) => {
    if (initialData && !restoredEvents) {
      setLoading(false);
      return;
    }

    try {
      const res = await reqGetCountryDetail(countryCode, langCode, 0, LIST_LIMIT.default);
      
      const isEmptyObj =
        !res?.success ||
        !res?.dbResponse ||
        (typeof res.dbResponse === "object" && 
          !Array.isArray(res.dbResponse) && 
          Object.keys(res.dbResponse).length === 0) ||
        !res.dbResponse.country;
  
      if (isEmptyObj) {
        setError("not-found");
        setLoading(false);
        return;
      }
  
      setCountryDetail(res.dbResponse ?? null);
      setImageUrls(getCountryImageUrls(res.dbResponse?.country as TCountryDetail));
      setHasCategories((res.dbResponse?.categories?.items?.length ?? 0) > 0);
      setHasCities((res.dbResponse?.cities?.items?.length ?? 0) > 0);
      setViewCount(res.dbResponse?.country?.view_count ?? 0);

      const serverEvents = res.dbResponse?.mapCountryEvent?.items ?? [];
      
      // ✅ 새 데이터 버전 업데이트
      const newVersion = getSessionDataVersion();
      setDataVersion(newVersion);
      
      console.log('[Merge] 📊 Data versions:', {
        new: newVersion,
        old: dataVersion,
        changed: newVersion !== dataVersion
      });
      
      // ✅ 복원된 데이터가 있고 더보기를 했던 경우 (36개 초과)
      if (restoredEvents && restoredEvents.length > LIST_LIMIT.default) {
        console.log('[Merge] 🔄 서버 데이터와 복원 데이터 병합 시작');
        console.log('[Merge] Server events:', serverEvents.length);
        console.log('[Merge] Restored total:', restoredEvents.length);
        
        const serverCodes = new Set(
          serverEvents.map(item => item?.event_info?.event_code ?? item?.event_code).filter(Boolean)
        );
        
        const additionalEvents = restoredEvents
          .slice(LIST_LIMIT.default)
          .filter(item => {
            const code = item?.event_info?.event_code ?? item?.event_code;
            return code && !serverCodes.has(code);
          });
        
        console.log('[Merge] Additional events from restore:', additionalEvents.length);
        
        // 오늘 이후 이벤트만 필터링
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        const futureEvents = additionalEvents.filter(item => {
          if (item.date) {
            const eventDate = new Date(item.date);
            return eventDate.getTime() >= todayTimestamp;
          }
          return true;
        });
        
        console.log('[Merge] Future events after filter:', futureEvents.length);
        
        const finalEvents = [...serverEvents, ...futureEvents];
        
        console.log('[Merge] ✅ Final merged:', {
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
        console.log('[Merge] ✅ Using server data only');
        setEvents(serverEvents);
        setEventsStart(serverEvents.length);
        
        seenEventCodesRef.current.clear();
        serverEvents.forEach(item => {
          const code = item?.event_info?.event_code ?? item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      }
      
      setEventsHasMore(Boolean(res.dbResponse?.mapCountryEvent?.hasMore));
      setError(null);
    } catch (e) {
      console.error("Failed to fetch country detail:", e);
      setError("network");
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = async () => {
    const shareData = {
      title: countryDetail?.country.country_name || "이벤트 세트 공유",
      text: countryDetail?.country.country_name || "이벤트 세트 정보를 확인해보세요!",
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error("공유 실패:", error);
      }
    } else {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareData.text
      )}&url=${encodeURIComponent(shareData.url)}`;
      window.open(twitterUrl, "_blank", "width=600,height=400");
    }
  };

  const loadMoreEvents = async () => {
    if (eventsLoading || !eventsHasMore) return;
    setEventsLoading(true);
    
    try {
      const res = await reqGetCountryEvents(countryCode, eventsStart, LIST_LIMIT.default, langCode);
      const fetchedItems = res?.dbResponse?.items ?? [];
      
      const newItems = fetchedItems.filter((it: TMapCountryEventWithEventInfo) => {
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

  // ✅ 저장 함수 생성
  const saveStateBeforeNavigation = useCallback(() => {
    const currentScrollY = window.scrollY;
    
    console.log('[BeforeNav] 💾 네비게이션 전 저장:', {
      scrollY: currentScrollY,
      eventsCount: events.length,
    });

    const state: CountryPageState = {
      events,
      eventsStart,
      eventsHasMore,
      seenEventCodes: Array.from(seenEventCodesRef.current),
    };

    save<CountryPageState>(state, dataVersion);
  }, [events, eventsStart, eventsHasMore, dataVersion, save]);

  // ✅ 조회수 증가 (한 번만)
  useEffect(() => {
    if (!viewCountIncrementedRef.current && countryCode) {
      viewCountIncrementedRef.current = true;
      incrementCountryViewCount(countryCode).then(newCount => {
        if (newCount !== null) setViewCount(newCount);
      });
    }
  }, [countryCode]);

  // ✅ 초기 마운트 시 복원 시도
  useEffect(() => {
    if (restorationAttemptedRef.current) return;
    restorationAttemptedRef.current = true;

    console.log('[Mount] 🚀 Component mounted, attempting restore...');
    console.log('[Mount] Current data version:', dataVersion);
    
    // ✅ 현재 버전과 함께 복원 시도
    const saved = restore<CountryPageState>(dataVersion);

    console.log('[Mount] Restored data:', {
      hasSaved: !!saved,
      eventsCount: saved?.events?.length || 0,
    });
    
    if (saved && saved.events && saved.events.length > 0) {
      console.log('[Mount] ✅ Restoring state with', saved.events.length, 'events');
      
      // ✅ 복원 데이터로 먼저 화면 표시 (스크롤 위치 보존)
      setEvents(saved.events);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
      
      // ✅ 더보기를 했던 경우에만 백그라운드 병합
      if (saved.events.length > LIST_LIMIT.default) {
        console.log('[Mount] 📡 Fetching server data for merge...');
        fetchAndMergeData(saved.events);
      }
    } else {
      console.log('[Mount] ⚠️ No valid saved data found (version mismatch or expired)');
      if (!initialData) {
        fetchAndMergeData();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode]);

  // ✅ 링크 클릭 시 저장 (버전 포함)
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) {
        return;
      }

      console.log('[Click] 💾 Saving state:', {
        scrollY: window.scrollY,
        eventsCount: events.length,
        dataVersion,
      });

      const state: CountryPageState = {
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      };

      // ✅ 버전과 함께 저장
      save<CountryPageState>(state, dataVersion);
    };

    document.addEventListener("click", handleLinkClick, true);
    return () => document.removeEventListener("click", handleLinkClick, true);
  }, [events, eventsStart, eventsHasMore, dataVersion, save]);

  // ✅ 새로고침/탭 숨김 시 저장
  useEffect(() => {
    const persist = () => {
      save<CountryPageState>({
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

  // 나머지 렌더링 로직은 동일...
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div>Loading...</div>
      </div>
    );
  }

  if (error === 'not-found') {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Country Not Found</h2>
          <p className="text-gray-600 mb-6">해당 국가는 존재하지 않습니다.</p>
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

  if (error === 'network') {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">ERROR</h2>
          <p className="text-gray-600 mb-6">Failed to load country details. Please try again.</p>
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
    <NavigationSaveContext.Provider value={saveStateBeforeNavigation}>
      <div className="flex flex-col gap-8">
        {hasCategories && (
          <div className="mx-auto w-full max-w-[1440px] px-4">
            <div className="flex justify-center gap-2 flex-wrap">
              {countryDetail?.categories?.items.map((item) => (
                <Link
                  key={item.category_code}
                  href={`/category/${item.category_code}`}
                  className="block"
                >
                  <div className="flex flex-col items-center justify-center gap-1 h-full w-full rounded-full border border-gray-200 px-6 py-3 transition hover:bg-gray-50 hover:font-bold">
                    <div className="text-md text-center">
                      {item.name_i18n ?? item.name}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {hasCities && (
          <div className="mx-auto w-full max-w-[1440px] px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 min-h-[120px]">
              {countryDetail?.cities?.items.map((item) => {
                const bg = getCityBgUrl(item);
                return (
                  <Link
                    key={item.city_code}
                    href={`/city/${item.city_code}`}
                    className={[
                      "relative flex flex-col items-center justify-center gap-1",
                      "h-full min-h-[120px] w-full rounded-2xl border border-gray-200 p-4",
                      "transition-all duration-200 overflow-hidden group",
                      bg ? "bg-gray-900" : "bg-gray-50 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    {bg && (
                      <>
                        <div
                          className="absolute inset-0 bg-center bg-cover transition-transform duration-300 group-hover:scale-105"
                          style={{ backgroundImage: `url(${bg})` }}
                          aria-hidden="true"
                        />
                        <div 
                          className="absolute inset-0 bg-black/60 transition-opacity duration-200 group-hover:bg-black/40" 
                          aria-hidden="true"
                        />
                      </>
                    )}
                    <div className="relative z-10 w-full">
                      <div
                        className={[
                          "text-xl font-bold text-center transition-transform duration-200",
                          bg 
                            ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-hover:scale-105" 
                            : "text-gray-900",
                        ].join(" ")}
                      >
                        {item.name_native ?? item.name}
                      </div>
                      <div
                        className={[
                          "text-sm text-center transition-transform duration-200",
                          bg
                            ? "text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:scale-105"
                            : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {item.name}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {events?.length ? (
          <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
            {events.map(item => (
              <CompCommonDdayItem 
                key={item.event_info?.event_code} 
                event={item} 
                fullLocale={fullLocale} 
              />
            ))}

            {eventsHasMore && (
              <CompLoadMore 
                onLoadMore={loadMoreEvents} 
                loading={eventsLoading} 
                locale={langCode}
              />
            )}
          </div>
        ) : null}
      </div>
    </NavigationSaveContext.Provider>
  );
}