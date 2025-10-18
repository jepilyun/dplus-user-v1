"use client";

import { reqGetCityDetail, reqGetCityEvents, reqGetFolderDetail, reqGetFolderEvents, reqGetStagDetail, reqGetStagEvents, reqGetTagDetail, reqGetTagEvents } from "@/actions/action";
import BtnWithIcon01 from "@/components/comp-button/btn-with-icon-01";
import { HeroImageSlider } from "@/components/comp-image/hero-image-slider";
import { IconEmailRound } from "@/icons/icon-email-round";
import { IconHomepageRound } from "@/icons/icon-homepage-round";
import { IconInstagramRound } from "@/icons/icon-instagram-round";
import { IconMapPinRound } from "@/icons/icon-map-pin-round";
import { IconPhoneRound } from "@/icons/icon-phone-round";
import { IconShare } from "@/icons/icon-share";
import { IconWebsiteRound } from "@/icons/icon-website-round";
import { IconYoutubeRound } from "@/icons/icon-youtube-round";
import { addToAppleCalendarFromDetail, addToGoogleCalendar, generateGoogleCalendarEvent } from "@/utils/save-calendar";
import { calculateDaysFromToday } from "@/utils/calc-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { ResponseCityDetailForUserFront, ResponseFolderDetailForUserFront, ResponseStagDetailForUserFront, ResponseTagDetailForUserFront, SUPPORT_LANG_CODES, TMapCityEventWithEventInfo, TMapFolderEventWithEventInfo, TMapStagEventWithEventInfo, TMapTagEventWithEventInfo } from "dplus_common_v1";
import { useEffect, useState } from "react";
import { toAbsoluteUrl, toInstagramUrl, toMailUrl, toTelUrl, toYoutubeChannelUrl } from "@/utils/basic-info-utils";
import { InfoItem } from "@/components/info-item";
import { HeadlineTagsDetail } from "@/components/headline-tags-detail";
import { IconGoogleColor } from "@/icons/icon-google-color";
import { IconApple } from "@/icons/icon-apple";
import CompLabelCount01 from "@/components/comp-common/comp-label-count-01";
import CompCommonDatetime from "../comp-common/comp-common-datetime";
import { CompDatesInDetail } from "../comp-common/comp-dates-in-detail";
import { getCityImageUrls, getFolderImageUrls, getStagImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { CompLoadMore } from "../comp-common/comp-load-more";
import { HeroImageBackgroundCarouselCity } from "../comp-image/hero-background-carousel-city";
import { HeroImageBackgroundCarouselStag } from "../comp-image/hero-background-carousel-stag";


/**
 * Tag 상세 페이지
 * @param param0 - Tag Code, 언어 코드, 전체 로케일
 * @returns 이벤트 상세 페이지
 */
export default function CompTagDetailPage({ tagCode, langCode, fullLocale }: { tagCode: string, langCode: string, fullLocale: string }) {
  const router = useRouter();
  const [tagDetail, setTagDetail] = useState<ResponseTagDetailForUserFront | null>(null);

  // 기존 상태들 아래에 추가
  const [events, setEvents] = useState<TMapTagEventWithEventInfo[]>(tagDetail?.mapTagEvent?.items ?? []);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // 중복 방지
  const [seenEventCodes] = useState<Set<string>>(new Set());

  const EVENTS_LIMIT = 10;

  const fetchTagDetail = async () => {
    try {
      const res = await reqGetTagDetail(tagCode, 0, EVENTS_LIMIT);
console.log('res', res);
      const isEmptyObj =
        !res?.dbResponse || (typeof res?.dbResponse === "object" && !Array.isArray(res?.dbResponse) && Object.keys(res?.dbResponse).length === 0);

      // ❗ 콘텐츠 없을 때 에러 화면으로 이동
      if (!res?.success || isEmptyObj || !res?.dbResponse?.tag) {
        // router.replace(`/error/content-not-found?type=city&lang=${encodeURIComponent(langCode)}`);
        return;
      }

      setTagDetail(res?.dbResponse);

      // ✅ 이벤트 초기화
      const initItems = res?.dbResponse?.mapTagEvent?.items ?? [];
      setEvents(initItems);
      setEventsStart(initItems.length);
      setEventsHasMore(Boolean(res?.dbResponse?.mapTagEvent?.hasMore));

      // 중복 방지 Set 채우기
      for (const it of initItems) {
        const code = it?.event_info?.event_code ?? it?.event_code;
        if (code) seenEventCodes.add(code);
      }
    } catch (e) {
      // 네트워크/예외도 에러 페이지로
      // router.replace(`/error/content-not-found?type=stag&lang=${encodeURIComponent(langCode)}`);
    }
  };

  // 공유 기능 핸들러
  const handleShareClick = async () => {
    const shareData = {
      title: tagDetail?.tag.tag || '이벤트 세트 공유',
      text: tagDetail?.tag.tag || '이벤트 세트 정보를 확인해보세요!',
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
      if (tagDetail?.tag.id) {
        const res = await reqGetTagEvents(tagDetail?.tag.id, eventsStart, EVENTS_LIMIT);
        const page = res?.dbResponse?.mapTagEvent;
        const newItems = (page?.items ?? []).filter((it: TMapTagEventWithEventInfo) => {
          const code = it?.event_info?.event_code ?? it?.event_code;
          if (!code || seenEventCodes.has(code)) return false;
          seenEventCodes.add(code);
          return true;
        });

        setEvents(prev => prev.concat(newItems));
        setEventsStart(eventsStart + (newItems.length || 0));
        setEventsHasMore(Boolean(page?.hasMore));
      } else {
        console.log('tagDetail?.tag.id is not defined');
      }
    } finally {
      setEventsLoading(false);
    }
  };

  useEffect(() => {
    fetchTagDetail();
  }, [tagCode]);

  return (
    <div className="flex flex-col gap-8">
      <div id="tag-title" className="text-center font-extrabold text-3xl"
        data-tag-code={tagDetail?.tag.tag_code}
      >
        {tagDetail?.tag.tag}
      </div>
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