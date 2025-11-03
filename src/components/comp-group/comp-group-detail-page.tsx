"use client";

import { reqGetGroupDetail, reqGetGroupEvents } from "@/actions/action";
import {
  LIST_LIMIT,
  ResponseGroupDetailForUserFront,
  SUPPORT_LANG_CODES,
  TMapGroupEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react"; // ✅ useRef 추가
import { getGroupImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { CompLoadMore } from "../comp-common/comp-load-more";
import { HeroImageBackgroundCarouselGroup } from "../comp-image/hero-background-carousel-group";
import { useScrollRestoration } from "@/contexts/scroll-restoration-context"; // ✅ 추가

// ✅ 복원할 상태 타입
type GroupPageState = {
  events: TMapGroupEventWithEventInfo[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

/**
 * Group 상세 페이지
 */
export default function CompGroupDetailPage({
  groupCode,
  langCode,
  fullLocale,
}: {
  groupCode: string;
  langCode: string;
  fullLocale: string;
}) {
  const router = useRouter();

  // ✅ 페이지 상태 저장/복원 (고유 키)
  const { savePage, restorePage } = useScrollRestoration();
  const STATE_KEY = `dplus:group-${groupCode}`;

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(true);

  const [groupDetail, setGroupDetail] = useState<ResponseGroupDetailForUserFront | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [events, setEvents] = useState<TMapGroupEventWithEventInfo[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ✅ 렌더 비의존 자료구조 ref로 관리
  const seenEventCodesRef = useRef<Set<string>>(new Set());
  // ✅ 복원 여부
  const hydratedFromRestoreRef = useRef(false);

  const fetchGroupDetail = async () => {
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
      
      // ✅ 수정: 서버 데이터로 시작, 복원된 추가 로드 데이터만 병합
      if (hydratedFromRestoreRef.current && events.length > LIST_LIMIT.default) {
        // 사용자가 "더보기"로 추가 로드한 이벤트들만 보존
        const serverCodes = new Set(
          initItems.map(item => item?.event_info?.event_code ?? item?.event_code).filter(Boolean)
        );
        
        // 초기 로드(36개) 이후의 이벤트 중 서버에 없는 것만 보존
        const extraLoadedEvents = events.slice(LIST_LIMIT.default).filter(item => {
          const code = item?.event_info?.event_code ?? item?.event_code;
          return code && !serverCodes.has(code);
        });
        
        const finalEvents = [...initItems, ...extraLoadedEvents];
        setEvents(finalEvents);
        setEventsStart(finalEvents.length);
        
        seenEventCodesRef.current.clear();
        finalEvents.forEach(item => {
          const code = item?.event_info?.event_code ?? item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      } else {
        // 기본 케이스: 서버 데이터만 사용
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

  // ✅ ① 마운트 시 복원 → 있으면 즉시 렌더(플래시 방지) 후 서버 최신화
  useEffect(() => {
    const saved = restorePage<GroupPageState>(STATE_KEY);
    if (saved && saved.events && saved.events.length > 0) {  // ✅ 빈 배열 체크 추가
      hydratedFromRestoreRef.current = true;
      setEvents(saved.events);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
    }
    fetchGroupDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupCode]);

  // ✅ ② 라우팅 직전 저장(pointerdown capture)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) return;

      savePage<GroupPageState>(STATE_KEY, {
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      });
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [events, eventsStart, eventsHasMore, savePage]);

  // ✅ ③ 새로고침/탭 숨김 시 저장
  useEffect(() => {
    const persist = () =>
      savePage<GroupPageState>(STATE_KEY, {
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
  }, [events, eventsStart, eventsHasMore, savePage]);

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
      <div className="mx-auto w-full max-w/[1024px] px-4 py-20">
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
