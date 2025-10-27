"use client";

import { reqGetCategoryDetail, reqGetCategoryEvents } from "@/actions/action";
import { ResponseCategoryDetailForUserFront, TMapCategoryEventWithEventInfo } from "dplus_common_v1";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CompLoadMore } from "../comp-common/comp-load-more";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";

/**
 * Category 상세 페이지
 * @param param0 - Category Code, 언어 코드, 전체 로케일
 * @returns 이벤트 상세 페이지
 */
export default function CompCategoryDetailPage({ 
  categoryCode, 
  countryCode,
  langCode, 
  fullLocale 
}: { 
  categoryCode: string;
  countryCode: string;
  langCode: string;
  fullLocale: string;
}) {
  const router = useRouter();

  const [error, setError] = useState<'not-found' | 'network' | null>(null);
  const [loading, setLoading] = useState(true);

  const [categoryDetail, setCategoryDetail] = useState<ResponseCategoryDetailForUserFront | null>(null);
  const [events, setEvents] = useState<TMapCategoryEventWithEventInfo[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  const [seenEventCodes] = useState<Set<string>>(new Set());

  const EVENTS_LIMIT = 10;

  const fetchCategoryDetail = async () => {
    try {
      const res = await reqGetCategoryDetail(countryCode, categoryCode, 0, EVENTS_LIMIT, langCode);

      // 응답은 있지만 데이터가 없는 경우 (404)
      if (!res?.dbResponse || !res?.dbResponse?.category) {
        setError('not-found');
        setLoading(false);
        return;
      }

      const initItems = res?.dbResponse?.mapCategoryEvent?.items ?? [];
      setCategoryDetail(res?.dbResponse ?? null);
      setEvents(initItems);
      setEventsStart(initItems.length);
      setEventsHasMore(Boolean(res?.dbResponse?.mapCategoryEvent?.hasMore));

      for (const it of initItems) {
        const code = it?.event_code;
        if (code) seenEventCodes.add(code);
      }
      setError(null);
    } catch (e) {
      // 네트워크 에러나 서버 에러
      console.error('Failed to fetch category detail:', e);
      setError('network');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreEvents = async () => {
    if (eventsLoading) return;
    setEventsLoading(true);

    try {
      const res = await reqGetCategoryEvents(countryCode, categoryCode, eventsStart, EVENTS_LIMIT);
      const fetchedItems = res?.dbResponse?.items;
      const newItems = (fetchedItems ?? []).filter((it: TMapCategoryEventWithEventInfo) => {
        const code = it?.event_code;
        if (!code || seenEventCodes.has(code)) return false;
        seenEventCodes.add(code);
        return true;
      });

      setEvents(prev => prev.concat(newItems));
      setEventsStart(eventsStart + (newItems.length || 0));
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryDetail();
  }, [categoryCode, countryCode]);


  // 로딩 중
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div>Loading...</div>
      </div>
    );
  }

  // 카테고리를 찾을 수 없는 경우 - 인라인 에러 표시
  if (error === 'not-found') {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
          <p className="text-gray-600 mb-6">
            해당 카테고리는 존재하지 않습니다.
          </p>
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
  if (error === 'network') {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">ERROR</h2>
          <p className="text-gray-600 mb-6">
            Failed to load category details. Please try again.
          </p>
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
            <div className="text-lg">{categoryDetail?.category?.name}</div>
          </div>
        ): (
          <div className="text-center font-extrabold">
            <div className="text-3xl">{categoryDetail?.category?.name}</div>
          </div>
        )}
      </div>

      {/* 이벤트 목록 */}
      {events?.length ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {events.map(item => (
            <CompCommonDdayItem
              key={item.event_code} 
              event={item} 
              fullLocale={fullLocale} 
            />
          ))}

          {eventsHasMore && (
            <CompLoadMore 
              onLoadMore={loadMoreEvents} 
              loading={eventsLoading} 
            />
          )}
        </div>
      ) : (
        <div className="mx-auto w-full max-w-[1024px] px-2 sm:px-4 lg:px-6 text-center py-12 text-gray-500">
          No events found for this date.
        </div>
      )}
    </div>
  );
}