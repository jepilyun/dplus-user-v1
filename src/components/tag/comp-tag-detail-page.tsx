"use client";

import { reqGetTagDetail, reqGetTagEvents } from "@/req/req-tag";
import {
  LIST_LIMIT,
  ResponseTagDetailForUserFront,
  TMapTagEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../dday-card/comp-common-dday-item";
import { CompLoadMore } from "../button/comp-load-more";
import { useTagPageRestoration } from "@/contexts/scroll-restoration-context"; // ✅ 변경
import { incrementTagViewCount } from "@/utils/increment-count";
import CompCommonDdayCard from "../dday-card/comp-common-dday-card";
import { CompLoading } from "../common/comp-loading";
import { CompNotFound } from "../common/comp-not-found";
import { CompNetworkError } from "../common/comp-network-error";

type TagPageState = {
  events: TMapTagEventWithEventInfo[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

export default function CompTagDetailPage({
  tagCode,
  langCode,
  fullLocale,
}: {
  tagCode: string;
  langCode: string;
  fullLocale: string;
}) {
  const router = useRouter();

  // ✅ 변경: 전용 hook 사용
  const { save, restore } = useTagPageRestoration(tagCode);

  // ✅ 조회수 증가 여부 추적
  const viewCountIncrementedRef = useRef(false);

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(true);

  const [tagDetail, setTagDetail] = useState<ResponseTagDetailForUserFront | null>(null);

  const [events, setEvents] = useState<TMapTagEventWithEventInfo[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  const seenEventCodesRef = useRef<Set<string>>(new Set());
  const hydratedFromRestoreRef = useRef(false);

  // ✅ 로컬 카운트 상태 (낙관적 업데이트용)
  const [viewCount, setViewCount] = useState(tagDetail?.tag?.view_count ?? 0);

  const fetchTagDetail = async (restoredEvents?: TMapTagEventWithEventInfo[]) => {
    try {
      const res = await reqGetTagDetail(tagCode, 0, LIST_LIMIT.default);
      const db = res?.dbResponse;
  
      const isEmptyObj =
        !db || (typeof db === "object" && !Array.isArray(db) && Object.keys(db).length === 0);
  
      if (!res?.success || isEmptyObj || !db?.tag) {
        setError("not-found");
        setLoading(false);
        return;
      }
  
      setTagDetail(db);
  
      // ✅ view_count 업데이트
      setViewCount(db?.tag?.view_count ?? 0);

      const initItems = db?.mapTagEvent?.items ?? [];
      
      // ✅ 핵심 수정: 복원 여부와 관계없이 항상 서버 최신 36개를 기준으로
      if (restoredEvents && restoredEvents.length > LIST_LIMIT.default) {
        console.log('[Tag Fetch] Merging server data with restored pagination');
        console.log('[Tag Fetch] Server events:', initItems.length);
        console.log('[Tag Fetch] Restored total:', restoredEvents.length);
        
        // 서버의 최신 36개 이벤트 코드
        const serverCodes = new Set(
          initItems.map(item => item?.event_info?.event_code ?? item?.event_code).filter(Boolean)
        );
        
        // ✅ 복원된 이벤트 중 37번째 이후만 추출 (더보기로 로드한 것들)
        const additionalEvents = restoredEvents
          .slice(LIST_LIMIT.default)
          .filter(item => {
            const code = item?.event_info?.event_code ?? item?.event_code;
            return code && !serverCodes.has(code);
          });
        
        console.log('[Tag Fetch] Additional events from restore:', additionalEvents.length);
        
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
        
        console.log('[Tag Fetch] Future events after filter:', futureEvents.length);
        
        // ✅ 서버 최신 36개 + 더보기로 로드한 이벤트들
        const finalEvents = [...initItems, ...futureEvents];
        
        console.log('[Tag Fetch] Final merged:', {
          server: initItems.length,
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
        // 더보기를 안 한 경우: 서버 데이터만 사용
        console.log('[Tag Fetch] Using server data only');
        setEvents(initItems);
        setEventsStart(initItems.length);
        
        seenEventCodesRef.current.clear();
        initItems.forEach(item => {
          const code = item?.event_info?.event_code ?? item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      }
      
      setEventsHasMore(Boolean(db?.mapTagEvent?.hasMore));
      setError(null);
    } catch (e) {
      console.error("Failed to fetch tag detail:", e);
      setError("network");
    } finally {
      setLoading(false);
    }
  };
  
  // const handleShareClick = async () => {
  //   const shareData = {
  //     title: tagDetail?.tag.tag || "이벤트 세트 공유",
  //     text: tagDetail?.tag.tag || "이벤트 세트 정보를 확인해보세요!",
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
      const tagCode = tagDetail?.tag.tag_code;
      if (!tagCode) {
        console.warn("tagDetail?.tag.tag_code is not defined");
        return;
      }

      const res = await reqGetTagEvents(tagCode, eventsStart, LIST_LIMIT.default);
      const fetchedItems = res?.dbResponse?.items ?? [];
      const newItems = fetchedItems.filter((it: TMapTagEventWithEventInfo) => {
        const code = it?.event_info?.event_code ?? it?.event_code;
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

  // 페이지 진입 시
  useEffect(() => {
    if (!viewCountIncrementedRef.current && tagCode) {
      viewCountIncrementedRef.current = true;
      incrementTagViewCount(tagCode).then(newCount => {
        if (newCount !== null) setViewCount(newCount);
      });
    }
  }, [tagCode]);

  useEffect(() => {
    console.log('[Tag Mount] Component mounted, attempting restore...');
    const saved = restore<TagPageState>();
    
    console.log('[Tag Mount] Restored data:', {
      hasSaved: !!saved,
      eventsCount: saved?.events?.length || 0,
    });
    
    if (saved && saved.events && saved.events.length > 0) {
      console.log('[Tag Mount] Restoring state with', saved.events.length, 'events');
      hydratedFromRestoreRef.current = true;
      
      // ✅ 복원 데이터로 먼저 화면 표시 (스크롤 위치 복원을 위해)
      setEvents(saved.events);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
      
      // ✅ 백그라운드에서 서버 데이터 가져와서 업데이트
      fetchTagDetail(saved.events);
    } else {
      console.log('[Tag Mount] No valid saved data found');
      fetchTagDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagCode]);

  // 라우팅 직전 저장
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) return;

      console.log('[Tag Save] Saving state:', {
        eventsCount: events.length,
        eventsStart,
        eventsHasMore,
      });

      save<TagPageState>({
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
      save<TagPageState>({
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
      <CompLoading message="Loading..." />
    );
  }

  if (error === "not-found") {
    return (
      <CompNotFound
        title="Tag Not Found"
        message="해당 태그는 존재하지 않습니다."
        returnPath={`/${langCode}`}
        returnLabel="홈 화면으로 이동"
      />
    );
  }

  if (error === "network") {
    return (
      <CompNetworkError
        title="ERROR"
        message="Failed to load tag details. Please try again."
        onRetry={() => fetchTagDetail()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4" data-view-count={viewCount}>
      <div id="tag-title" className="text-center font-extrabold text-3xl" data-tag-code={tagDetail?.tag.tag_code}>
        {tagDetail?.tag.tag}
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
      ) : null}
    </div>
  );
}