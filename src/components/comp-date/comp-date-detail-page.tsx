"use client";

import { reqGetDateList } from "@/actions/action";
import { LIST_LIMIT, TEventCardForDateDetail } from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CompLoadMore } from "../comp-common/comp-load-more";
import DateNavigation from "./comp-date-navigation";
import CompCommonDdayItemForDate from "../comp-common/comp-common-dday-item-for-date";
import { useScrollRestoration } from "@/contexts/scroll-restoration-context";

type DatePageState = {
  events: TEventCardForDateDetail[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

export default function CompDateDetailPage({
  dateString,
  countryCode,
  langCode,
  fullLocale,
}: {
  dateString: string;
  countryCode: string;
  langCode: string;
  fullLocale: string;
}) {
  const router = useRouter();

  const { savePage, restorePage } = useScrollRestoration();
  const STATE_KEY = `dplus:date-${countryCode}-${dateString}`;

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(true);

  const [events, setEvents] = useState<TEventCardForDateDetail[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  const seenEventCodesRef = useRef<Set<string>>(new Set());
  const hydratedFromRestoreRef = useRef(false);

  const fetchDateDetail = async () => {
    try {
      const res = await reqGetDateList(countryCode, dateString, 0, LIST_LIMIT.default);
  
      if (!res?.dbResponse || !res?.dbResponse?.items) {
        setError("not-found");
        setLoading(false);
        return;
      }
  
      const initItems = res?.dbResponse?.items ?? [];
      
      // ✅ 수정: 서버 데이터로 시작, 복원된 추가 로드 데이터만 병합
      if (hydratedFromRestoreRef.current && events.length > LIST_LIMIT.default) {
        // 사용자가 "더보기"로 추가 로드한 이벤트들만 보존
        const serverCodes = new Set(
          initItems.map(item => item?.event_code).filter(Boolean)
        );
        
        // 초기 로드(36개) 이후의 이벤트 중 서버에 없는 것만 보존
        const extraLoadedEvents = events.slice(LIST_LIMIT.default).filter(item => {
          const code = item?.event_code;
          return code && !serverCodes.has(code);
        });
        
        const finalEvents = [...initItems, ...extraLoadedEvents];
        setEvents(finalEvents);
        setEventsStart(finalEvents.length);
        
        seenEventCodesRef.current.clear();
        finalEvents.forEach(item => {
          const code = item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      } else {
        // 기본 케이스: 서버 데이터만 사용
        setEvents(initItems);
        setEventsStart(initItems.length);
        
        seenEventCodesRef.current.clear();
        initItems.forEach(item => {
          const code = item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      }
      
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));
      setError(null);
    } catch (e) {
      console.error("Failed to fetch date detail:", e);
      setError("network");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreEvents = async () => {
    if (eventsLoading || !eventsHasMore) return;
    setEventsLoading(true);

    try {
      const res = await reqGetDateList(countryCode, dateString, eventsStart, LIST_LIMIT.default);
      const fetchedItems = res?.dbResponse?.items ?? [];
      const newItems = fetchedItems.filter((it: TEventCardForDateDetail) => {
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

  // ✅ 수정: 마운트 시 복원 + 최신 데이터 동기화
  useEffect(() => {
    const saved = restorePage<DatePageState>(STATE_KEY);
    
    // 복원 데이터가 있고 이벤트가 있으면 즉시 화면에 표시
    if (saved && saved.events && saved.events.length > 0) {
      hydratedFromRestoreRef.current = true;
      setEvents(saved.events);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false); // 복원 화면 먼저 보여줌
    }
    
    // 복원 유무와 무관하게 최신 데이터 가져오기 (백그라운드)
    fetchDateDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, dateString]);

  // ✅ 라우팅 직전 저장
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) return;

      savePage<DatePageState>(STATE_KEY, {
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      });
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [events, eventsStart, eventsHasMore, savePage, STATE_KEY]);

  // ✅ 새로고침/탭 숨김 시 저장
  useEffect(() => {
    const persist = () =>
      savePage<DatePageState>(STATE_KEY, {
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
          <h2 className="text-2xl font-bold mb-4">Date Not Found</h2>
          <p className="text-gray-600 mb-6">해당 날짜의 이벤트를 찾을 수 없습니다.</p>
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
          <p className="text-gray-600 mb-6">Failed to load date details. Please try again.</p>
          <button
            onClick={() => fetchDateDetail()}
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
      <DateNavigation currentDate={dateString} langCode={langCode} />

      {events?.length ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {events.map((item) => (
            <CompCommonDdayItemForDate key={item.event_code} event={item} fullLocale={fullLocale} />
          ))}
          {eventsHasMore && <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} />}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1024px] px-2 sm:px-4 lg:px-6 text-center py-12 text-gray-500">
          No events found for this date.
        </div>
      )}
    </div>
  );
}