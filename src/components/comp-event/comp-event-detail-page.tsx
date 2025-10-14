"use client";

import { reqGetEventDetail } from "@/actions/action";
import BtnWithIcon01 from "@/components/comp-button/btn-with-icon-01";
import GoogleMap from "@/components/comp-google-map/google-map";
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
import { ResponseEventDetailForUserFront, SUPPORT_LANG_CODE_TYPE } from "dplus_common_v1";
import { useEffect, useState } from "react";
import { toAbsoluteUrl, toInstagramUrl, toMailUrl, toTelUrl, toYoutubeChannelUrl } from "@/utils/basic-info-utils";
import { InfoItem } from "@/components/info-item";
import { HeadlineTagsDetail } from "@/components/headline-tags-detail";
import { IconGoogleColor } from "@/icons/icon-google-color";
import { IconApple } from "@/icons/icon-apple";
import CompLabelCount01 from "@/components/comp-common/comp-label-count-01";
import CompCommonDatetime from "../comp-common/comp-common-datetime";
import { CompDatesInDetail } from "../comp-common/comp-dates-in-detail";
import { getEventImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";


/**
 * 이벤트 상세 페이지
 * @param param0 - 이벤트 ID, 언어 코드, 전체 로케일
 * @returns 이벤트 상세 페이지
 */
export default function CompEventDetailPage({ eventCode, langCode, fullLocale }: { eventCode: string, langCode: string, fullLocale: string }) {
  const router = useRouter();
  const [eventDetail, setEventDetail] = useState<ResponseEventDetailForUserFront | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const fetchEventDetail = async () => {
    try {
      const res = await reqGetEventDetail(eventCode, langCode);
      const db = res?.dbResponse;

      const isEmptyObj =
        !db || (typeof db === "object" && !Array.isArray(db) && Object.keys(db).length === 0);

      // ❗데이터 없으면 에러 페이지로
      if (!res?.success || isEmptyObj || !db?.event) {
        router.replace(`/error/content-not-found?type=event&lang=${encodeURIComponent(langCode)}`);
        return;
      }

      setEventDetail(db);
      setImageUrls(getEventImageUrls(db.event));
    } catch (e) {
      router.replace(`/error/content-not-found?type=event&lang=${encodeURIComponent(langCode)}`);
    }
  };
  
  // 공유 기능 핸들러
  const handleShareClick = async () => {
    const shareData = {
      title: eventDetail?.event.title || '이벤트 공유',
      text: eventDetail?.event.description || '이벤트 정보를 확인해보세요!',
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

  const handleMapClick = () => {
    if (eventDetail?.event.google_map_url) {
      window.open(eventDetail?.event.google_map_url, '_blank');
    }
  };

  const handleMarkerClick = () => {
    if (eventDetail?.event.google_map_url) {
      window.open(eventDetail?.event.google_map_url, '_blank');
    }
  };

  useEffect(() => {
    fetchEventDetail();
  }, [eventCode]);

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center font-poppins font-extrabold text-8xl">
        {eventDetail?.event.date ? getDdayLabel(calculateDaysFromToday(eventDetail?.event.date)) : ''}
      </div>
      <CompCommonDatetime 
        datetime={eventDetail?.event.date ?? null}
        fullLocale={fullLocale}
        time={eventDetail?.event.time ?? null}
        isRepeatAnnually={eventDetail?.event.is_repeat_annually ?? false}
      />
      <HeadlineTagsDetail
        targetCountryCode={eventDetail?.event.target_country_code || null}
        targetCountryName={eventDetail?.event.target_country_native || null}
        targetCityCode={eventDetail?.event.target_city_code || null}
        targetCityName={eventDetail?.event.target_city_native || null}
        categories={eventDetail?.mapCategoryEvent?.items.map(item => item.category_info?.name || '') ?? null}
        langCode={langCode as SUPPORT_LANG_CODE_TYPE}
      />
      <div id="event-title" className="text-center font-extrabold text-3xl"
        data-event-id={eventDetail?.event.event_id} 
        data-event-code={eventDetail?.event.event_code}
      >
        {eventDetail?.event.title}
      </div>
      <div className="flex gap-4 justify-center">
        <BtnWithIcon01 
          title="Calendar" 
          icon={<IconGoogleColor />} 
          onClick={() => addToGoogleCalendar(generateGoogleCalendarEvent(eventDetail?.event ?? null))} 
          width={22} 
          height={22} 
          minWidth={180} />
        <BtnWithIcon01
          title="Calendar"
          icon={<IconApple />}
          onClick={() => addToAppleCalendarFromDetail(eventDetail?.event ?? null)}
          width={22}
          height={22}
          minWidth={180}
        />
        <BtnWithIcon01 title="Share" icon={<IconShare />} onClick={handleShareClick} width={22} height={22} minWidth={180} />
      </div>
      <HeroImageSlider
        imageUrls={imageUrls}
        className="m-auto w-full flex max-w-[1440px]"
      />
      {eventDetail?.event.description && (
        <div className="m-auto p-4 px-8 w-full text-lg max-w-[1440px] whitespace-pre-line">{eventDetail?.event.description}</div>
      )}
      {eventDetail?.mapStagEvent?.items.map(item => (
        <div key={item.event_id}>
          <div>{item.stag_info?.stag_native}</div>
        </div>
      ))}
      {eventDetail?.mapTagEvent?.items.map(item => (
        <div key={item.tag_info?.tag_code}>
          <div>{item.tag_info?.tag_code}</div>
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
          {eventDetail?.event.address_native && (
            <InfoItem
              icon={<IconMapPinRound className="h-12 w-12 text-gray-700" />}
              text={eventDetail.event.address_native}
              // 위도경도 있으면 지도 연결, 없으면 주소 검색
              href={
                eventDetail.event.latitude && eventDetail.event.longitude
                  ? `https://maps.google.com/?q=${eventDetail.event.latitude},${eventDetail.event.longitude}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventDetail.event.address_native)}`
              }
              breakWords // 주소는 줄바꿈 허용
            />
          )}
          {eventDetail?.event.phone && (
            <InfoItem
              icon={<IconPhoneRound className="h-12 w-12 text-gray-700" />}
              text={`+${eventDetail.event.phone_country_code} ${eventDetail.event.phone}`}
              href={toTelUrl(eventDetail.event.phone)}
            />
          )}
          {eventDetail?.event.homepage && (
            <InfoItem
              icon={<IconHomepageRound className="h-12 w-12 text-gray-700" />}
              text={eventDetail.event.homepage.replace(/^https?:\/\//i, "")}
              href={toAbsoluteUrl(eventDetail.event.homepage)}
            />
          )}
          {eventDetail?.event.email && (
            <InfoItem
              icon={<IconEmailRound className="h-12 w-12 text-gray-700" />}
              text={eventDetail.event.email}
              href={toMailUrl(eventDetail.event.email)}
            />
          )}
          {eventDetail?.event.youtube_ch_id && (
            <InfoItem
              icon={<IconYoutubeRound className="h-12 w-12 text-gray-700" />}
              text="Youtube"
              href={toYoutubeChannelUrl(eventDetail.event.youtube_ch_id)}
            />
          )}
          {eventDetail?.event.instagram_id && (
            <InfoItem
              icon={<IconInstagramRound className="h-12 w-12 text-gray-700" />}
              text="Instagram"
              href={toInstagramUrl(eventDetail.event.instagram_id)}
            />
          )}
          {/* 기존 LinkForDetail도 리스트 아이템로 포함 */}
          {eventDetail?.event.url && (
            <InfoItem
              icon={<IconWebsiteRound className="h-12 w-12 text-gray-700" />}
              text="URL"
              href={eventDetail.event.url}
            />
          )}
          </ul>
        </div>
      </div>
      {eventDetail?.event.latitude && eventDetail?.event.longitude && (
        <div className="m-auto w-full max-w-[1440px] h-48 bg-red-500 overflow-hidden">
          <GoogleMap 
            latitude={eventDetail?.event.latitude || 0}
            longitude={eventDetail?.event.longitude || 0}
            title={eventDetail?.event.title}
            zoom={15}
            className="w-full h-full"
            style={{ minHeight: '192px' }}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
            // showClickHint={true}
            clickHintText={eventDetail?.event.address_native ?? ''}
          />
        </div>
      )}
      {/* <div>Profile Image:{eventDetail?.content.profile}</div> */}
      <div className="flex gap-4 justify-center flex-wrap">
        <CompLabelCount01 title="Views" count={eventDetail?.event.view_count ?? 0} minWidth={120} minHeight={120} />
        <CompLabelCount01 title="Saved" count={eventDetail?.event.saved_count ?? 0} minWidth={120} minHeight={120} />
        <CompLabelCount01 title="Shared" count={eventDetail?.event.shared_count ?? 0} minWidth={120} minHeight={120} />
      </div>
      <CompDatesInDetail createdAt={eventDetail?.event.created_at} updatedAt={eventDetail?.event.updated_at} fullLocale={fullLocale} />
    </div>
  );
}