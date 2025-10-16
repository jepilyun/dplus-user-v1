"use client";

import { reqGetDateDetail, reqGetFolderDetail, reqGetFolderEvents } from "@/actions/action";
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
import { ResponseFolderDetailForUserFront, SUPPORT_LANG_CODES, TCategoryLabelInfo, TCityLabelInfo, TEventCard, TEventCardForDateDetail, TFolderSummaryInfo, TGroupLabelInfo, TMapFolderEventWithEventInfo, TStagLabelInfo, TTagLabelInfo } from "dplus_common_v1";
import { useEffect, useState } from "react";
import { toAbsoluteUrl, toInstagramUrl, toMailUrl, toTelUrl, toYoutubeChannelUrl } from "@/utils/basic-info-utils";
import { InfoItem } from "@/components/info-item";
import { HeadlineTagsDetail } from "@/components/headline-tags-detail";
import { IconGoogleColor } from "@/icons/icon-google-color";
import { IconApple } from "@/icons/icon-apple";
import CompLabelCount01 from "@/components/comp-common/comp-label-count-01";
import CompCommonDatetime from "../comp-common/comp-common-datetime";
import { CompDatesInDetail } from "../comp-common/comp-dates-in-detail";
import { getFolderImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import CompCommonDdayItem from "../comp-common/comp-common-dday-item";
import { CompLoadMore } from "../comp-common/comp-load-more";


/**
 * Date 상세 페이지
 * @param param0 - 날짜, 언어 코드, 전체 로케일
 * @returns 이벤트 상세 페이지
 */
export default function CompDateDetailPage({ dateString, langCode, fullLocale }: { dateString: string, langCode: string, fullLocale: string }) {
  const router = useRouter();

  // 기존 상태들 아래에 추가
  const [events, setEvents] = useState<TEventCardForDateDetail[]>([]);
  const [eventsStart, setEventsStart] = useState(0);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);

  // 중복 방지
  const [seenEventCodes] = useState<Set<string>>(new Set());

  const EVENTS_LIMIT = 10;

  const fetchDateDetail = async () => {
    try {
      const res = await reqGetDateDetail(dateString, 0, EVENTS_LIMIT);

      // ✅ 이벤트 초기화
      const initItems = res?.dbResponse?.items ?? [];
      setEvents(initItems);
      setEventsStart(initItems.length);
      setEventsHasMore(Boolean(res?.dbResponse?.hasMore));

      // 중복 방지 Set 채우기
      for (const it of initItems) {
        const code = it?.event_code;
        if (code) seenEventCodes.add(code);
      }
    } catch (e) {
      // 네트워크/예외도 에러 페이지로
      router.replace(`/error/content-not-found?type=date&lang=${encodeURIComponent(langCode)}`);
    }
  };

  // 공유 기능 핸들러
  const handleShareClick = async () => {
    const shareData = {
      title: dateString || '이벤트 세트 공유',
      text: `${dateString} 이벤트 세트 정보를 확인해보세요!`,
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
    if (eventsLoading) return;
    setEventsLoading(true);

    try {
      const res = await reqGetDateDetail(dateString, eventsStart, EVENTS_LIMIT);
      const events = res?.dbResponse?.items ?? [];
      const newItems = events.filter((it: TEventCardForDateDetail) => {
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
    fetchDateDetail();
  }, [dateString]);

  return (
    <div className="flex flex-col gap-8">
      {JSON.stringify(events)}
      {/* {JSON.stringify(folderDetail?.folderEvent?.items[1])} */}
      {/* <HeadlineTagsDetail
        targetCountryCode={folderDetail?.folder.target_country_code || null}
        targetCountryName={folderDetail?.folder.target_country_native || null}
        targetCityCode={folderDetail?.folder.target_city_code || null}
        targetCityName={folderDetail?.folder.target_city_native || null}
        categories={folderDetail?.mapCategoryFolder?.items.map(item => item.category_info?.name || '') ?? null}
        langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
      /> */}
      {/* <div id="folder-title" className="text-center font-extrabold text-3xl"
        data-folder-code={folderDetail?.folder.folder_code}
      >
        {folderDetail?.folder.title}
      </div> */}
      {/* <HeroImageSlider
        bucket="folders"
        imageUrls={imageUrls}
        className="m-auto w-full flex max-w-[1440px]"
      /> */}
      {/* {folderDetail?.folder.description && (
        <div className="m-auto p-4 px-8 w-full text-lg max-w-[1024px] whitespace-pre-line">{folderDetail?.folder.description}</div>
      )} */}
      {/* <div className="flex gap-4 justify-center">
        <CompLabelCount01 title="Views" count={folderDetail?.folder.view_count ?? 0} minWidth={120} minHeight={120} />
        <CompLabelCount01 title="Shared" count={folderDetail?.folder.shared_count ?? 0} minWidth={120} minHeight={120} />
      </div> */}
      {/* {events?.length ? (
        <div className="mx-auto w-full max-w-[1024px] flex flex-col gap-0 sm:gap-4 px-2 sm:px-4 lg:px-6">
          {events.map(item => (
            <CompCommonDdayItem key={item.event_info?.event_code} event={item} fullLocale={fullLocale} />
          ))}

          {/* 더보기 버튼 */}
          {/* {eventsHasMore && <CompLoadMore onLoadMore={loadMoreEvents} loading={eventsLoading} />}
        </div>
      ) : null} */}

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