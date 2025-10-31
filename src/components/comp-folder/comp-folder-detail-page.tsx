"use client";

import { reqGetFolderDetail, reqGetFolderEvents } from "@/actions/action";
import { HeroImageSlider } from "@/components/comp-image/hero-image-slider";
import {
  LIST_LIMIT,
  ResponseFolderDetailForUserFront,
  SUPPORT_LANG_CODES,
  TMapFolderEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react"; // ✅ useRef 추가
import { HeadlineTagsDetail } from "@/components/headline-tags-detail";
import CompLabelCount01 from "@/components/comp-common/comp-label-count-01";
import { getFolderImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { CompLoadMore } from "../comp-common/comp-load-more";
import { useScrollRestoration } from "@/contexts/scroll-restoration-context"; // ✅ 추가

// ✅ 복원할 상태 타입
type FolderPageState = {
  events: TMapFolderEventWithEventInfo[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

/**
 * 폴더 상세 페이지
 */
export default function CompFolderDetailPage({
  folderCode,
  langCode,
  fullLocale,
}: {
  folderCode: string;
  langCode: string;
  fullLocale: string;
}) {
  const router = useRouter();

  // ✅ 페이지별 상태 저장/복원 키
  const { savePage, restorePage } = useScrollRestoration();
  const STATE_KEY = `dplus:folder-${folderCode}`;

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(true);

  const [folderDetail, setFolderDetail] = useState<ResponseFolderDetailForUserFront | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const [events, setEvents] = useState<TMapFolderEventWithEventInfo[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // ✅ 렌더 독립 자료구조는 ref로
  const seenEventCodesRef = useRef<Set<string>>(new Set());
  // ✅ 복원 여부 플래그
  const hydratedFromRestoreRef = useRef(false);

  const fetchFolderDetail = async () => {
    try {
      const res = await reqGetFolderDetail(folderCode, 0, LIST_LIMIT.default);
      const db = res?.dbResponse;

      const isEmptyObj = !db || (typeof db === "object" && !Array.isArray(db) && Object.keys(db).length === 0);

      if (!res?.success || isEmptyObj || !db?.folder) {
        setError("not-found");
        setLoading(false);
        return;
      }

      setFolderDetail(db);
      setImageUrls(getFolderImageUrls(db.folder));

      // ✅ 복원으로 이미 채워졌다면 덮어쓰지 않음
      if (!hydratedFromRestoreRef.current) {
        const initItems = db?.folderEvent?.items ?? [];
        setEvents(initItems);
        setEventsStart(initItems.length);
        setEventsHasMore(Boolean(db?.folderEvent?.hasMore));

        seenEventCodesRef.current.clear();
        for (const it of initItems) {
          const code = it?.event_info?.event_code ?? it?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        }
      }

      setError(null);
    } catch (e) {
      console.error("Failed to fetch folder detail:", e);
      setError("network");
    } finally {
      setLoading(false);
    }
  };

  const handleShareClick = async () => {
    const shareData = {
      title: folderDetail?.folder.title || "이벤트 세트 공유",
      text: folderDetail?.folder.description || "이벤트 세트 정보를 확인해보세요!",
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
      const res = await reqGetFolderEvents(folderCode, eventsStart, LIST_LIMIT.default);
      const fetchedItems = res?.dbResponse?.items ?? [];
      const newItems = fetchedItems.filter((it: TMapFolderEventWithEventInfo) => {
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

  // ✅ ① 마운트 시 복원 → 있으면 즉시 렌더(플래시 방지), 이후 서버 최신화
  useEffect(() => {
    const saved = restorePage<FolderPageState>(STATE_KEY);
    if (saved) {
      hydratedFromRestoreRef.current = true;
      setEvents(saved.events ?? []);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
    }
    fetchFolderDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderCode]);

  // ✅ ② 라우팅 직전 저장(pointerdown capture)
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) return;

      savePage<FolderPageState>(STATE_KEY, {
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
      savePage<FolderPageState>(STATE_KEY, {
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
          <h2 className="text-2xl font-bold mb-4">Folder Not Found</h2>
          <p className="text-gray-600 mb-6">해당 폴더는 존재하지 않습니다.</p>
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
          <p className="text-gray-600 mb-6">Failed to load folder details. Please try again.</p>
          <button
            onClick={() => fetchFolderDetail()}
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
      <HeadlineTagsDetail
        targetCountryCode={folderDetail?.folder.target_country_code || null}
        targetCountryName={folderDetail?.folder.target_country_native || null}
        targetCityCode={folderDetail?.folder.target_city_code || null}
        targetCityName={folderDetail?.folder.target_city_native || null}
        categories={folderDetail?.mapCategoryFolder?.items ?? null}
        langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
      />

      <div id="folder-title" className="text-center font-extrabold text-3xl" data-folder-code={folderDetail?.folder.folder_code}>
        {folderDetail?.folder.title}
      </div>

      <HeroImageSlider bucket="folders" imageUrls={imageUrls} className="m-auto w-full flex max-w-[1440px]" />

      {folderDetail?.folder.description && (
        <div className="m-auto p-4 px-8 w-full text-lg max-w-[1024px] whitespace-pre-line">
          {folderDetail?.folder.description}
        </div>
      )}

      <div className="flex gap-4 justify-center">
        <CompLabelCount01 label="Views" count={folderDetail?.folder.view_count ?? 0} />
        <CompLabelCount01 label="Shared" count={folderDetail?.folder.shared_count ?? 0} />
      </div>

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
