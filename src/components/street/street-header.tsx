import { IconInstagram } from "@/icons/icon-instagram";
import { IconMap } from "@/icons/icon-map";
import { IconYoutube } from "@/icons/icon-youtube";
import { generateStreetImageUrl } from "@/utils/generate-image-url";
import { TStreetDetail } from "trand_common_v1";
import { LinkForHeader } from "../links-for-header";
import GoogleMap from "../google-map/google-map";

export default function StreetHeader({ streetDetail }: { streetDetail: TStreetDetail }) {
  const handleMapClick = () => {
    if (streetDetail.google_map_url) {
      window.open(streetDetail.google_map_url, '_blank');
    }
  };

  const handleMarkerClick = () => {
    if (streetDetail.google_map_url) {
      window.open(streetDetail.google_map_url, '_blank');
    }
  };

  return (
    <div data-city-code={streetDetail.city_code} data-street-code={streetDetail.street_code}>
      <div className="flex h-96">
        {/* 왼쪽 2/3 - 기존 헤더 */}
        <div 
          className="w-2/3 bg-cover bg-center relative"
          style={{ 
            backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.5), rgba(0,0,0,0.1)), url(${generateStreetImageUrl(streetDetail.thumbnail_main_1)})`
          }}
        >
          <div className="relative z-10 flex flex-col gap-16 items-center justify-center h-full text-white text-center px-4">
            <div>
              <div className="text-xl">{streetDetail.native}</div>
              <div className="text-6xl font-bold font-poppins">{streetDetail.name}</div>
            </div>
            <div className="text-xs flex flex-wrap items-center gap-4">
              {streetDetail.google_map_url && (
                <LinkForHeader title="Map" href={streetDetail.google_map_url} icon={<IconMap />} />
              )}
              {streetDetail.instagram_id && (
                <LinkForHeader title="Instagram" href={`https://www.instagram.com/${streetDetail.instagram_id}`} icon={<IconInstagram />} />
              )}
              {streetDetail.youtube_ch_id && (
                <LinkForHeader title="YouTube" href={`https://www.youtube.com/channel/${streetDetail.youtube_ch_id}`} icon={<IconYoutube />} />
              )}
            </div>
          </div>
        </div>

        {/* 오른쪽 1/3 - 구글 지도 */}
        <div className="w-1/3">
          <GoogleMap
            latitude={streetDetail.latitude || 0}
            longitude={streetDetail.longitude || 0}
            title={streetDetail.name}
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