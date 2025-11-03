"use client";

import { reqGetTagDetail, reqGetTagEvents } from "@/actions/action";
import {
  LIST_LIMIT,
  ResponseTagDetailForUserFront,
  TMapTagEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { CompLoadMore } from "../comp-common/comp-load-more";
import { useScrollRestoration } from "@/contexts/scroll-restoration-context";

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

  const { savePage, restorePage } = useScrollRestoration();
  const STATE_KEY = `dplus:tag-${tagCode}`;

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(true);

  const [tagDetail, setTagDetail] = useState<ResponseTagDetailForUserFront | null>(null);

  const [events, setEvents] = useState<TMapTagEventWithEventInfo[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  const seenEventCodesRef = useRef<Set<string>>(new Set());
  const hydratedFromRestoreRef = useRef(false);

  // ✅ 수정: 복원된 이벤트를 매개변수로 받음
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
  
      const initItems = db?.mapTagEvent?.items ?? [];
      
      // ✅ 수정: restoredEvents 사용
      if (hydratedFromRestoreRef.current && restoredEvents) {
        console.log('[Tag Fetch] Hydrated from restore, merging with server data');
        console.log('[Tag Fetch] Restored events:', restoredEvents.length);
        console.log('[Tag Fetch] Server events:', initItems.length);
        
        const serverCodes = new Set(
          initItems.map(item => item?.event_info?.event_code ?? item?.event_code).filter(Boolean)
        );
        
        if (restoredEvents.length > LIST_LIMIT.default) {
          // ✅ 복원된 전체 이벤트에서 서버에 없는 것만 추출
          const extraLoadedEvents = restoredEvents.filter(item => {
            const code = item?.event_info?.event_code ?? item?.event_code;
            return code && !serverCodes.has(code);
          });
          
          console.log('[Tag Fetch] Extra loaded events (before date filter):', extraLoadedEvents.length);
          
          // ✅ 날짜 필터링 (과거 이벤트 제거)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const todayTimestamp = today.getTime();
          
          const futureExtraEvents = extraLoadedEvents.filter(item => {
            const eventDate = item.event_info?.date || item.date;
            
            if (eventDate) {
              const date = new Date(eventDate);
              return date.getTime() >= todayTimestamp;
            }
            return true; // 날짜 정보 없으면 일단 포함
          });
          
          console.log('[Tag Fetch] Future extra events (after date filter):', futureExtraEvents.length);
          
          const finalEvents = [...initItems, ...futureExtraEvents];
          console.log('[Tag Fetch] Final merged events:', finalEvents.length);
          
          setEvents(finalEvents);
          setEventsStart(finalEvents.length);
          
          seenEventCodesRef.current.clear();
          finalEvents.forEach(item => {
            const code = item?.event_info?.event_code ?? item?.event_code;
            if (code) seenEventCodesRef.current.add(code);
          });
        } else {
          // 더보기 안 한 경우: 서버 데이터만
          console.log('[Tag Fetch] No extra events, using server data');
          setEvents(initItems);
          setEventsStart(initItems.length);
          
          seenEventCodesRef.current.clear();
          initItems.forEach(item => {
            const code = item?.event_info?.event_code ?? item?.event_code;
            if (code) seenEventCodesRef.current.add(code);
          });
        }
      } else {
        // 복원 없음: 서버 데이터만
        console.log('[Tag Fetch] No restore, using server data');
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
  
  const handleShareClick = async () => {
    const shareData = {
      title: tagDetail?.tag.tag || "이벤트 세트 공유",
      text: tagDetail?.tag.tag || "이벤트 세트 정보를 확인해보세요!",
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
      const tagId = tagDetail?.tag.id;
      if (!tagId) {
        console.warn("tagDetail?.tag.id is not defined");
        return;
      }

      const res = await reqGetTagEvents(tagId, eventsStart, LIST_LIMIT.default);
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

  // ✅ 수정: 복원된 데이터를 fetchTagDetail에 전달
  useEffect(() => {
    console.log('[Tag Mount] Component mounted, attempting restore...');
    const saved = restorePage<TagPageState>(STATE_KEY);
    
    console.log('[Tag Mount] Restored data:', {
      hasSaved: !!saved,
      eventsCount: saved?.events?.length || 0,
    });
    
    if (saved && saved.events && saved.events.length > 0) {
      console.log('[Tag Mount] Restoring state with', saved.events.length, 'events');
      hydratedFromRestoreRef.current = true;
      setEvents(saved.events);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
      
      // ✅ 복원된 이벤트를 전달
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

      savePage<TagPageState>(STATE_KEY, {
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      });
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [events, eventsStart, eventsHasMore, savePage, STATE_KEY]);

  // 새로고침/탭 숨김 시 저장
  useEffect(() => {
    const persist = () =>
      savePage<TagPageState>(STATE_KEY, {
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
          <h2 className="text-2xl font-bold mb-4">Tag Not Found</h2>
          <p className="text-gray-600 mb-6">해당 태그는 존재하지 않습니다.</p>
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
          <p className="text-gray-600 mb-6">Failed to load tag details. Please try again.</p>
          <button
            onClick={() => fetchTagDetail()}
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
      <div id="tag-title" className="text-center font-extrabold text-3xl" data-tag-code={tagDetail?.tag.tag_code}>
        {tagDetail?.tag.tag}
      </div>

      {events?.length ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {events.map((item) => (
            <CompCommonDdayItem
              key={item.event_info?.event_code ?? item.event_code}
              event={item}
              fullLocale={fullLocale}
            />
          ))}

          {eventsHasMore && <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} />}
        </div>
      ) : null}
    </div>
  );
}