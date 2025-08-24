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

/**
 * 이벤트 상세 페이지
 * @param param0 - 이벤트 ID, 언어 코드, 전체 로케일
 * @returns 이벤트 상세 페이지
 */
export default function CompEventDetailPage({ eventId, langCode, fullLocale }: { eventId: string, langCode: string, fullLocale: string }) {
  const [eventDetail, setEventDetail] = useState<ResponseEventDetailForUserFront | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const fetchEventDetail = async () => { 
    const res = await reqGetEventDetail(eventId, langCode);
    setEventDetail(res.dbResponse ?? null);

    const heroImages = [];

    if (res.dbResponse?.content.hero_image_01) {
      heroImages.push(res.dbResponse?.content.hero_image_01);
    }
    if (res.dbResponse?.content.hero_image_02) {
      heroImages.push(res.dbResponse?.content.hero_image_02);
    }
    if (res.dbResponse?.content.hero_image_03) {
      heroImages.push(res.dbResponse?.content.hero_image_03);
    }
    if (res.dbResponse?.content.hero_image_04) {
      heroImages.push(res.dbResponse?.content.hero_image_04);
    }
    if (res.dbResponse?.content.hero_image_05) {
      heroImages.push(res.dbResponse?.content.hero_image_05);
    }

    setImageUrls(heroImages);
  };
  
  // 공유 기능 핸들러
  const handleShareClick = async () => {
    const shareData = {
      title: eventDetail?.content.title || '이벤트 공유',
      text: eventDetail?.content.description || '이벤트 정보를 확인해보세요!',
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
    // if (eventDetail?.content.google_place_url) {
    //   window.open(eventDetail?.content.google_place_url, '_blank');
    // }
  };

  const handleMarkerClick = () => {
    // if (eventDetail?.content.google_place_url) {
    //   window.open(eventDetail?.content.google_place_url, '_blank');
    // }
  };

  useEffect(() => {
    fetchEventDetail();
  }, [eventId]);

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center font-jost font-extrabold text-8xl">
        {eventDetail?.content.date ? getDdayLabel(calculateDaysFromToday(eventDetail?.content.date)) : ''}
      </div>
      <CompCommonDatetime 
        datetime={eventDetail?.content.date ?? null}
        fullLocale={fullLocale}
        time={eventDetail?.content.time ?? null}
        isRepeatAnnually={eventDetail?.content.is_repeat_annually ?? false}
      />
      <HeadlineTagsDetail
        targetCountryCode={eventDetail?.content.target_country_code || null}
        targetCountryName={eventDetail?.content.target_country_native || null}
        targetCityCode={eventDetail?.content.target_city_code || null}
        targetCityName={eventDetail?.content.target_city_name_native || null}
        categories={eventDetail?.mapCategoryEvent?.map(item => item.category_name || '') ?? null}
        langCode={langCode as SUPPORT_LANG_CODE_TYPE}
      />
      <div id="event-title" className="text-center font-extrabold text-3xl"
        data-event-id={eventDetail?.content.event_id} 
        data-event-code={eventDetail?.content.event_code}
      >
        {eventDetail?.content.title}
      </div>
      <div className="flex gap-4 justify-center">
        <BtnWithIcon01 
          title="Calendar" 
          icon={<IconGoogleColor />} 
          onClick={() => addToGoogleCalendar(generateGoogleCalendarEvent(eventDetail?.content ?? null))} 
          width={22} 
          height={22} 
          minWidth={180} />
        <BtnWithIcon01
          title="Calendar"
          icon={<IconApple />}
          onClick={() => addToAppleCalendarFromDetail(eventDetail?.content ?? null)}
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
      {eventDetail?.content.description && (
        <div className="m-auto p-4 px-8 w-full text-lg max-w-[1440px] whitespace-pre-line">{eventDetail?.content.description}</div>
      )}
      {eventDetail?.mapStagEvent?.map(item => (
        <div key={item.event_id}>
          <div>{item.stag_native}</div>
          <div>{item.stag_name_i18n}</div>
        </div>
      ))}
      {eventDetail?.mapTagEvent?.map(item => (
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
          {eventDetail?.content.address_native && (
            <InfoItem
              icon={<IconMapPinRound className="h-12 w-12 text-gray-700" />}
              text={eventDetail.content.address_native}
              // 위도경도 있으면 지도 연결, 없으면 주소 검색
              href={
                eventDetail.content.latitude && eventDetail.content.longitude
                  ? `https://maps.google.com/?q=${eventDetail.content.latitude},${eventDetail.content.longitude}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(eventDetail.content.address_native)}`
              }
              breakWords // 주소는 줄바꿈 허용
            />
          )}
          {eventDetail?.content.phone && (
            <InfoItem
              icon={<IconPhoneRound className="h-12 w-12 text-gray-700" />}
              text={`+${eventDetail.content.phone_country_code} ${eventDetail.content.phone}`}
              href={toTelUrl(eventDetail.content.phone)}
            />
          )}
          {eventDetail?.content.homepage && (
            <InfoItem
              icon={<IconHomepageRound className="h-12 w-12 text-gray-700" />}
              text={eventDetail.content.homepage.replace(/^https?:\/\//i, "")}
              href={toAbsoluteUrl(eventDetail.content.homepage)}
            />
          )}
          {eventDetail?.content.email && (
            <InfoItem
              icon={<IconEmailRound className="h-12 w-12 text-gray-700" />}
              text={eventDetail.content.email}
              href={toMailUrl(eventDetail.content.email)}
            />
          )}

          {eventDetail?.content.youtube_ch_id && (
            <InfoItem
              icon={<IconYoutubeRound className="h-12 w-12 text-gray-700" />}
              text="Youtube"
              href={toYoutubeChannelUrl(eventDetail.content.youtube_ch_id)}
            />
          )}

          {eventDetail?.content.instagram_id && (
            <InfoItem
              icon={<IconInstagramRound className="h-12 w-12 text-gray-700" />}
              text="Instagram"
              href={toInstagramUrl(eventDetail.content.instagram_id)}
            />
          )}

          {/* 기존 LinkForDetail도 리스트 아이템로 포함 */}
          {eventDetail?.content.url && (
            <InfoItem
              icon={<IconWebsiteRound className="h-12 w-12 text-gray-700" />}
              text="URL"
              href={eventDetail.content.url}
            />
          )}
          </ul>
        </div>
      </div>
      <div className="m-auto w-full max-w-[1440px] h-96 bg-red-500 overflow-hidden">
        <GoogleMap 
          latitude={eventDetail?.content.latitude || 0}
          longitude={eventDetail?.content.longitude || 0}
          title={eventDetail?.content.title}
          zoom={15}
          className="w-full h-full"
          style={{ minHeight: '384px' }}
          onMapClick={handleMapClick}
          onMarkerClick={handleMarkerClick}
          // showClickHint={true}
          clickHintText={eventDetail?.content.address_native ?? ''}
        />
      </div>
      {/* <div>Profile Image:{eventDetail?.content.profile}</div> */}
      <div className="flex gap-4 justify-center">
        <CompLabelCount01 title="Views" count={eventDetail?.content.view_count ?? 0} minWidth={160} minHeight={160} />
        <CompLabelCount01 title="Saved" count={eventDetail?.content.saved_count ?? 0} minWidth={160} minHeight={160} />
        <CompLabelCount01 title="Shared" count={eventDetail?.content.shared_count ?? 0} minWidth={160} minHeight={160} />
      </div>
      <div className="flex justify-center gap-4 text-gray-500">
        <div>
          Created {eventDetail?.content.created_at 
            ? new Date(eventDetail.content.created_at).toLocaleString(fullLocale, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
        </div>
        <div>
          Updated {eventDetail?.content.updated_at 
            ? new Date(eventDetail.content.updated_at).toLocaleString(fullLocale, {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "-"}
        </div>
      </div>
    </div>
  );
}