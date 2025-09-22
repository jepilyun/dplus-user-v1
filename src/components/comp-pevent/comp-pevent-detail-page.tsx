"use client";

import { reqGetPeventDetail } from "@/actions/action";
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
import { ResponsePeventDetailForUserFront, SUPPORT_LANG_CODE_TYPE } from "dplus_common_v1";
import { useEffect, useState } from "react";
import { toAbsoluteUrl, toInstagramUrl, toMailUrl, toTelUrl, toYoutubeChannelUrl } from "@/utils/basic-info-utils";
import { InfoItem } from "@/components/info-item";
import { HeadlineTagsDetail } from "@/components/headline-tags-detail";
import { IconGoogleColor } from "@/icons/icon-google-color";
import { IconApple } from "@/icons/icon-apple";
import CompLabelCount01 from "@/components/comp-common/comp-label-count-01";
import CompCommonDatetime from "../comp-common/comp-common-datetime";
import { CompDatesInDetail } from "../comp-common/comp-dates-in-detail";
import { getPeventImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";


/**
 * P(ublic) 이벤트 상세 페이지
 * @param param0 - 이벤트 ID, 언어 코드, 전체 로케일
 * @returns P(ublic) 이벤트 상세 페이지
 */
export default function CompPeventDetailPage({ peventId, langCode, fullLocale }: { peventId: string, langCode: string, fullLocale: string }) {
  const router = useRouter();
  const [peventDetail, setPeventDetail] = useState<ResponsePeventDetailForUserFront | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const fetchPeventDetail = async () => {
    try {
      const res = await reqGetPeventDetail(peventId, langCode);
      const db = res?.dbResponse;

      const isEmptyObj =
        !db || (typeof db === "object" && !Array.isArray(db) && Object.keys(db).length === 0);

      // ❗데이터 없으면 에러 페이지로
      if (!res?.success || isEmptyObj || !db?.content) {
        router.replace(`/error/content-not-found?type=pevent&lang=${encodeURIComponent(langCode)}`);
        return;
      }

      setPeventDetail(db);
      setImageUrls(getPeventImageUrls(db.content));
    } catch (e) {
      router.replace(`/error/content-not-found?type=pevent&lang=${encodeURIComponent(langCode)}`);
    }
  };
  
  // 공유 기능 핸들러
  const handleShareClick = async () => {
    const shareData = {
      title: peventDetail?.content.title || 'P이벤트 공유',
      text: peventDetail?.content.description || 'P이벤트 정보를 확인해보세요!',
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
    if (peventDetail?.content.google_map_url) {
      window.open(peventDetail?.content.google_map_url, '_blank');
    }
  };

  const handleMarkerClick = () => {
    if (peventDetail?.content.google_map_url) {
      window.open(peventDetail?.content.google_map_url, '_blank');
    }
  };

  useEffect(() => {
    fetchPeventDetail();
  }, [peventId]);

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center font-jost font-extrabold text-8xl">
        {peventDetail?.content.date ? getDdayLabel(calculateDaysFromToday(peventDetail?.content.date)) : ''}
      </div>
      <CompCommonDatetime 
        datetime={peventDetail?.content.date ?? null}
        fullLocale={fullLocale}
        time={peventDetail?.content.time ?? null}
        isRepeatAnnually={peventDetail?.content.is_repeat_annually ?? false}
      />
      <HeadlineTagsDetail
        targetCountryCode={peventDetail?.content.target_country_code || null}
        targetCountryName={peventDetail?.content.target_country_native || null}
        targetCityCode={peventDetail?.content.target_city_code || null}
        targetCityName={peventDetail?.content.target_city_name_native || null}
        langCode={langCode as SUPPORT_LANG_CODE_TYPE}
      />
      <div id="event-title" className="text-center font-extrabold text-3xl"
        data-event-id={peventDetail?.content.pevent_id} 
        data-event-code={peventDetail?.content.pevent_code}
      >
        {peventDetail?.content.title}
      </div>
      <div className="flex gap-4 justify-center">
        <BtnWithIcon01 
          title="Calendar" 
          icon={<IconGoogleColor />} 
          onClick={() => addToGoogleCalendar(generateGoogleCalendarEvent(peventDetail?.content ?? null))} 
          width={22} 
          height={22} 
          minWidth={180} />
        <BtnWithIcon01
          title="Calendar"
          icon={<IconApple />}
          onClick={() => addToAppleCalendarFromDetail(peventDetail?.content ?? null)}
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
      {peventDetail?.content.description && (
        <div className="m-auto p-4 px-8 w-full text-lg max-w-[1440px] whitespace-pre-line">{peventDetail?.content.description}</div>
      )}
      <div className="m-auto w-full max-w-[1280px]">
        <div className="rounded-xl bg-white/70 p-8 sm:p-12">
          <ul
            className="
              grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
              gap-x-6 gap-y-6
            "
            aria-label="event contact & links"
          >
          {peventDetail?.content.address_native && (
            <InfoItem
              icon={<IconMapPinRound className="h-12 w-12 text-gray-700" />}
              text={peventDetail.content.address_native}
              // 위도경도 있으면 지도 연결, 없으면 주소 검색
              href={
                peventDetail.content.latitude && peventDetail.content.longitude
                  ? `https://maps.google.com/?q=${peventDetail.content.latitude},${peventDetail.content.longitude}`
                  : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(peventDetail.content.address_native)}`
              }
              breakWords // 주소는 줄바꿈 허용
            />
          )}
          {peventDetail?.content.phone && (
            <InfoItem
              icon={<IconPhoneRound className="h-12 w-12 text-gray-700" />}
              text={`+${peventDetail.content.phone_country_code} ${peventDetail.content.phone}`}
              href={toTelUrl(peventDetail.content.phone)}
            />
          )}
          {peventDetail?.content.homepage && (
            <InfoItem
              icon={<IconHomepageRound className="h-12 w-12 text-gray-700" />}
              text={peventDetail.content.homepage.replace(/^https?:\/\//i, "")}
              href={toAbsoluteUrl(peventDetail.content.homepage)}
            />
          )}
          {peventDetail?.content.email && (
            <InfoItem
              icon={<IconEmailRound className="h-12 w-12 text-gray-700" />}
              text={peventDetail.content.email}
              href={toMailUrl(peventDetail.content.email)}
            />
          )}

          {peventDetail?.content.youtube_ch_id && (
            <InfoItem
              icon={<IconYoutubeRound className="h-12 w-12 text-gray-700" />}
              text="Youtube"
              href={toYoutubeChannelUrl(peventDetail.content.youtube_ch_id)}
            />
          )}

          {peventDetail?.content.instagram_id && (
            <InfoItem
              icon={<IconInstagramRound className="h-12 w-12 text-gray-700" />}
              text="Instagram"
              href={toInstagramUrl(peventDetail.content.instagram_id)}
            />
          )}

          {/* 기존 LinkForDetail도 리스트 아이템로 포함 */}
          {peventDetail?.content.url && (
            <InfoItem
              icon={<IconWebsiteRound className="h-12 w-12 text-gray-700" />}
              text="URL"
              href={peventDetail.content.url}
            />
          )}
          </ul>
        </div>
      </div>
      {peventDetail?.content.latitude && peventDetail?.content.longitude && (
        <div className="m-auto w-full max-w-[1440px] h-96 bg-red-500 overflow-hidden">
          <GoogleMap 
            latitude={peventDetail?.content.latitude || 0}
            longitude={peventDetail?.content.longitude || 0}
            title={peventDetail?.content.title}
            zoom={15}
            className="w-full h-full"
            style={{ minHeight: '384px' }}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
            // showClickHint={true}
            clickHintText={peventDetail?.content.address_native ?? ''}
          />
        </div>
      )}
      {/* <div>Profile Image:{eventDetail?.content.profile}</div> */}
      <div className="flex gap-4 justify-center">
        <CompLabelCount01 title="Views" count={peventDetail?.content.view_count ?? 0} minWidth={160} minHeight={160} />
        <CompLabelCount01 title="Saved" count={peventDetail?.content.saved_count ?? 0} minWidth={160} minHeight={160} />
        <CompLabelCount01 title="Shared" count={peventDetail?.content.shared_count ?? 0} minWidth={160} minHeight={160} />
      </div>
      <CompDatesInDetail createdAt={peventDetail?.content.created_at} updatedAt={peventDetail?.content.updated_at} fullLocale={fullLocale} />
    </div>
  );
}