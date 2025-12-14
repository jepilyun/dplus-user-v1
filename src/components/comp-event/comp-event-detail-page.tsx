"use client";

import { reqGetEventDetail } from "@/actions/action";
import { HeroImageSlider } from "@/components/comp-image/hero-image-slider";
import { addToCalendar, addToGoogleCalendar, generateCalendarEvent } from "@/utils/save-calendar";
import { detectDevice, DeviceType } from "@/utils/device-detector";
import { ResponseEventDetailForUserFront, SUPPORT_LANG_CODES } from "dplus_common_v1";
import { useEffect, useRef, useState } from "react";
import CompLabelCount01 from "@/components/comp-common/comp-label-count-01";
import { getEventDetailImageUrls } from "@/utils/set-image-urls";
import { useRouter } from "next/navigation";
import { incrementEventViewCount, incrementEventSharedCount, incrementEventSavedCount } from "@/utils/increment-count";
import ShareModal from "../comp-share/comp-share-modal";
import { CompEventActionButtons } from "./comp-event-action-buttons";
import { CompEventHeader } from "./comp-event-header";
import { CompEventDetailMap } from "./comp-event-map";
import { CompEventDescription } from "./comp-event-description";
import { HeadlineTagsDetail } from "../headline-tags-detail";
import { SupportedLocale } from "@/consts/const-config";
import { CompEventDatetime } from "./comp-event-datetime";
import CompEventContactLinks from "./comp-event-contact-links";
import { CompActionButton } from "../comp-common/comp-action-button";
import { ArrowRight } from "lucide-react";
import { CompLinkButton } from "../comp-common/comp-link-button";
import { getDplusI18n } from "@/utils/get-dplus-i18n";


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
  const [imageUrls, setImageUrls] = useState<string[]>(initialData ? getEventDetailImageUrls(initialData.event) : []);

  // ✅ 로컬 카운트 상태 (낙관적 업데이트용)
  const [viewCount, setViewCount] = useState(initialData?.event?.view_count ?? 0);
  const [savedCount, setSavedCount] = useState(initialData?.event?.saved_count ?? 0);
  const [sharedCount, setSharedCount] = useState(initialData?.event?.shared_count ?? 0);
  
  const [showShareModal, setShowShareModal] = useState(false);

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

      setImageUrls(getEventDetailImageUrls(db.event));
      setError(null);
    } catch (e) {
      // 네트워크 에러나 서버 에러
      console.error('Failed to fetch event detail:', e);
      setError('network');
    } finally {
      setLoading(false);
    }
  };

  // ✅ 공유 기능 핸들러 (개선)
  const handleShareClick = async () => {
    const shareData = {
      title: eventDetail?.event.title || '이벤트 공유',
      text: eventDetail?.event.description || '이벤트 정보를 확인해보세요!',
      url: window.location.href,
    };

    // ✅ 테스트를 위해 항상 모달 표시
    // setShowShareModal(true);
    // return;

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
      // ✅ Web Share API가 지원되지 않을 경우 모달 표시
      setShowShareModal(true);
    }
  };

  // ✅ 소셜 미디어 공유 콜백
  const handleSocialShare = async (platform: string) => {
    console.log(`${platform}으로 공유`);
    
    // ✅ 공유 카운트 증가
    const newCount = await incrementEventSharedCount(eventCode);
    if (newCount !== null) {
      setSharedCount(newCount);
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
    <div className="p-4 max-w-[840px] m-auto flex flex-col gap-8">
      <div className="flex flex-col gap-4"
        data-event-code={eventDetail?.event.event_code}
        date-created-at={eventDetail?.event.created_at}
        date-updated-at={eventDetail?.event.updated_at}
      >
        <CompEventHeader eventDetail={eventDetail ?? null} fullLocale={fullLocale} langCode={langCode as SupportedLocale} />
        <CompEventActionButtons
          langCode={langCode}
          deviceType={deviceType}
          handleCalendarSave={handleCalendarSave}
          handleShareClick={handleShareClick}
        />
        <HeroImageSlider
          bucket="events"
          imageUrls={imageUrls}
          className="m-auto w-full"
        />

        <CompEventDescription eventDetail={eventDetail ?? null} langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]} />

        <CompEventContactLinks event={eventDetail?.event} langCode={langCode} />

        <CompEventDetailMap eventDetail={eventDetail ?? null} langCode={langCode as (typeof SUPPORT_LANG_CODES)[number]} />

        {/* <div>Profile Image:{eventDetail?.content.profile}</div> */}
        <div className="flex gap-4 justify-center flex-wrap">
          <CompLabelCount01 label="Views" count={viewCount} />
          <CompLabelCount01 label="Saved" count={savedCount} />
          <CompLabelCount01 label="Shared" count={sharedCount} />
        </div>
      </div>
      {/* ✅ 공유 모달 */}
      <ShareModal
        open={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={eventDetail?.event.title || '이벤트 공유'}
        text={eventDetail?.event.description || ''}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        onShare={handleSocialShare}
        langCode={langCode}
      />
      <div className="flex justify-center items-center">
        <CompLinkButton
          icon={<ArrowRight className="w-5 h-5" />}
          label={getDplusI18n(langCode).detail.more_events}
          onClick={() => router.push(`/`)}
        />
      </div>
    </div>
  );
}