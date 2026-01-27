"use client";

import { fetchGetGroupDetail, fetchGetGroupEvents } from "@/api/group/fetchGroup";
import {
  LIST_LIMIT,
  ResponseGroupDetailForUserFront,
  SUPPORT_LANG_CODES,
  TMapGroupEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { getGroupDetailImageUrls } from "@/utils/set-image-urls";
import CompCommonDdayItem from "../dday-card/comp-common-dday-item";
import { CompLoadMore } from "../button/comp-load-more";
import { HeroImageBackgroundCarouselGroup } from "../image/hero-background-carousel-group";
import { incrementGroupViewCount } from "@/utils/increment-count";
import { getSessionDataVersion } from "@/utils/get-session-data-version";
import CompCommonDdayCard from "../dday-card/comp-common-dday-card";
import { CompLoading } from "../common/comp-loading";
import { CompNotFound } from "../common/comp-not-found";
import { CompNetworkError } from "../common/comp-network-error";

export default function CompGroupDetailPage({
  groupCode,
  langCode,
  fullLocale,
  initialData,
}: {
  groupCode: string;
  langCode: string;
  fullLocale: string;
  initialData: ResponseGroupDetailForUserFront | null;
}) {
  const viewCountIncrementedRef = useRef(false);

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(!initialData);

  const [groupDetail, setGroupDetail] = useState<ResponseGroupDetailForUserFront | null>(
    initialData ?? null
  );
  
  // ✅ 데이터 버전: 2시간 블록
  const [dataVersion, setDataVersion] = useState<string>(getSessionDataVersion);

  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData ? getGroupDetailImageUrls(initialData.groupDetail?.groupInfo) : []
  );

  const [events, setEvents] = useState<TMapGroupEventWithEventInfo[]>(
    initialData?.mapGroupEvent?.items ?? []
  );
  const [eventsStart, setEventsStart] = useState(
    initialData?.mapGroupEvent?.items?.length ?? 0
  );
  const [eventsHasMore, setEventsHasMore] = useState(
    Boolean(initialData?.mapGroupEvent?.hasMore)
  );
  const [eventsLoading, setEventsLoading] = useState(false);

  const seenEventCodesRef = useRef<Set<string>>(
    new Set(
      initialData?.mapGroupEvent?.items
        ?.map(item => item?.event_info?.event_code ?? item?.event_code)
        .filter(Boolean) ?? []
    )
  );

  const [viewCount, setViewCount] = useState(initialData?.groupDetail?.groupInfo?.view_count ?? 0);
  const [sharedCount, setSharedCount] = useState(initialData?.groupDetail?.groupInfo?.shared_count ?? 0);

  /**
   * ✅ 서버 데이터와 복원 데이터를 병합하는 함수
   */
  const fetchAndMergeData = async (restoredEvents?: TMapGroupEventWithEventInfo[]) => {
    if (initialData && !restoredEvents) {
      setLoading(false);
      return;
    } 

    try {
      const res = await fetchGetGroupDetail(groupCode, langCode, 0, LIST_LIMIT.default);
  
      const isEmptyObj =
        !res?.dbResponse ||
        (typeof res?.dbResponse === "object" &&
          !Array.isArray(res?.dbResponse) &&
          Object.keys(res?.dbResponse).length === 0);
  
      if (!res?.success || isEmptyObj || !res?.dbResponse?.groupDetail?.groupInfo) {
        setError("not-found");
        setLoading(false);
        return;
      }
  
      setGroupDetail(res.dbResponse);
      setImageUrls(getGroupDetailImageUrls(res.dbResponse.groupDetail?.groupInfo));
      setViewCount(res.dbResponse?.groupDetail?.groupInfo?.view_count ?? 0);
      setSharedCount(res.dbResponse?.groupDetail?.groupInfo?.shared_count ?? 0);

      const serverEvents = res?.dbResponse?.mapGroupEvent?.items ?? [];
      
      // ✅ 새 데이터 버전 업데이트
      const newVersion = getSessionDataVersion();
      setDataVersion(newVersion);
      
      console.log('[Group Merge] 📊 Data versions:', {
        new: newVersion,
        old: dataVersion,
        changed: newVersion !== dataVersion
      });
      
      // ✅ 복원된 데이터가 있고 더보기를 했던 경우 (36개 초과)
      if (restoredEvents && restoredEvents.length > LIST_LIMIT.default) {
        console.log('[Group Merge] 🔄 서버 데이터와 복원 데이터 병합 시작');
        console.log('[Group Merge] Server events:', serverEvents.length);
        console.log('[Group Merge] Restored total:', restoredEvents.length);
        
        const serverCodes = new Set(
          serverEvents.map(item => item?.event_info?.event_code ?? item?.event_code).filter(Boolean)
        );
        
        const additionalEvents = restoredEvents
          .slice(LIST_LIMIT.default)
          .filter(item => {
            const code = item?.event_info?.event_code ?? item?.event_code;
            return code && !serverCodes.has(code);
          });
        
        console.log('[Group Merge] Additional events from restore:', additionalEvents.length);
        
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
        
        console.log('[Group Merge] Future events after filter:', futureEvents.length);
        
        const finalEvents = [...serverEvents, ...futureEvents];
        
        console.log('[Group Merge] ✅ Final merged:', {
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
        console.log('[Group Merge] ✅ Using server data only');
        setEvents(serverEvents);
        setEventsStart(serverEvents.length);
        
        seenEventCodesRef.current.clear();
        serverEvents.forEach(item => {
          const code = item?.event_info?.event_code ?? item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      }
      
      setEventsHasMore(Boolean(res?.dbResponse?.mapGroupEvent?.hasMore));
      setError(null);
    } catch (e) {
      console.error("Failed to fetch group detail:", e);
      setError("network");
    } finally {
      setLoading(false);
    }
  };

  // const handleShareClick = async () => {
  //   const shareData = {
  //     title: groupDetail?.groupDetail?.groupInfo?.name || "이벤트 세트 공유",
  //     text: groupDetail?.groupDetail?.groupInfo?.name_native || "이벤트 세트 정보를 확인해보세요!",
  //     url: window.location.href,
  //   };

  //   if (navigator.share) {
  //     try {
  //       await navigator.share(shareData);
  //       console.log('공유 성공');
        
  //       const newCount = await incrementGroupSharedCount(groupCode);
  //       if (newCount !== null) {
  //         setSharedCount(newCount);
  //       }
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
      const res = await fetchGetGroupEvents(groupCode, eventsStart, LIST_LIMIT.default);
      const fetchedItems = res?.dbResponse?.items ?? [];
      
      const newItems = fetchedItems.filter((it: TMapGroupEventWithEventInfo) => {
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
    if (!viewCountIncrementedRef.current && groupCode) {
      viewCountIncrementedRef.current = true;
      incrementGroupViewCount(groupCode).then(newCount => {
        if (newCount !== null) setViewCount(newCount);
      });
    }
  }, [groupCode]);

  // ================= 렌더 =================

  if (loading) {
    return (
      <CompLoading message="Loading..." />
    );
  }

  if (error === "not-found") {
    return (
      <CompNotFound
        title="Group Not Found"
        message="해당 그룹은 존재하지 않습니다."
        returnPath={`/${langCode}`}
        returnLabel="홈 화면으로 이동"
      />
    );
  }

  if (error === "network") {
    return (
      <CompNetworkError
        title="ERROR"
        message="Failed to load group details. Please try again."
        onRetry={() => fetchAndMergeData()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4" data-view-count={viewCount} data-shared-count={sharedCount}>
      <HeroImageBackgroundCarouselGroup
        bucket="groups"
        imageUrls={imageUrls}
        interval={5000}
        groupDetail={groupDetail?.groupDetail?.groupInfo || null}
        langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
      />

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
      ) : null}
    </div>
  );
}