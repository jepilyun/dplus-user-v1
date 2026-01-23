"use client";

import { reqGetCountryDetail, reqGetCountryEvents } from "@/req/req-country";
import {
  LIST_LIMIT,
  ResponseCountryDetailForUserFront,
  TMapCountryEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { CompLoadMore } from "../button/comp-load-more";
import { incrementCountryViewCount } from "@/utils/increment-count";
import { getSessionDataVersion } from "@/utils/get-session-data-version";
import { CompCountryCategoryItem } from "./comp-country-category-item";
import { CompCountryCityItem } from "./comp-country-city-item";
import CompCommonDdayCard from "../dday-card/comp-common-dday-card";
import { CompLoading } from "../common/comp-loading";
import { CompNotFound } from "../common/comp-not-found";
import { CompNetworkError } from "../common/comp-network-error";

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
  const viewCountIncrementedRef = useRef(false);

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(!initialData);

  const [countryDetail, setCountryDetail] = useState<ResponseCountryDetailForUserFront | null>(
    initialData ?? null
  );
  
  // ✅ 데이터 버전: 2시간 블록 (예: "123456" → 2시간마다 변경)
  const [dataVersion, setDataVersion] = useState<string>(getSessionDataVersion);

  // const [imageUrls, setImageUrls] = useState<string[]>(
  //   initialData ? getCountryHeroImageUrls(initialData.countryDetail?.countryInfo as TCountryDetail) : []
  // );

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
    initialData?.countryDetail?.countryInfo?.view_count ?? 0
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
        !res.dbResponse.countryDetail;
  
      if (isEmptyObj) {
        setError("not-found");
        setLoading(false);
        return;
      }
  
      setCountryDetail(res.dbResponse ?? null);
      // setImageUrls(getCountryHeroImageUrls(res.dbResponse?.countryDetail?.countryInfo as TCountryDetail));
      setHasCategories((res.dbResponse?.categories?.items?.length ?? 0) > 0);
      setHasCities((res.dbResponse?.cities?.items?.length ?? 0) > 0);
      setViewCount(res.dbResponse?.countryDetail?.countryInfo?.view_count ?? 0);

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
          if (item.event_info?.date) {
            const eventDate = new Date(item.event_info?.date);
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

  // const handleShareClick = async () => {
  //   const shareData = {
  //     title: countryDetail?.countryDetail?.countryInfo?.country_name || "이벤트 세트 공유",
  //     text: countryDetail?.countryDetail?.countryInfo?.country_name || "이벤트 세트 정보를 확인해보세요!",
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

  // ✅ 조회수 증가 (한 번만)
  useEffect(() => {
    if (!viewCountIncrementedRef.current && countryCode) {
      viewCountIncrementedRef.current = true;
      incrementCountryViewCount(countryCode)
        .then(newCount => {
          if (newCount !== null) setViewCount(newCount);
        });
    }
  }, [countryCode]);

  // 나머지 렌더링 로직은 동일...
  if (loading) {
    return (
      <CompLoading message="Loading..." />
    );
  }

  if (error === 'not-found') {
    return (
      <CompNotFound
        title="Country Not Found"
        message="해당 국가는 존재하지 않습니다."
        returnPath={`/${langCode}`}
        returnLabel="홈 화면으로 이동"
      />
    );
  }

  if (error === 'network') {
    return (
      <CompNetworkError
        title="ERROR"
        message="Failed to load country details. Please try again."
        onRetry={() => fetchAndMergeData()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div className="p-4 flex flex-col gap-8" data-view-count={viewCount}>
      {hasCategories && (
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="flex justify-center gap-2 flex-wrap">
            {countryDetail?.categories?.items.map((item) => (
              <CompCountryCategoryItem key={item.category_code} category={item} />
            ))}
          </div>
        </div>
      )}

      {hasCities && (
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 min-h-[120px]">
            {countryDetail?.cities?.items.map((item) => (
              <CompCountryCityItem key={item.city_code} city={item} />
            ))}
          </div>
        </div>
      )}

      {events?.length ? (
        <>
        <div className="mx-auto w-full max-w-[1440px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {events.map(item => (
            <CompCommonDdayCard 
              key={item.event_info?.event_code} 
              event={item} 
              fullLocale={fullLocale}
              langCode={langCode}
            />
          ))}
        </div>
        {eventsHasMore && (
          <CompLoadMore 
            onLoadMore={loadMoreEvents} 
            loading={eventsLoading} 
            locale={langCode}
          />
        )}
        </>
      ) : null}
    </div>
  );
}