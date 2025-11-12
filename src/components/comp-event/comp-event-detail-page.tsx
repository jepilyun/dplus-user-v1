"use client";

import { reqGetEventDetail } from "@/actions/action";
import BtnWithIcon01 from "@/components/comp-button/btn-with-icon-01";
import GoogleMap from "@/components/comp-google-map/google-map";
import { HeroImageSlider } from "@/components/comp-image/hero-image-slider";
import { IconShare } from "@/icons/icon-share";
import { addToCalendar, addToGoogleCalendar, generateCalendarEvent } from "@/utils/save-calendar";
import { detectDevice, DeviceType } from "@/utils/device-detector";
import { calculateDaysFromToday } from "@/utils/calc-dates";
import { getDdayLabel } from "@/utils/dday-label";
import { ResponseEventDetailForUserFront, SUPPORT_LANG_CODES } from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import { HeadlineTagsDetail } from "@/components/headline-tags-detail";
import { IconGoogleColor } from "@/icons/icon-google-color";
import { IconApple } from "@/icons/icon-apple";
import CompLabelCount01 from "@/components/comp-common/comp-label-count-01";
import CompCommonDatetime from "../comp-common/comp-common-datetime";
import { getEventImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import CompEventContactLinks from "@/components/comp-event/comp-event-contact-links";
import { IconCalendar } from "@/icons/icon-calendar";
import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { incrementEventViewCount, incrementEventSharedCount, incrementEventSavedCount } from "@/utils/increment-count";
import { CountdownTimer } from "@/components/comp-event/comp-event-countdown-timer";


/**
 * 이벤트 상세 페이지
 * @param param0 - 이벤트 ID, 언어 코드, 전체 로케일
 * @returns 이벤트 상세 페이지
 */
export default function CompEventDetailPage({ eventCode, langCode, fullLocale, initialData }: { eventCode: string, langCode: string, fullLocale: string, initialData: ResponseEventDetailForUserFront | null }) {
  const router = useRouter();
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  // ✅ 조회수 증가 여부 추적
  const viewCountIncrementedRef = useRef(false);

  const [error, setError] = useState<'not-found' | 'network' | null>(null);
  const [loading, setLoading] = useState(true);

  const [eventDetail, setEventDetail] = useState<ResponseEventDetailForUserFront | null>(initialData ?? null);
  const [imageUrls, setImageUrls] = useState<string[]>(initialData ? getEventImageUrls(initialData.event) : []);

    // ✅ 로컬 카운트 상태 (낙관적 업데이트용)
  const [viewCount, setViewCount] = useState(initialData?.event.view_count ?? 0);
  const [savedCount, setSavedCount] = useState(initialData?.event.saved_count ?? 0);
  const [sharedCount, setSharedCount] = useState(initialData?.event.shared_count ?? 0);

  const fetchEventDetail = async () => {
    // ✅ 초기 데이터가 있으면 fetch 생략
    if (initialData) {
      setLoading(false);
      return;
    }

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

      // ✅ view_count 업데이트
      setViewCount(db?.event?.view_count ?? 0);
      setSavedCount(db?.event?.saved_count ?? 0);
      setSharedCount(db?.event?.shared_count ?? 0);

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
  
  // ✅ 공유 기능 핸들러 (shared_count 증가)
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
        
        // ✅ 공유 성공 시 카운트 증가
        const newCount = await incrementEventSharedCount(eventCode);
        if (newCount !== null) {
          setSharedCount(newCount);
        }
      } catch (error) {
        console.error('공유 실패:', error);
      }
    } else {
      // Web Share API가 지원되지 않을 경우
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`;
      window.open(twitterUrl, '_blank', 'width=600,height=400');
      
      // ✅ 트위터 공유 시에도 카운트 증가
      const newCount = await incrementEventSharedCount(eventCode);
      if (newCount !== null) {
        setSharedCount(newCount);
      }
    }
  };

  // ✅ 캘린더 저장 핸들러 (saved_count 증가)
  const handleCalendarSave = async (type: 'google' | 'apple' | 'ics') => {
    const calendarEvent = generateCalendarEvent(eventDetail?.event ?? null);
    
    if (type === 'google') {
      addToGoogleCalendar(calendarEvent);
    } else {
      addToCalendar(eventDetail?.event ?? null);
    }

    // ✅ 캘린더 저장 시 카운트 증가
    const newCount = await incrementEventSavedCount(eventCode);
    if (newCount !== null) {
      setSavedCount(newCount);
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

  // ✅ 페이지 진입 시 view_count 증가 (한 번만)
  useEffect(() => {
    const incrementViewCount = async () => {
      if (!viewCountIncrementedRef.current && eventCode) {
        viewCountIncrementedRef.current = true;
        
        const newCount = await incrementEventViewCount(eventCode);
        if (newCount !== null) {
          setViewCount(newCount);
        }
      }
    };

    incrementViewCount();
  }, [eventCode]);

    useEffect(() => {
    fetchEventDetail();
    setDeviceType(detectDevice());
  }, [eventCode]);

  // 버튼 레이블을 동적으로 생성
  const getCalendarButtonLabel = () => {
    switch (deviceType) {
      case 'ios':
        return 'Apple Calendar';
      case 'android':
        return 'Download ICS';
      case 'desktop':
      default:
        return 'Download ICS';
    }
  };

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
      {/* ✅ 타이머 컴포넌트 분리 */}
      <CountdownTimer 
        startAtUtc={eventDetail?.event.start_at_utc || ''}
        ddayLabel={eventDetail?.event.date ? getDdayLabel(calculateDaysFromToday(eventDetail?.event.date)) : ''}
      />
      <CompCommonDatetime 
        datetime={eventDetail?.event.date ?? null}
        fullLocale={fullLocale}
        time={eventDetail?.event.time ?? null}
        isRepeatAnnually={eventDetail?.event.is_repeat_annually ?? false}
      />
      <div className="flex flex-col gap-3 sm:gap-4 md:gap-6 justify-center items-center">
        <HeadlineTagsDetail
          targetCountryCode={eventDetail?.event.target_country_code || null}
          targetCountryName={eventDetail?.event.target_country_native || null}
          targetCityCode={eventDetail?.event.target_city_code || null}
          targetCityName={eventDetail?.event.target_city_native || null}
          categories={eventDetail?.mapCategoryEvent?.items ?? null}
          langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]}
        />
        <div
          id="event-title"
          className="py-3 text-center px-4 sm:px-6 sm:py-4 md:px-8 md:py-5 lg:px-10 lg:py-6 font-black
                    text-xl sm:text-2xl md:text-3xl leading-[1.8]"
          data-event-code={eventDetail?.event.event_code}
        >
          {eventDetail?.event.title}
        </div>
      </div>
      {/* <div className="flex gap-4 justify-center">
        <BtnWithIcon01 
          title={getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.google_calendar} 
          icon={<IconGoogleColor />} 
          onClick={() => addToGoogleCalendar(generateCalendarEvent(eventDetail?.event ?? null))} 
          width={22} 
          height={22} 
          minWidth={180} 
        />
        <BtnWithIcon01
          title={deviceType === 'ios' ? getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.apple_calendar : getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.ics_download}
          icon={deviceType === 'ios' ? <IconApple /> : <IconCalendar />}
          onClick={() => addToCalendar(eventDetail?.event ?? null)}
          width={22}
          height={22}
          minWidth={180}
        />
        <BtnWithIcon01 
          title={getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.share} 
          icon={<IconShare />} 
          onClick={handleShareClick} 
          width={22} 
          height={22} 
          minWidth={180} 
        />
      </div> */}
      {/* ✅ 버튼들 수정 */}
      <div className="flex gap-4 justify-center">
        <BtnWithIcon01 
          title={getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.google_calendar} 
          icon={<IconGoogleColor />} 
          onClick={() => handleCalendarSave('google')} 
          width={22} 
          height={22} 
          minWidth={180} 
        />
        <BtnWithIcon01
          title={deviceType === 'ios' ? getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.apple_calendar : getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.ics_download}
          icon={deviceType === 'ios' ? <IconApple /> : <IconCalendar />}
          onClick={() => handleCalendarSave(deviceType === 'ios' ? 'apple' : 'ics')}
          width={22}
          height={22}
          minWidth={180}
        />
        <BtnWithIcon01 
          title={getDplusI18n(langCode as (typeof SUPPORT_LANG_CODES)[number]).detail.share} 
          icon={<IconShare />} 
          onClick={handleShareClick} 
          width={22} 
          height={22} 
          minWidth={180} 
        />
      </div>
      <HeroImageSlider
        bucket="events"
        imageUrls={imageUrls}
        className="m-auto w-full flex max-w-[1440px]"
      />
      {eventDetail?.event.description && (
        <div className="m-auto p-4 px-8 text-center w-full text-lg max-w-[1024px] whitespace-pre-line">{eventDetail?.event.description}</div>
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
      <CompEventContactLinks event={eventDetail?.event} langCode={langCode} />
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
      <div className="my-6 sm:my-8 md:my-10 flex gap-4 justify-center flex-wrap">
        <CompLabelCount01 label="Views" count={eventDetail?.event.view_count ?? 0} />
        <CompLabelCount01 label="Saved" count={eventDetail?.event.saved_count ?? 0} />
        <CompLabelCount01 label="Shared" count={eventDetail?.event.shared_count ?? 0} />
      </div>
    </div>
  );
}