import { IconInstagram } from "@/icons/icon-instagram";
import { IconMap } from "@/icons/icon-map";
import { IconYoutube } from "@/icons/icon-youtube";
import { generateContentImageUrl } from "@/utils/generate-image-url";
import { TContentDetail } from "trand_common_v1";
import { LinkForHeader } from "../links-for-header";
import GoogleMap from "../google-map/google-map";

export default function ContentHeader({ contentDetail }: { contentDetail: TContentDetail }) {
  const handleMapClick = () => {
    if (contentDetail.google_place_url) {
      window.open(contentDetail.google_place_url, '_blank');
    }
  };

  const handleMarkerClick = () => {
    if (contentDetail.google_place_url) {
      window.open(contentDetail.google_place_url, '_blank');
    }
  };

  return (
    <div data-city-code={contentDetail.city_code} data-content-code={contentDetail.content_code}>
      <div className="flex h-96">
        {/* 왼쪽 2/3 - 기존 헤더 */}
        <div 
          className="w-2/3 bg-cover bg-center relative"
          style={{ 
            backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.1)), url(${generateContentImageUrl(contentDetail.thumbnail_main_1)})`
          }}
        >
          <div className="relative z-10 flex flex-col gap-16 items-center justify-center h-full text-white text-center px-4">
            <div>
              <div className="text-xl">{contentDetail.native}</div>
              <div className="text-6xl font-bold font-poppins">{contentDetail.name}</div>
            </div>
            <div className="text-xs flex flex-wrap items-center gap-4">
              {contentDetail.google_place_url && (
                <LinkForHeader title="Map" href={contentDetail.google_place_url} icon={<IconMap />} />
              )}
              {contentDetail.instagram_id && (
                <LinkForHeader title="Instagram" href={`https://www.instagram.com/${contentDetail.instagram_id}`} icon={<IconInstagram />} />
              )}
              {contentDetail.youtube_ch_id && (
                <LinkForHeader title="YouTube" href={`https://www.youtube.com/channel/${contentDetail.youtube_ch_id}`} icon={<IconYoutube />} />
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 1/3 - 구글 지도 */}
        <div className="w-1/3">
          <GoogleMap
            latitude={contentDetail.latitude || 0}
            longitude={contentDetail.longitude || 0}
            title={contentDetail.name}
            zoom={15}
            className="w-full h-full"
            style={{ minHeight: '384px' }}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
            showClickHint={true}
            clickHintText="Click to open in Google Maps"
          />
        </div>
      </div>
    </div>
  );
}