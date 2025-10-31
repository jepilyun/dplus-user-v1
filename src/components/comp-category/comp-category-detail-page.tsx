"use client";

import { reqGetCategoryDetail, reqGetCategoryEvents } from "@/actions/action";
import {
  LIST_LIMIT,
  ResponseCategoryDetailForUserFront,
  TMapCategoryEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react"; // ✅ useRef 추가
import { useRouter } from "next/navigation";
import { CompLoadMore } from "../comp-common/comp-load-more";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { useScrollRestoration } from "@/contexts/scroll-restoration-context"; // ✅ 추가

// ✅ 복원할 상태 타입
type CategoryPageState = {
  events: TMapCategoryEventWithEventInfo[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

export default function CompCategoryDetailPage({
  categoryCode,
  countryCode,
  langCode,
  fullLocale,
}: {
  categoryCode: string;
  countryCode: string;
  langCode: string;
  fullLocale: string;
}) {
  const router = useRouter();

  // ✅ 커스텀 키로 저장/복원 (프로젝트 네임스페이스 포함 권장)
  const { savePage, restorePage } = useScrollRestoration();
  const STATE_KEY = `dplus:category-${countryCode}-${categoryCode}`;

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(true);

  const [categoryDetail, setCategoryDetail] = useState<ResponseCategoryDetailForUserFront | null>(null);
  const [events, setEvents] = useState<TMapCategoryEventWithEventInfo[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ✅ Set은 렌더링 비의존이므로 ref로 관리
  const seenEventCodesRef = useRef<Set<string>>(new Set());

  // ✅ 복원으로 하이드레이트 되었는지 플래그
  const hydratedFromRestoreRef = useRef(false);

  const fetchCategoryDetail = async () => {
    try {
      const res = await reqGetCategoryDetail(countryCode, categoryCode, 0, LIST_LIMIT.default, langCode);

      if (!res?.dbResponse || !res?.dbResponse?.category) {
        setError("not-found");
        setLoading(false);
        return;
      }

      setCategoryDetail(res.dbResponse);

      // ✅ 복원 없이 첫 진입일 때만 서버 응답으로 초기화
      if (!hydratedFromRestoreRef.current) {
        const initItems = res?.dbResponse?.mapCategoryEvent?.items ?? [];
        setEvents(initItems);
        setEventsStart(initItems.length);
        setEventsHasMore(Boolean(res?.dbResponse?.mapCategoryEvent?.hasMore));
        for (const it of initItems) {
          const code = it?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        }
      }

      setError(null);
    } catch (e) {
      console.error("Failed to fetch category detail:", e);
      setError("network");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreEvents = async () => {
    if (eventsLoading || !eventsHasMore) return;
    setEventsLoading(true);

    try {
      const res = await reqGetCategoryEvents(countryCode, categoryCode, eventsStart, LIST_LIMIT.default);
      const fetchedItems = res?.dbResponse?.items ?? [];
      const newItems = fetchedItems.filter((it: TMapCategoryEventWithEventInfo) => {
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

  // ✅ ① 마운트 시 복원 → 있으면 즉시 렌더(플래시 방지), 이후 최신 데이터 동기화
  useEffect(() => {
    const saved = restorePage<CategoryPageState>(STATE_KEY);
    if (saved) {
      hydratedFromRestoreRef.current = true;
      setEvents(saved.events ?? []);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false); // 복원 화면 먼저 보여줌
    }
    // saved 유무와 관계없이 서버 최신 데이터로 동기화
    fetchCategoryDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryCode, countryCode]);

  // ✅ ② 라우팅 직전 저장 (pointerdown capture 단계에서 안전하게)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) return;

      savePage<CategoryPageState>(STATE_KEY, {
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      });
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [events, eventsStart, eventsHasMore, savePage]);

  // ✅ ③ 새로고침/백그라운드 전환 시 저장 (권장)
  useEffect(() => {
    const persist = () =>
      savePage<CategoryPageState>(STATE_KEY, {
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

  // ========================= 렌더 =========================

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
          <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
          <p className="text-gray-600 mb-6">해당 카테고리는 존재하지 않습니다.</p>
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
        <p className="text-gray-600 mb-6">Failed to load category details. Please try again.</p>
          <button
            onClick={() => fetchCategoryDetail()}
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
      <div>
        {categoryDetail?.i18n?.name ? (
          <div className="text-center font-extrabold">
            <div className="text-3xl">{categoryDetail?.i18n?.name}</div>
            <div className="text-gray-400 text-lg font-thin">{categoryDetail?.category?.name}</div>
          </div>
        ) : (
          <div className="text-center font-extrabold">
            <div className="text-3xl">{categoryDetail?.category?.name}</div>
          </div>
        )}
      </div>

      {/* 이벤트 목록 */}
      {events?.length ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {events.map((item) => (
            <CompCommonDdayItem key={item.event_code} event={item} fullLocale={fullLocale} />
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
