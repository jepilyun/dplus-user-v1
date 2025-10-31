"use client";

import { reqGetStagDetail, reqGetStagEvents } from "@/actions/action";
import {
  LIST_LIMIT,
  ResponseStagDetailForUserFront,
  SUPPORT_LANG_CODES,
  TMapStagEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react"; // ✅ useRef 추가
import { getStagImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { CompLoadMore } from "../comp-common/comp-load-more";
import { HeroImageBackgroundCarouselStag } from "../comp-image/hero-background-carousel-stag";
import { useScrollRestoration } from "@/contexts/scroll-restoration-context"; // ✅ 추가

// ✅ 복원할 상태 타입
type StagPageState = {
  events: TMapStagEventWithEventInfo[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

/**
 * Stag 상세 페이지
 */
export default function CompStagDetailPage({
  stagCode,
  langCode,
  fullLocale,
}: {
  stagCode: string;
  langCode: string;
  fullLocale: string;
}) {
  const router = useRouter();

  // ✅ 페이지 상태 저장/복원 키
  const { savePage, restorePage } = useScrollRestoration();
  const STATE_KEY = `dplus:stag-${stagCode}`;

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(true);

  const [stagDetail, setStagDetail] = useState<ResponseStagDetailForUserFront | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [events, setEvents] = useState<TMapStagEventWithEventInfo[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ✅ 렌더와 무관한 자료구조는 ref로
  const seenEventCodesRef = useRef<Set<string>>(new Set());
  // ✅ 복원으로 하이드레이트 여부
  const hydratedFromRestoreRef = useRef(false);

  const fetchStagDetail = async () => {
    try {
      const res = await reqGetStagDetail(stagCode, 0, LIST_LIMIT.default);

      const isEmptyObj =
        !res?.dbResponse ||
        (typeof res?.dbResponse === "object" &&
          !Array.isArray(res?.dbResponse) &&
          Object.keys(res?.dbResponse).length === 0);

      if (!res?.success || isEmptyObj || !res?.dbResponse?.stag) {
        setError("not-found");
        setLoading(false);
        return;
      }

      setStagDetail(res.dbResponse);
      setImageUrls(getStagImageUrls(res.dbResponse.stag));

      // ✅ 복원으로 이미 채워졌으면 서버 초기화로 덮지 않음
      if (!hydratedFromRestoreRef.current) {
        const initItems = res?.dbResponse?.mapStagEvent?.items ?? [];
        setEvents(initItems);
        setEventsStart(initItems.length);
        setEventsHasMore(Boolean(res?.dbResponse?.mapStagEvent?.hasMore));

        seenEventCodesRef.current.clear();
        for (const it of initItems) {
          const code = it?.event_info?.event_code ?? it?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        }
      }

      setError(null);
    } catch (e) {
      console.error("Failed to fetch stag detail:", e);
      setError("network");
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = async () => {
    const shareData = {
      title: stagDetail?.stag.stag || "이벤트 세트 공유",
      text: stagDetail?.stag.stag_native || "이벤트 세트 정보를 확인해보세요!",
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
      const res = await reqGetStagEvents(stagCode, eventsStart, LIST_LIMIT.default);
      const fetchedItems = res?.dbResponse?.items ?? [];
      const newItems = fetchedItems.filter((it: TMapStagEventWithEventInfo) => {
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
    const saved = restorePage<StagPageState>(STATE_KEY);
    if (saved) {
      hydratedFromRestoreRef.current = true;
      setEvents(saved.events ?? []);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
    }
    fetchStagDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stagCode]);

  // ✅ ② 라우팅 직전 저장(pointerdown capture)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) return;

      savePage<StagPageState>(STATE_KEY, {
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
      savePage<StagPageState>(STATE_KEY, {
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

  // Stag를 찾을 수 없는 경우 - 인라인 에러 표시
  if (error === "not-found") {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Stag Not Found</h2>
          <p className="text-gray-600 mb-6">해당 스태그는 존재하지 않습니다.</p>
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

  // 네트워크 에러 - 재시도 옵션 제공
  if (error === "network") {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">ERROR</h2>
          <p className="text-gray-600 mb-6">Failed to load stag details. Please try again.</p>
          <button
            onClick={() => fetchStagDetail()}
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
      <HeroImageBackgroundCarouselStag
        bucket="stags"
        imageUrls={imageUrls}
        interval={5000}
        stagDetail={stagDetail?.stag || null}
        langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
      />

      {events?.length ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex_col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
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
