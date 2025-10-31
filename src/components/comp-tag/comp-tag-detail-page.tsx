"use client";

import { reqGetTagDetail, reqGetTagEvents } from "@/actions/action";
import {
  LIST_LIMIT,
  ResponseTagDetailForUserFront,
  TMapTagEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react"; // ✅ useRef 추가
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { CompLoadMore } from "../comp-common/comp-load-more";
import { useScrollRestoration } from "@/contexts/scroll-restoration-context"; // ✅ 추가

// ✅ 복원할 상태 타입
type TagPageState = {
  events: TMapTagEventWithEventInfo[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

/**
 * Tag 상세 페이지
 */
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

  // ✅ 페이지 상태 저장/복원
  const { savePage, restorePage } = useScrollRestoration();
  const STATE_KEY = `dplus:tag-${tagCode}`;

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(true);

  const [tagDetail, setTagDetail] = useState<ResponseTagDetailForUserFront | null>(null);

  const [events, setEvents] = useState<TMapTagEventWithEventInfo[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ✅ 렌더 비의존 자료구조는 ref로
  const seenEventCodesRef = useRef<Set<string>>(new Set());
  const hydratedFromRestoreRef = useRef(false); // ✅ 복원 여부

  const fetchTagDetail = async () => {
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

      // ✅ 복원으로 이미 채워졌다면 초기화로 덮지 않음
      if (!hydratedFromRestoreRef.current) {
        const initItems = db?.mapTagEvent?.items ?? [];
        setEvents(initItems);
        setEventsStart(initItems.length);
        setEventsHasMore(Boolean(db?.mapTagEvent?.hasMore));

        seenEventCodesRef.current.clear();
        for (const it of initItems) {
          const code = it?.event_info?.event_code ?? it?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        }
      }

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
      const tagId = tagDetail?.tag.id; // ✅ 안전가드
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

  // ✅ ① 마운트 시 복원 → 있으면 즉시 렌더 후 서버 최신화
  useEffect(() => {
    const saved = restorePage<TagPageState>(STATE_KEY);
    if (saved) {
      hydratedFromRestoreRef.current = true;
      setEvents(saved.events ?? []);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
    }
    fetchTagDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagCode]);

  // ✅ ② 라우팅 직전 상태 저장(pointerdown capture)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) return;

      savePage<TagPageState>(STATE_KEY, {
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      });
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [events, eventsStart, eventsHasMore, savePage]);

  // ✅ ③ 새로고침/탭 숨김 시 상태 저장
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
