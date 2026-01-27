"use client";

import { clientReqGetPlaceDetail, clientReqGetPlaceEvents } from "@/api/place/clientReqPlace";
import {
  LIST_LIMIT,
  ResponsePlaceDetailForUserFront,
  TMapPlaceEventWithEventInfo,
} from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import DdayCardListTypeEventInfo from "../ddayCard/DdayCardListTypeEventInfo";
import { CompLoadMore } from "../button/LoadMore";
import DdayCardBoxTypeEventInfo from "../ddayCard/DdayCardBoxTypeEventInfo";
import { CompLoading } from "../common/Loading";
import { CompNotFound } from "../common/NotFound";
import { CompNetworkError } from "../common/NetworkError";
import dynamic from "next/dynamic";

const GoogleMap = dynamic(() => import("../googleMap/GoogleMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[300px] bg-gray-200 animate-pulse flex items-center justify-center">
      <span className="text-gray-500 text-sm">Loading map...</span>
    </div>
  ),
});

export default function CompPlaceDetailPage({
  placeId,
  langCode,
  fullLocale,
  initialData,
}: {
  placeId: string;
  langCode: string;
  fullLocale: string;
  initialData: ResponsePlaceDetailForUserFront | null;
}) {
  const [error, setError] = useState<"not-found" | "network" | null>(null);
  const [loading, setLoading] = useState(!initialData);

  const [placeDetail, setPlaceDetail] = useState<ResponsePlaceDetailForUserFront | null>(
    initialData ?? null
  );

  const [events, setEvents] = useState<TMapPlaceEventWithEventInfo[]>(
    initialData?.placeEvent?.items ?? []
  );
  const [eventsStart, setEventsStart] = useState(
    initialData?.placeEvent?.items?.length ?? 0
  );
  const [eventsHasMore, setEventsHasMore] = useState(
    Boolean(initialData?.placeEvent?.hasMore)
  );
  const [eventsLoading, setEventsLoading] = useState(false);

  const seenEventCodesRef = useRef<Set<string>>(
    new Set(
      initialData?.placeEvent?.items
        ?.map(item => item?.event_code)
        .filter(Boolean) ?? []
    )
  );

  /**
   * ✅ 서버 데이터와 복원 데이터를 병합하는 함수
   */
  const fetchAndMergeData = async (restoredEvents?: TMapPlaceEventWithEventInfo[]) => {
    if (initialData && !restoredEvents) {
      setLoading(false);
      return;
    }

    try {
      const res = await clientReqGetPlaceDetail(placeId, langCode, 0, LIST_LIMIT.default);
      const db = res?.dbResponse;

      const isEmptyObj = !db || (typeof db === "object" && !Array.isArray(db) && Object.keys(db).length === 0);

      if (!res?.success || isEmptyObj || !db?.placeDetail) {
        setError("not-found");
        setLoading(false);
        return;
      }

      setPlaceDetail(db);

      const serverEvents = db?.placeEvent?.items ?? [];

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
          serverEvents.map(item => item?.event_code).filter(Boolean)
        );
        
        const additionalEvents = restoredEvents
          .slice(LIST_LIMIT.default)
          .filter(item => {
            const code = item?.event_code;
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
        
        console.log('[Place Merge] Future events after filter:', futureEvents.length);
        
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
          const code = item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      } else {
        console.log('[Folder Merge] ✅ Using server data only');
        setEvents(serverEvents);
        setEventsStart(serverEvents.length);
        
        seenEventCodesRef.current.clear();
        serverEvents.forEach(item => {
          const code = item?.event_code;
          if (code) seenEventCodesRef.current.add(code);
        });
      }
      
      setEventsHasMore(Boolean(db?.placeEvent?.hasMore));
      setError(null);
    } catch (e) {
      console.error("Failed to fetch folder detail:", e);
      setError("network");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreEvents = async () => {
    if (eventsLoading || !eventsHasMore) return;
    setEventsLoading(true);

    try {
      const res = await clientReqGetPlaceEvents(placeId, langCode, eventsStart, LIST_LIMIT.default);
      const fetchedItems = res?.dbResponse?.items ?? [];
      
      const newItems = fetchedItems.filter((it: TMapPlaceEventWithEventInfo | null) => {
        const code = it?.event_code;
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

  // ✅ Place 위치 정보
  const latitude = placeDetail?.placeDetail?.latitude;
  const longitude = placeDetail?.placeDetail?.longitude;
  const hasLocation = typeof latitude === 'number' && typeof longitude === 'number';

  return (
    <div className="p-4 flex flex-col gap-4">
      <div id="place-title" className="my-4 text-center font-extrabold text-3xl md:text-4xl" data-place-id={placeDetail?.placeDetail?.place_id}>
        {placeDetail?.placeDetail?.name_native ?? placeDetail?.placeDetail?.name_en}
      </div>

      {/* ✅ Google Map */}
      {hasLocation && (
        <div className="w-full max-w-[1024px] mx-auto">
          <div className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden">
            <GoogleMap
              latitude={latitude!}
              longitude={longitude!}
              title={placeDetail?.placeDetail?.name_native ?? placeDetail?.placeDetail?.name_en ?? "Location"}
              zoom={15}
            />
          </div>
        </div>
      )}

      {events?.length ? (
        <>
          {/* 모바일: DdayCardListTypeEventInfo */}
          <div className="sm:hidden mx-auto w-full max-w-[1024px] grid grid-cols-1 gap-4">
            {events.map((item) => (
              <DdayCardBoxTypeEventInfo 
                key={item.event_code} 
                event={item} 
                fullLocale={fullLocale} 
                langCode={langCode}
              />
            ))}
            {eventsHasMore && <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} locale={langCode} />}
          </div>

          {/* 데스크톱: DdayCardListTypeEventInfoCard */}
          <div className="hidden sm:block mx-auto w-full max-w-[1024px] px-4 lg:px-6">
            <div className="flex flex-col gap-4">
              {events.map((item) => (
                <DdayCardListTypeEventInfo key={item.event_code} event={item} fullLocale={fullLocale} langCode={langCode} />
              ))}
            </div>
            {eventsHasMore && <div className="mt-4"><CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} locale={langCode} /></div>}
          </div>
        </>
      ) : null}
    </div>
  );
}