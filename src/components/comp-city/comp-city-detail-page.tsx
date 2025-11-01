"use client";

import { reqGetCityDetail, reqGetCityEvents } from "@/actions/action";
import {
  LIST_LIMIT,
  ResponseCityDetailForUserFront,
  SUPPORT_LANG_CODES,
  TMapCityEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react"; // ✅ useRef 추가
import { getCityImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { CompLoadMore } from "../comp-common/comp-load-more";
import { HeroImageBackgroundCarouselCity } from "../comp-image/hero-background-carousel-city";
import { useCityPageRestoration } from "@/contexts/scroll-restoration-context"; // ✅ 추가

// ✅ 복원할 상태 타입
type CityPageState = {
  events: TMapCityEventWithEventInfo[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

export default function CompCityDetailPage({
  cityCode,
  langCode,
  fullLocale,
}: {
  cityCode: string;
  langCode: string;
  fullLocale: string;
}) {
  const router = useRouter();

  // ✅ 도시 키 기반 복원 훅
  const { save, restore } = useCityPageRestoration(cityCode);

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(true);

  const [cityDetail, setCityDetail] = useState<ResponseCityDetailForUserFront | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [events, setEvents] = useState<TMapCityEventWithEventInfo[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ✅ Set은 렌더와 무관하므로 ref로 관리 (불필요 리렌더 방지)
  const seenEventCodesRef = useRef<Set<string>>(new Set());

  // ✅ 복원으로 하이드레이트 되었는지 표시
  const hydratedFromRestoreRef = useRef(false);

  const fetchCityDetail = async () => {
    try {
      const res = await reqGetCityDetail(cityCode, langCode, 0, LIST_LIMIT.default);
  
      const isEmptyObj =
        !res?.dbResponse ||
        (typeof res?.dbResponse === "object" &&
          !Array.isArray(res?.dbResponse) &&
          Object.keys(res?.dbResponse).length === 0);
  
      if (!res?.success || isEmptyObj || !res?.dbResponse?.city) {
        setError("not-found");
        setLoading(false);
        return;
      }
  
      setCityDetail(res.dbResponse);
      setImageUrls(getCityImageUrls(res.dbResponse.city));
  
      // ✅ 수정: 복원된 데이터가 없을 때만 이벤트 초기화
      if (!hydratedFromRestoreRef.current) {
        const initItems = res?.dbResponse?.mapCityEvent?.items ?? [];
        setEvents(initItems);
        setEventsStart(initItems.length);
        setEventsHasMore(Boolean(res?.dbResponse?.mapCityEvent?.hasMore));
  
        seenEventCodesRef.current.clear();
        for (const it of initItems) {
          const code = it?.event_info?.event_code ?? it?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        }
      }
      // ✅ 복원된 경우: 이벤트 데이터는 그대로 두고, hasMore만 업데이트
      else {
        const serverTotal = res?.dbResponse?.mapCityEvent?.total ?? 0;
        setEventsHasMore(events.length < serverTotal);
      }
  
      setError(null);
    } catch (e) {
      console.error("Failed to fetch city detail:", e);
      setError("network");
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = async () => {
    const shareData = {
      title: cityDetail?.city.name || "이벤트 세트 공유",
      text: cityDetail?.city.name || "이벤트 세트 정보를 확인해보세요!",
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
      const res = await reqGetCityEvents(cityCode, eventsStart, LIST_LIMIT.default);
      const fetchedItems = res?.dbResponse?.items ?? [];
      const newItems = fetchedItems.filter((it: TMapCityEventWithEventInfo) => {
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

  // ✅ ① 마운트 시 복원: 있으면 즉시 렌더(플래시 제거), 이후 서버 최신화
  useEffect(() => {
    const saved = restore<CityPageState>();
    if (saved && saved.events && saved.events.length > 0) {  // ✅ 빈 배열 체크 추가
      hydratedFromRestoreRef.current = true;
      setEvents(saved.events);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
    }
    fetchCityDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cityCode]);

  // ✅ ② 라우팅 직전 저장(pointerdown 캡처 단계)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) return;

      save<CityPageState>({
        events,
        eventsStart,
        eventsHasMore,
        seenEventCodes: Array.from(seenEventCodesRef.current),
      });
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [events, eventsStart, eventsHasMore, save]);

  // ✅ ③ 새로고침/탭 숨김 시에도 저장(권장)
  useEffect(() => {
    const persist = () =>
      save<CityPageState>({
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
          <h2 className="text-2xl font-bold mb-4">City Not Found</h2>
          <p className="text-gray-600 mb-6">해당 도시는 존재하지 않습니다.</p>
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
          <p className="text-gray-600 mb-6">Failed to load city details. Please try again.</p>
          <button
            onClick={() => fetchCityDetail()}
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
      <HeroImageBackgroundCarouselCity
        bucket="cities"
        imageUrls={imageUrls}
        interval={5000}
        cityDetail={cityDetail?.city || null}
        langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
      />

      {events?.length ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {events.map((item) => (
            <CompCommonDdayItem key={item.event_info?.event_code ?? item.event_code} event={item} fullLocale={fullLocale} />
          ))}

          {eventsHasMore && <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} />}
        </div>
      ) : null}
    </div>
  );
}
