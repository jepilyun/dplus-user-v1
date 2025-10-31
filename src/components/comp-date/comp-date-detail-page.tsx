"use client";

import { reqGetDateList } from "@/actions/action";
import { LIST_LIMIT, TEventCardForDateDetail } from "dplus_common_v1";
import { useEffect, useRef, useState } from "react"; // ✅ useRef 추가
import { useRouter } from "next/navigation";
import { CompLoadMore } from "../comp-common/comp-load-more";
import DateNavigation from "./comp-date-navigation";
import CompCommonDdayItemForDate from "../comp-common/comp-common-dday-item-for-date";
import { useScrollRestoration } from "@/contexts/scroll-restoration-context"; // ✅ 추가

// ✅ 복원할 상태 타입
type DatePageState = {
  events: TEventCardForDateDetail[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

/**
 * Date 상세 페이지
 * @param param0 - 날짜, 언어 코드, 전체 로케일
 */
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

  // ✅ 페이지 키 (네임스페이스 포함 권장)
  const { savePage, restorePage } = useScrollRestoration();
  const STATE_KEY = `dplus:date-${countryCode}-${dateString}`;

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(true);

  const [events, setEvents] = useState<TEventCardForDateDetail[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ✅ Set은 리렌더 불필요 → ref로 관리
  const seenEventCodesRef = useRef<Set<string>>(new Set());

  // ✅ 복원으로 하이드레이트 여부
  const hydratedFromRestoreRef = useRef(false);

  const fetchDateDetail = async () => {
    try {
      const res = await reqGetDateList(countryCode, dateString, 0, LIST_LIMIT.default);

      // 응답은 있지만 데이터가 없는 경우 (404)
      if (!res?.dbResponse || !res?.dbResponse?.items) {
        setError("not-found");
        setLoading(false);
        return;
      }

      // ✅ 복원으로 이미 채웠으면 서버 응답으로 초기화하지 않음
      if (!hydratedFromRestoreRef.current) {
        const initItems = res?.dbResponse?.items ?? [];
        setEvents(initItems);
        setEventsStart(initItems.length);
        setEventsHasMore(Boolean(res?.dbResponse?.hasMore));

        seenEventCodesRef.current.clear();
        for (const it of initItems) {
          const code = it?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        }
      }

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

  // ✅ ① 마운트 시 복원 → 있으면 즉시 렌더 후 서버 최신화
  useEffect(() => {
    const saved = restorePage<DatePageState>(STATE_KEY);
    if (saved) {
      hydratedFromRestoreRef.current = true;
      setEvents(saved.events ?? []);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false); // 플래시 방지
    }
    fetchDateDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, dateString]);

  // ✅ ② 라우팅 직전(링크 클릭) 저장 — pointerdown capture 단계
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
  }, [events, eventsStart, eventsHasMore, savePage]);

  // ✅ ③ 새로고침/탭 숨김 시에도 저장 (권장)
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
      {/* 날짜 네비게이션 */}
      <DateNavigation currentDate={dateString} langCode={langCode} />

      {/* 이벤트 목록 */}
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
