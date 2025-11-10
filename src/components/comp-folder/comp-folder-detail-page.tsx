"use client";

import { reqGetFolderDetail, reqGetFolderEvents } from "@/actions/action";
import { HeroImageSlider } from "@/components/comp-image/hero-image-slider";
import {
  LIST_LIMIT,
  ResponseFolderDetailForUserFront,
  SUPPORT_LANG_CODES,
  TMapFolderEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { HeadlineTagsDetail } from "@/components/headline-tags-detail";
import CompLabelCount01 from "@/components/comp-common/comp-label-count-01";
import { getFolderImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { CompLoadMore } from "../comp-common/comp-load-more";
import { useFolderPageRestoration } from "@/contexts/scroll-restoration-context"; // ✅ 변경
import { incrementFolderSharedCount, incrementFolderViewCount } from "@/utils/increment-count";

type FolderPageState = {
  events: TMapFolderEventWithEventInfo[];
  eventsStart: number;
  eventsHasMore: boolean;
  seenEventCodes: string[];
};

export default function CompFolderDetailPage({
  folderCode,
  langCode,
  fullLocale,
  initialData,
}: {
  folderCode: string;
  langCode: string;
  fullLocale: string;
  initialData: ResponseFolderDetailForUserFront | null;
}) {
  const router = useRouter();

  // ✅ 변경: 전용 hook 사용
  const { save, restore } = useFolderPageRestoration(folderCode);

  // ✅ 조회수 증가 여부 추적
  const viewCountIncrementedRef = useRef(false);

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(!initialData); // ✅ 초기 데이터 있으면 false

  const [folderDetail, setFolderDetail] = useState<ResponseFolderDetailForUserFront | null>(
    initialData ?? null
  );
  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData ? getFolderImageUrls(initialData.folder) : []
  );

  const [events, setEvents] = useState<TMapFolderEventWithEventInfo[]>(
    initialData?.folderEvent?.items ?? []
  );
  const [eventsStart, setEventsStart] = useState(
    initialData?.folderEvent?.items?.length ?? 0
  );
  const [eventsHasMore, setEventsHasMore] = useState(
    Boolean(initialData?.folderEvent?.hasMore)
  );
  const [eventsLoading, setEventsLoading] = useState(false);

  const seenEventCodesRef = useRef<Set<string>>(new Set());
  const hydratedFromRestoreRef = useRef(false);

  // ✅ 로컬 카운트 상태 (낙관적 업데이트용)
  const [viewCount, setViewCount] = useState(initialData?.folder.view_count ?? 0);
  const [sharedCount, setSharedCount] = useState(initialData?.folder.shared_count ?? 0);

  const fetchFolderDetail = async (restoredEvents?: TMapFolderEventWithEventInfo[]) => {
    // ✅ 초기 데이터가 있고 복원 데이터도 없으면 fetch 생략
    if (initialData && !restoredEvents) {
      setLoading(false);
      return;
    }

    try {
      const res = await reqGetFolderDetail(folderCode, langCode, 0, LIST_LIMIT.default);
      const db = res?.dbResponse;

      const isEmptyObj = !db || (typeof db === "object" && !Array.isArray(db) && Object.keys(db).length === 0);

      if (!res?.success || isEmptyObj || !db?.folder) {
        setError("not-found");
        setLoading(false);
        return;
      }

      setFolderDetail(db);
      setImageUrls(getFolderImageUrls(db.folder));

      const initItems = db?.folderEvent?.items ?? [];
      
      // ✅ 핵심 수정: 복원 여부와 관계없이 항상 서버 최신 36개를 기준으로
      if (restoredEvents && restoredEvents.length > LIST_LIMIT.default) {
        console.log('[Folder Fetch] Merging server data with restored pagination');
        console.log('[Folder Fetch] Server events:', initItems.length);
        console.log('[Folder Fetch] Restored total:', restoredEvents.length);
        
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
        
        console.log('[Folder Fetch] Additional events from restore:', additionalEvents.length);
        
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
        
        console.log('[Folder Fetch] Future events after filter:', futureEvents.length);
        
        // ✅ 서버 최신 36개 + 더보기로 로드한 이벤트들
        const finalEvents = [...initItems, ...futureEvents];
        
        console.log('[Folder Fetch] Final merged:', {
          server: initItems.length,
          additional: futureEvents.length,
          total: finalEvents.length
        });
        
        setEvents(finalEvents);
        setEventsStart(finalEvents.length);

        // ✅ view_count 업데이트
        setViewCount(db?.folder?.view_count ?? 0);
        setSharedCount(db?.folder?.shared_count ?? 0);

        seenEventCodesRef.current.clear();
        finalEvents.forEach(item => {
          const code = item?.event_info?.event_code ?? item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      } else {
        // 더보기를 안 한 경우: 서버 데이터만 사용
        console.log('[Folder Fetch] Using server data only');
        setEvents(initItems);
        setEventsStart(initItems.length);
        
        seenEventCodesRef.current.clear();
        initItems.forEach(item => {
          const code = item?.event_info?.event_code ?? item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      }
      
      setEventsHasMore(Boolean(db?.folderEvent?.hasMore));
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
        console.log('공유 성공');
        
        // ✅ 공유 성공 시 카운트 증가
        const newCount = await incrementFolderSharedCount(folderCode);
        if (newCount !== null) {
          setSharedCount(newCount);
        }
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

  // 페이지 진입 시
  useEffect(() => {
    if (!viewCountIncrementedRef.current && folderCode) {
      viewCountIncrementedRef.current = true;
      incrementFolderViewCount(folderCode).then(newCount => {
        if (newCount !== null) setViewCount(newCount);
      });
    }
  }, [folderCode]);

  useEffect(() => {
    console.log('[Folder Mount] Component mounted, attempting restore...');
    const saved = restore<FolderPageState>();
    
    console.log('[Folder Mount] Restored data:', {
      hasSaved: !!saved,
      eventsCount: saved?.events?.length || 0,
    });
    
    if (saved && saved.events && saved.events.length > 0) {
      console.log('[Folder Mount] Restoring state with', saved.events.length, 'events');
      hydratedFromRestoreRef.current = true;
      
      // ✅ 복원 데이터로 먼저 화면 표시 (스크롤 위치 복원을 위해)
      setEvents(saved.events);
      setEventsStart(saved.eventsStart ?? 0);
      setEventsHasMore(Boolean(saved.eventsHasMore));
      seenEventCodesRef.current = new Set(saved.seenEventCodes ?? []);
      setLoading(false);
      
      // ✅ 백그라운드에서 서버 데이터 가져와서 업데이트
      fetchFolderDetail(saved.events);
    } else {
      console.log('[Folder Mount] No valid saved data found');
      // ✅ 초기 데이터가 있으면 fetch 생략
      if (!initialData) {
        fetchFolderDetail();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderCode]);

  // 라우팅 직전 저장
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.href.startsWith("mailto:")) return;

      console.log('[Folder Save] Saving state:', {
        eventsCount: events.length,
        eventsStart,
        eventsHasMore,
      });

      save<FolderPageState>({
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
      save<FolderPageState>({
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