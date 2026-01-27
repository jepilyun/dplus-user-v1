"use client";

import { clientReqGetFolderDetail, clientReqGetFolderEvents } from "@/api/folder/clientReqFolder";
import { HeroImageSlider } from "@/components/image/hero-image-slider";
import {
  LIST_LIMIT,
  ResponseFolderDetailForUserFront,
  SUPPORT_LANG_CODES,
  TMapFolderEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { HeadlineTagsDetail } from "@/components/headline-tags-detail";
import CompLabelCount01 from "@/components/common/comp-label-count-01";
import { getFolderDetailImageUrls } from "@/utils/set-image-urls";
import CompCommonDdayItem from "../dday-card/comp-common-dday-item";
import { CompLoadMore } from "../button/comp-load-more";
import { incrementFolderSharedCount, incrementFolderViewCount } from "@/utils/increment-count";
import CompCommonDdayCard from "../dday-card/comp-common-dday-card";
import { CompLoading } from "../common/comp-loading";
import { CompNotFound } from "../common/comp-not-found";
import { CompNetworkError } from "../common/comp-network-error";
import { CompFolderActionButtons } from "./comp-folder-action-buttons";
import ShareModal from "../share/comp-share-modal";

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
  // const router = useRouter();
  const viewCountIncrementedRef = useRef(false);

  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(!initialData);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  const [folderDetail, setFolderDetail] = useState<ResponseFolderDetailForUserFront | null>(
    initialData ?? null
  );

  const [imageUrls, setImageUrls] = useState<string[]>(
    initialData ? getFolderDetailImageUrls(initialData.folderDetail?.folderInfo) : []
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

  const seenEventCodesRef = useRef<Set<string>>(
    new Set(
      initialData?.folderEvent?.items
        ?.map(item => item?.event_info?.event_code ?? item?.event_code)
        .filter(Boolean) ?? []
    )
  );

  const [viewCount, setViewCount] = useState(initialData?.folderDetail?.folderInfo?.view_count ?? 0);
  const [sharedCount, setSharedCount] = useState(initialData?.folderDetail?.folderInfo?.shared_count ?? 0);

  /**
   * ✅ 서버 데이터와 복원 데이터를 병합하는 함수
   */
  const fetchAndMergeData = async (restoredEvents?: TMapFolderEventWithEventInfo[]) => {
    if (initialData && !restoredEvents) {
      setLoading(false);
      return;
    }

    try {
      const res = await clientReqGetFolderDetail(folderCode, langCode, 0, LIST_LIMIT.default);
      const db = res?.dbResponse;

      const isEmptyObj = !db || (typeof db === "object" && !Array.isArray(db) && Object.keys(db).length === 0);

      if (!res?.success || isEmptyObj || !db?.folderDetail?.folderInfo) {
        setError("not-found");
        setLoading(false);
        return;
      }

      setFolderDetail(db);
      setImageUrls(getFolderDetailImageUrls(db.folderDetail?.folderInfo));
      setViewCount(db?.folderDetail?.folderInfo?.view_count ?? 0);
      setSharedCount(db?.folderDetail?.folderInfo?.shared_count ?? 0);

      const serverEvents = db?.folderEvent?.items ?? [];
      
      // console.log('[Folder Merge] 📊 Data versions:', {
      //   new: newVersion,
      //   old: dataVersion,
      //   changed: newVersion !== dataVersion
      // });
      
      // ✅ 복원된 데이터가 있고 더보기를 했던 경우 (36개 초과)
      if (restoredEvents && restoredEvents.length > LIST_LIMIT.default) {
        // console.log('[Folder Merge] 🔄 서버 데이터와 복원 데이터 병합 시작');
        // console.log('[Folder Merge] Server events:', serverEvents.length);
        // console.log('[Folder Merge] Restored total:', restoredEvents.length);
        
        const serverCodes = new Set(
          serverEvents.map(item => item?.event_info?.event_code ?? item?.event_code).filter(Boolean)
        );
        
        const additionalEvents = restoredEvents
          .slice(LIST_LIMIT.default)
          .filter(item => {
            const code = item?.event_info?.event_code ?? item?.event_code;
            return code && !serverCodes.has(code);
          });

        // 오늘 이후 이벤트만 필터링
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();
        
        const futureEvents = additionalEvents.filter(item => {
          const eventDate = item.event_info?.date;
          
          if (eventDate) {
            const date = new Date(eventDate);
            return date.getTime() >= todayTimestamp;
          }
          return true;
        });
        
        console.log('[Folder Merge] Future events after filter:', futureEvents.length);
        
        const finalEvents = [...serverEvents, ...futureEvents];
        
        // console.log('[Folder Merge] ✅ Final merged:', {
        //   server: serverEvents.length,
        //   additional: futureEvents.length,
        //   total: finalEvents.length
        // });
        
        setEvents(finalEvents);
        setEventsStart(finalEvents.length);

        seenEventCodesRef.current.clear();
        finalEvents.forEach(item => {
          const code = item?.event_info?.event_code ?? item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      } else {
        console.log('[Folder Merge] ✅ Using server data only');
        setEvents(serverEvents);
        setEventsStart(serverEvents.length);
        
        seenEventCodesRef.current.clear();
        serverEvents.forEach(item => {
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
      title: folderDetail?.folderDetail?.folderInfo?.title || 'Events List',
      text: folderDetail?.folderDetail?.description?.description || 'Check out the events list!',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        const newCount = await incrementFolderSharedCount(folderCode);
        if (newCount !== null) {
          setSharedCount(newCount);
        }
      } catch (error) {
        console.error('공유 실패:', error);
      }
    } else {
      setShowShareModal(true);
    }
  };

  const handleSocialShare = async (platform: string) => {
    const newCount = await incrementFolderSharedCount(folderCode);
    if (newCount !== null) {
      setSharedCount(newCount);
    }
  };

  const loadMoreEvents = async () => {
    if (eventsLoading || !eventsHasMore) return;
    setEventsLoading(true);

    try {
      const res = await clientReqGetFolderEvents(folderCode, langCode, eventsStart, LIST_LIMIT.default);
      const fetchedItems = res?.dbResponse?.items ?? [];
      
      const newItems = fetchedItems.filter((it: TMapFolderEventWithEventInfo) => {
        const code = it?.event_info?.event_code ?? it?.event_code;
        if (!code || seenEventCodesRef.current.has(code)) return false;
        seenEventCodesRef.current.add(code);
        return true;
      });

      setEvents(prev => [...prev, ...newItems]);
      setEventsStart(prev => prev + newItems.length);
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));
    } finally {
      setEventsLoading(false);
    }
  };

  // ✅ URL 설정
  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

    // ✅ 조회수 증가 (한 번만)
  useEffect(() => {
    if (!viewCountIncrementedRef.current && folderCode) {
      viewCountIncrementedRef.current = true;
      incrementFolderViewCount(folderCode).then(newCount => {
        if (newCount !== null) setViewCount(newCount);
      });
    }
  }, [folderCode]);

  // ================= 렌더 =================

  if (loading) {
    return (
      <CompLoading message="Loading..." />
    );
  }

  if (error === "not-found") {
    return (
      <CompNotFound
        title="Folder Not Found"
        message="해당 폴더는 존재하지 않습니다."
        returnPath={`/${langCode}`}
        returnLabel="홈 화면으로 이동"
      />
    );
  }

  if (error === "network") {
    return (
      <CompNetworkError
        title="ERROR"
        message="Failed to load folder details. Please try again."
        onRetry={() => fetchAndMergeData()}
        retryLabel="Retry"
      />
    );
  }

  return (
    <div className="p-4 flex flex-col gap-4">
      <HeadlineTagsDetail
        targetCountryCode={folderDetail?.folderDetail?.folderInfo?.target_country_code || null}
        targetCountryName={folderDetail?.folderDetail?.folderInfo?.target_country_native || null}
        targetCityCode={folderDetail?.folderDetail?.folderInfo?.target_city_code || null}
        targetCityName={folderDetail?.folderDetail?.folderInfo?.target_city_native || null}
        categories={folderDetail?.mapCategoryFolder?.items ?? null}
        langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
      />

      <div id="folder-title" className="text-center font-extrabold text-3xl md:text-4xl" data-folder-code={folderDetail?.folderDetail?.folderInfo?.folder_code}>
        {folderDetail?.folderDetail?.folderInfo?.title}
      </div>

      <HeroImageSlider bucket="folders" imageUrls={imageUrls} className="m-auto w-full" />

      {folderDetail?.folderDetail?.description?.description && (
        <div className="m-auto p-4 px-8 w-full text-lg max-w-[1024px] whitespace-pre-line">
          {folderDetail?.folderDetail?.description?.description}
        </div>
      )}

      <div className="my-4 flex w-full justify-center">
        <CompFolderActionButtons langCode={langCode} handleShareClick={handleShareClick} />
      </div>

      {events?.length ? (
        <>
          {/* 모바일: CompCommonDdayItem */}
          <div className="sm:hidden mx-auto w-full max-w-[1024px] grid grid-cols-1 gap-4">
            {events.map((item) => (
              <CompCommonDdayCard 
                key={item.event_code} 
                event={item} 
                fullLocale={fullLocale} 
                langCode={langCode}
              />
            ))}
            {eventsHasMore && <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} locale={langCode} />}
          </div>

          {/* 데스크톱: CompCommonDdayItemCard */}
          <div className="hidden sm:block mx-auto w-full max-w-[1024px] px-4 lg:px-6">
            <div className="flex flex-col gap-4">
              {events.map((item) => (
                <CompCommonDdayItem key={item.event_code} event={item} fullLocale={fullLocale} langCode={langCode} />
              ))}
            </div>
            {eventsHasMore && <div className="mt-4"><CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} locale={langCode} /></div>}
          </div>
        </>
      ) : null}

      <div className="flex gap-4 justify-center mt-4">
        <CompLabelCount01 label="Views" count={viewCount} />
        <CompLabelCount01 label="Shared" count={sharedCount} />
      </div>
      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={folderDetail?.folderDetail?.folderInfo?.title || "이벤트 목록 공유"}
        text={folderDetail?.folderDetail?.description?.description || "이벤트 목록 정보를 확인해보세요!"}
        url={currentUrl}
        onShare={handleSocialShare}
        langCode={langCode}
      />
    </div>
  );
}