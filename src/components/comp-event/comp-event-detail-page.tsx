"use client";

import { reqGetEventDetail } from "@/actions/action";
import BtnWithIcon01 from "@/components/comp-button/btn-with-icon-01";
import GoogleMap from "@/components/comp-google-map/google-map";
import { HeroImageSlider } from "@/components/comp-image/hero-image-slider";
import { IconShare } from "@/icons/icon-share";
import { addToAppleCalendarFromDetail, addToGoogleCalendar, generateGoogleCalendarEvent } from "@/utils/save-calendar";
import { calculateDaysFromToday } from "@/utils/calc-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { ResponseEventDetailForUserFront, SUPPORT_LANG_CODES } from "dplus_common_v1";
import { useEffect, useState } from "react";
import { HeadlineTagsDetail } from "@/components/headline-tags-detail";
import { IconGoogleColor } from "@/icons/icon-google-color";
import { IconApple } from "@/icons/icon-apple";
import CompLabelCount01 from "@/components/comp-common/comp-label-count-01";
import CompCommonDatetime from "../comp-common/comp-common-datetime";
import { getEventImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import CompEventContactLinks from "@/components/comp-event/comp-event-contact-links";

/**
 * 이벤트 상세 페이지
 * @param param0 - 이벤트 ID, 언어 코드, 전체 로케일
 * @returns 이벤트 상세 페이지
 */
export default function CompEventDetailPage({ eventCode, langCode, fullLocale }: { eventCode: string, langCode: string, fullLocale: string }) {
  const router = useRouter();

  const [error, setError] = useState<'not-found' | 'network' | null>(null);
  const [loading, setLoading] = useState(true);

  const [eventDetail, setEventDetail] = useState<ResponseEventDetailForUserFront | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const fetchEventDetail = async () => {
    try {
      const res = await reqGetEventDetail(eventCode, langCode);
      const db = res?.dbResponse;

      const isEmptyObj =
        !db || (typeof db === "object" && !Array.isArray(db) && Object.keys(db).length === 0);

      // 응답은 있지만 데이터가 없는 경우 (404)
      if (!res?.success || isEmptyObj || !db?.event) {
        setError('not-found');
        setLoading(false);
        return;
      } 

      setEventDetail(db);
      setImageUrls(getEventImageUrls(db.event));
      setError(null);
    } catch (e) {
      // 네트워크 에러나 서버 에러
      console.error('Failed to fetch event detail:', e);
      setError('network');
    } finally {
      setLoading(false);
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

  // 로딩 중
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div>Loading...</div>
      </div>
    );
  }

  // 이벤트를 찾을 수 없는 경우 - 인라인 에러 표시
  if (error === 'not-found') {
    return (
      <div className="mx-auto w-full max-w-[1024px] px-4 py-20">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">
            해당 이벤트는 존재하지 않습니다.
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
            Failed to load event details. Please try again.
          </p>
          <button
            onClick={() => fetchEventDetail()}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8"
      data-event-code={eventDetail?.event.event_code}
      date-created-at={eventDetail?.event.created_at}
      date-updated-at={eventDetail?.event.updated_at}
    >
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
        langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
      />
      <div id="event-title" className="text-center font-extrabold text-3xl"
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
        bucket="events"
        imageUrls={imageUrls}
        className="m-auto w-full flex max-w-[1440px]"
      />
      {eventDetail?.event.description && (
        <div className="m-auto p-4 px-8 w-full text-lg max-w-[1024px] whitespace-pre-line">{eventDetail?.event.description}</div>
      )}
      {eventDetail?.mapStagEvent?.items.map(item => (
        <div key={item.stag_info?.stag_code}>
          <div>{item.stag_info?.stag_native}</div>
        </div>
      ))}
      {eventDetail?.mapTagEvent?.items.map(item => (
        <div key={item.tag_info?.tag_code}>
          <div>{item.tag_info?.tag_code}</div>
        </div>
      ))}
      <CompEventContactLinks event={eventDetail?.event} />
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
    </div>
  );
}