"use client";

import { reqGetGroupDetail, reqGetGroupEvents } from "@/actions/action";
import {
  LIST_LIMIT,
  ResponseGroupDetailForUserFront,
  SUPPORT_LANG_CODES,
  TMapGroupEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { getGroupImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { CompLoadMore } from "../comp-common/comp-load-more";
import { HeroImageBackgroundCarouselGroup } from "../comp-image/hero-background-carousel-group";
import { useGroupPageRestoration } from "@/contexts/scroll-restoration-context"; // ✅ 변경

type GroupPageState = {
  events: TMapGroupEventWithEventInfo[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

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
  const router = useRouter();

  // ✅ 변경: 전용 hook 사용
  const { save, restore } = useGroupPageRestoration(groupCode);

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(!initialData); // ✅ 초기 데이터 있으면 false

  const [groupDetail, setGroupDetail] = useState<ResponseGroupDetailForUserFront | null>(
    initialData ?? null // ✅ 초기 데이터로 시작
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData ? getGroupImageUrls(initialData.group) : [] // ✅ 초기 이미지도 설정
  );

  const [events, setEvents] = useState<TMapGroupEventWithEventInfo[]>(
    initialData?.mapGroupEvent?.items ?? [] // ✅ 초기 이벤트도 설정
  );
  const [eventsStart, setEventsStart] = useState(
    initialData?.mapGroupEvent?.items?.length ?? 0 // ✅ 초기 시작점 설정
  );
  const [eventsHasMore, setEventsHasMore] = useState(
    Boolean(initialData?.mapGroupEvent?.hasMore) // ✅ 초기 hasMore 설정
  );
  const [eventsLoading, setEventsLoading] = useState(false);

  const seenEventCodesRef = useRef<Set<string>>(new Set());
  const hydratedFromRestoreRef = useRef(false);

  const fetchGroupDetail = async (restoredEvents?: TMapGroupEventWithEventInfo[]) => {
    // ✅ 초기 데이터가 있고 복원 데이터도 없으면 fetch 생략
    if (initialData && !restoredEvents) {
      setLoading(false);
      return;
    } 
   
    try {
      const res = await reqGetGroupDetail(groupCode, langCode, 0, LIST_LIMIT.default);
  
      const isEmptyObj =
        !res?.dbResponse ||
        (typeof res?.dbResponse === "object" &&
          !Array.isArray(res?.dbResponse) &&
          Object.keys(res?.dbResponse).length === 0);
  
      if (!res?.success || isEmptyObj || !res?.dbResponse?.group) {
        setError("not-found");
        setLoading(false);
        return;
      }
  
      setGroupDetail(res.dbResponse);
      setImageUrls(getGroupImageUrls(res.dbResponse.group));
  
      const initItems = res?.dbResponse?.mapGroupEvent?.items ?? [];
      
      // ✅ 핵심 수정: 복원 여부와 관계없이 항상 서버 최신 36개를 기준으로
      if (restoredEvents && restoredEvents.length > LIST_LIMIT.default) {
        console.log('[Group Fetch] Merging server data with restored pagination');
        console.log('[Group Fetch] Server events:', initItems.length);
        console.log('[Group Fetch] Restored total:', restoredEvents.length);
        
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
        
        console.log('[Group Fetch] Additional events from restore:', additionalEvents.length);
        
        // 오늘 이후 이벤트만 필터링
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        const futureEvents = additionalEvents.filter(item => {
          const eventDate = item.event_info?.date || item.date;
          
          if (eventDate) {
            const date = new Date(eventDate);
            return date.getTime() >= todayTimestamp;
          }
          return true;
        });
        
        console.log('[Group Fetch] Future events after filter:', futureEvents.length);
        
        // ✅ 서버 최신 36개 + 더보기로 로드한 이벤트들
        const finalEvents = [...initItems, ...futureEvents];
        
        console.log('[Group Fetch] Final merged:', {
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
        console.log('[Group Fetch] Using server data only');
        setEvents(initItems);
        setEventsStart(initItems.length);
        
        seenEventCodesRef.current.clear();
        initItems.forEach(item => {
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

  const handleShareClick = async () => {
    const shareData = {
      title: groupDetail?.group.name || "이벤트 세트 공유",
      text: groupDetail?.group.name_native || "이벤트 세트 정보를 확인해보세요!",
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
      const res = await reqGetGroupEvents(groupCode, eventsStart, LIST_LIMIT.default);
      const fetchedItems = res?.dbResponse?.items ?? [];
      const newItems = fetchedItems.filter((it: TMapGroupEventWithEventInfo) => {
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

  useEffect(() => {
    console.log('[Group Mount] Component mounted, attempting restore...');
    const saved = restore<GroupPageState>();
    
    console.log('[Group Mount] Restored data:', {
      hasSaved: !!saved,
      eventsCount: saved?.events?.length || 0,
    });
    
    if (saved && saved.events && saved.events.length > 0) {
      console.log('[Group Mount] Restoring state with', saved.events.length, 'events');
      hydratedFromRestoreRef.current = true;
      
      // ✅ 복원 데이터로 먼저 화면 표시 (스크롤 위치 복원을 위해)
      setEvents(saved.events);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
      
      // ✅ 백그라운드에서 서버 데이터 가져와서 업데이트
      fetchGroupDetail(saved.events);
    } else {
      console.log('[Group Mount] No valid saved data found');
      // ✅ 초기 데이터가 있으면 fetch 생략
      if (!initialData) {
        fetchGroupDetail();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupCode]);

  // 라우팅 직전 저장
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) return;

      console.log('[Group Save] Saving state:', {
        eventsCount: events.length,
        eventsStart,
        eventsHasMore,
      });

      save<GroupPageState>({
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
      save<GroupPageState>({
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
          <h2 className="text-2xl font-bold mb-4">Group Not Found</h2>
          <p className="text-gray-600 mb-6">해당 그룹은 존재하지 않습니다.</p>
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
          <p className="text-gray-600 mb-6">Failed to load group details. Please try again.</p>
          <button
            onClick={() => fetchGroupDetail()}
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
      <HeroImageBackgroundCarouselGroup
        bucket="groups"
        imageUrls={imageUrls}
        interval={5000}
        groupDetail={groupDetail?.group || null}
        langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
      />

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