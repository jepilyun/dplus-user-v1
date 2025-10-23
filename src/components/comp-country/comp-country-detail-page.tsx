"use client";

import {reqGetCountryDetail, reqGetCountryEvents } from "@/actions/action";
import { ResponseCountryDetailForUserFront, SUPPORT_LANG_CODES, TMapCountryEventWithEventInfo } from "dplus_common_v1";
import { useEffect, useState } from "react";
import { getCountryImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { CompLoadMore } from "../comp-common/comp-load-more";
import { HeroImageBackgroundCarouselCountry } from "../comp-image/hero-background-carousel-country";
import Link from "next/link";


/**
 * 폴더 상세 페이지
 * @param param0 - 이벤트 ID, 언어 코드, 전체 로케일
 * @returns 이벤트 상세 페이지
 */
export default function CompCountryDetailPage({ countryCode, fullLocale, langCode }: { countryCode: string, fullLocale: string, langCode: string }) {
  const router = useRouter();

  const [error, setError] = useState<'not-found' | 'network' | null>(null);
  const [loading, setLoading] = useState(true);

  const [countryDetail, setCountryDetail] = useState<ResponseCountryDetailForUserFront | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [hasCategories, setHasCategories] = useState(false);
  const [hasCities, setHasCities] = useState(false);

  // 기존 상태들 아래에 추가
  const [events, setEvents] = useState<TMapCountryEventWithEventInfo[]>(countryDetail?.mapCountryEvent?.items ?? []);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // 중복 방지
  const [seenEventCodes] = useState<Set<string>>(new Set());

  const EVENTS_LIMIT = 10;

  const fetchCountryDetail = async () => {
    try {
      const res = await reqGetCountryDetail(countryCode, 0, EVENTS_LIMIT, langCode);

      const isEmptyObj =
        !res?.dbResponse || (typeof res?.dbResponse === "object" && !Array.isArray(res?.dbResponse) && Object.keys(res?.dbResponse).length === 0);

      // 응답은 있지만 데이터가 없는 경우 (404)
      if (!res?.success || isEmptyObj || !res?.dbResponse?.country) {
        setError('not-found');
        setLoading(false);
        return;
      }

      setCountryDetail(res?.dbResponse);
      setImageUrls(getCountryImageUrls(res?.dbResponse?.country));
      setHasCategories(res?.dbResponse?.categories?.items?.length > 0);
      setHasCities(res?.dbResponse?.cities?.items?.length > 0);
      // ✅ 이벤트 초기화
      const initItems = res?.dbResponse?.mapCountryEvent?.items ?? [];
      setEvents(initItems);
      setEventsStart(initItems.length);
      setEventsHasMore(Boolean(res?.dbResponse?.mapCountryEvent?.hasMore));

      // 중복 방지 Set 채우기
      for (const it of initItems) {
        const code = it?.event_info?.event_code ?? it?.event_code;
        if (code) seenEventCodes.add(code);
      }

      setError(null);
    } catch (e) {
      // 네트워크 에러나 서버 에러
      console.error('Failed to fetch country detail:', e);
      setError('network');
    } finally {
      setLoading(false);
    }
  };

  // 공유 기능 핸들러
  const handleShareClick = async () => {
    const shareData = {
      title: countryDetail?.country.country_name || '이벤트 세트 공유',
      text: countryDetail?.country.country_name || '이벤트 세트 정보를 확인해보세요!',
      url: window.location.href,  
    };

    // Web Share API 지원 여부 확인
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('공유 성공');
      } catch (error) {
        console.error('공유 실패:', error);
      }
    } else {
      // Web Share API가 지원되지 않을 경우, 대체 로직 구현 (예: 모달 띄우기)
      // 여기서는 예시로 Twitter 공유 창을 띄웁니다.
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
      window.open(twitterUrl, '_blank', 'width=600,height=400');
    }
  };


  const loadMoreEvents = async () => {
    if (eventsLoading || !eventsHasMore) return;
    setEventsLoading(true);

    try {
      const res = await reqGetCountryEvents(countryCode, eventsStart, EVENTS_LIMIT);
      const page = res?.dbResponse?.mapCountryEvent;
      const newItems = (page?.items ?? []).filter((it: TMapCountryEventWithEventInfo) => {
        const code = it?.event_info?.event_code ?? it?.event_code;
        if (!code || seenEventCodes.has(code)) return false;
        seenEventCodes.add(code);
        return true;
      });

      setEvents(prev => prev.concat(newItems));
      setEventsStart(eventsStart + (newItems.length || 0));
      setEventsHasMore(Boolean(page?.hasMore));
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchCountryDetail();
  }, [countryCode]);

  // 로딩 중
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div>Loading...</div>
      </div>
    );
  }

  // 국가를 찾을 수 없는 경우 - 인라인 에러 표시
  if (error === 'not-found') {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Country Not Found</h2>
          <p className="text-gray-600 mb-6">
            해당 국가는 존재하지 않습니다.
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
            Failed to load country details. Please try again.
          </p>
          <button
            onClick={() => fetchCountryDetail()}
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
      <HeroImageBackgroundCarouselCountry
        bucket="countries"
        imageUrls={imageUrls}
        interval={5000}
        countryDetail={countryDetail?.country || null}
        langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
      />

      {hasCategories && (
        <div className="mx-auto w-full max-w-[1440px] px-4">
          <div className="flex justify-center gap-2 flex-wrap">
            {countryDetail?.categories?.items.map((item) => (
              <Link
                key={item.category_code}
                href={`/category/${item.category_code}`}
                className="block"
              >
                <div className="flex flex-col items-center justify-center gap-1 h-full w-full rounded-xs border border-gray-200 px-4 py-2 transition hover:bg-gray-50">
                  <div className="text-md font-medium text-center">
                    {item.name_i18n ?? item.name}
                  </div>
                  {/* <div className="text-xs text-muted-foreground text-center">{item.name}</div> */}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {hasCities && (
        <div className="mx-auto w-full max-w-[1440px] px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 h-[240px]">
            {countryDetail?.cities?.items.map((item) => (
              <Link
                key={item.city_code}
                href={`/city/${item.city_code}`}
                className="block"
              >
                <div className="flex flex-col items-center justify-center gap-1 h-full w-full rounded-xs border border-gray-200 p-4 transition hover:bg-gray-50">
                  <div className="text-md font-medium text-center">
                    {item.name_i18n ?? item.name}
                  </div>
                  {/* <div className="text-xs text-muted-foreground text-center">{item.name}</div> */}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {/* {countryDetail?.stags?.items.map(item => (
        <div key={item.stag_code}>
          <div>{item.stag}</div>
        </div>
      ))} */}
      {events?.length ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {events.map(item => (
            <CompCommonDdayItem key={item.event_info?.event_code} event={item} fullLocale={fullLocale} />
          ))}

          {/* 더보기 버튼 */}
          {eventsHasMore && <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} />}
        </div>
      ) : null}

      {/* 
      {folderDetail?.mapStagFolder?.map(item => (
        <div key={item.stag_info?.stag_code}>
          <div>{item.stag_native}</div>
          <div>{item.stag_name_i18n}</div>
        </div>
      ))}
      {folderDetail?.mapTagFolder?.map(item => (
        <div key={item.tag_code}>
          <div>{item.tag_code}</div>
        </div>
      ))}
      <div className="m-auto w-full max-w-[1280px]">
        <div className="rounded-xl bg-white/70 p-8 sm:p-12">
          <ul
            className="
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
              gap-x-6 gap-y-6
            "
            aria-label="event contact & links"
          >
          {folderDetail?.content.phone && (
            <InfoItem
              icon={<IconPhoneRound className="h-12 w-12 text-gray-700" />}
              text={`+${folderDetail.content.phone_country_code} ${folderDetail.content.phone}`}
              href={toTelUrl(folderDetail.content.phone)}
            />
          )}
          {folderDetail?.content.homepage && (
            <InfoItem
              icon={<IconHomepageRound className="h-12 w-12 text-gray-700" />}
              text={folderDetail.content.homepage.replace(/^https?:\/\//i, "")}
              href={toAbsoluteUrl(folderDetail.content.homepage)}
            />
          )}
          {folderDetail?.content.email && (
            <InfoItem
              icon={<IconEmailRound className="h-12 w-12 text-gray-700" />}
              text={folderDetail.content.email}
              href={toMailUrl(folderDetail.content.email)}
            />
          )}
          {folderDetail?.content.youtube_ch_id && (
            <InfoItem
              icon={<IconYoutubeRound className="h-12 w-12 text-gray-700" />}
              text="Youtube"
              href={toYoutubeChannelUrl(folderDetail.content.youtube_ch_id)}
            />
          )}
          {folderDetail?.content.instagram_id && (
            <InfoItem
              icon={<IconInstagramRound className="h-12 w-12 text-gray-700" />}
              text="Instagram"
              href={toInstagramUrl(folderDetail.content.instagram_id)}
            />
          )}
          {/* 기존 LinkForDetail도 리스트 아이템로 포함 */}
          {/* {folderDetail?.content.url && (
            <InfoItem
              icon={<IconWebsiteRound className="h-12 w-12 text-gray-700" />}
              text="URL"
              href={folderDetail.content.url}
            />
          )}
          </ul> */}
        {/* </div> */}
      {/* </div> */}
      {/* <div>Profile Image:{folderDetail?.content.profile}</div> */}
      {/* <CompDatesInDetail createdAt={folderDetail?.content.created_at} updatedAt={folderDetail?.content.updated_at} fullLocale={fullLocale} /> */}
    </div>
  );
}