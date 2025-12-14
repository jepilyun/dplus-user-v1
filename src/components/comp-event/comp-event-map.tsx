import { ResponseEventDetailForUserFront, SUPPORT_LANG_CODES } from "dplus_common_v1"
import GoogleMap from "../comp-google-map/google-map"
import Link from "next/link"
import { Map, MapPin, Navigation } from "lucide-react"
import { getDplusI18n } from "@/utils/get-dplus-i18n"

/**
 * 이벤트 상세 페이지 지도 컴포넌트
 * @param eventDetail - 이벤트 상세 정보
 * @param langCode - 언어 코드
 * @returns 
 */
export const CompEventDetailMap = ({ eventDetail, langCode }: { eventDetail: ResponseEventDetailForUserFront | null, langCode: (typeof SUPPORT_LANG_CODES)[number] }) => {
  if (!eventDetail || !eventDetail.event.address_native || !eventDetail.event.latitude || !eventDetail.event.longitude) return null;

  // ✅ 구글 지도 열기 핸들러
  const handleOpenGoogleMap = () => {
    if (eventDetail?.event.google_map_url) {
      window.open(eventDetail?.event.google_map_url, '_blank');
    }
  };

  // ✅ 길찾기 URL 가져오기
  const getDirectionsUrl = () => {
    if (eventDetail?.event.latitude && eventDetail?.event.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${eventDetail?.event.latitude},${eventDetail?.event.longitude}`;
    }
    
    return null;
  };

  // ✅ 길찾기 열기 핸들러
  const handleOpenDirections = () => {
    const url = getDirectionsUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <div className="flex flex-col m-auto w-full border border-white rounded-4xl overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_3px_0_rgba(0,0,0,0.15)]">
      <div className="rounded-xl">
        {eventDetail?.event.latitude && eventDetail?.event.longitude && (
          <div className="w-full overflow-hidden relative h-48 md:h-60">
            <GoogleMap
              latitude={eventDetail?.event.latitude || 0}
              longitude={eventDetail?.event.longitude || 0}
              title={eventDetail?.event.title}
              zoom={15}
              className="w-full h-full"
              clickHintText={eventDetail?.event.address_native ?? ''}
            />
            {/* ✅ 주소 오버레이 */}
            <div className="absolute top-4 right-4 text-white bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg max-w-[calc(100%-2rem)] z-10">
              <div className="flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="text-xs md:text-sm font-medium line-clamp-2">
                  {eventDetail.event.address_native}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="px-4 py-1 flex flex-wrap font-bold text-sm md:text-base items-center justify-between text-gray-600 bg-white">
          <button 
            onClick={handleOpenGoogleMap}
            className="flex items-center justify-center gap-2 px-2 py-4 cursor-pointer hover:text-gray-900 hover:scale-105 duration-300 transition-all"
          >
            <Map className="w-5 h-5 flex-shrink-0" />
            <span>{getDplusI18n(langCode).detail.open_in_maps}</span>
          </button>
          <button 
            onClick={handleOpenDirections}
            className="flex items-center justify-center gap-2 px-2 py-4 cursor-pointer hover:text-gray-900 hover:scale-105 duration-300 transition-all"
          >
            <Navigation className="w-5 h-5 flex-shrink-0" />
            <span>{getDplusI18n(langCode).detail.directions}</span>
          </button>
        </div>
      </div>
    </div>
  )
}