import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface GoogleMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  onMapClick?: () => void;
  onMarkerClick?: () => void;
  showClickHint?: boolean;
  clickHintText?: string;
  markerConfig?: {
    scale?: number;
    background?: string;
    borderColor?: string;
    glyphColor?: string;
  };
  mapOptions?: Partial<google.maps.MapOptions>;
}

export default function GoogleMap({
  latitude,
  longitude,
  title = "Location",
  zoom = 15,
  className = "w-full h-full",
  style,
  onMapClick,
  onMarkerClick,
  showClickHint = false,
  clickHintText = "Click to open in Google Maps",
  markerConfig = {
    scale: 1.0,
    background: "#ff1744",
    borderColor: "#ffffff",
    glyphColor: "#ff1744",
  },
  mapOptions = {},
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      setMapLoading(true);
      setMapError(false);

      const loader = new Loader({
        apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
        version: "weekly",
        libraries: ["marker"],
      });

      try {
        const google = await loader.load();

        const position = {
          lat: latitude,
          lng: longitude,
        };

        // 타입 단언을 사용한 라이브러리 임포트
        const mapsLibrary = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const markerLibrary = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

        const { Map } = mapsLibrary;
        const { AdvancedMarkerElement, PinElement } = markerLibrary;

        // 기본 맵 옵션과 사용자 정의 옵션 병합
        const defaultMapOptions: google.maps.MapOptions = {
          zoom,
          center: position,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID!,
        };

        const finalMapOptions = { ...defaultMapOptions, ...mapOptions };

        const map = new Map(mapRef.current, finalMapOptions);

        const pinElement = new PinElement({
          scale: markerConfig.scale,
          background: markerConfig.background,
          borderColor: markerConfig.borderColor,
          glyphColor: markerConfig.glyphColor,
        });

        const marker = new AdvancedMarkerElement({
          map: map,
          position: position,
          title: title,
          content: pinElement.element,
        });

        // 지도 클릭 이벤트
        if (onMapClick) {
          map.addListener('click', onMapClick);
        }
        
        // 마커 클릭 이벤트
        if (onMarkerClick) {
          marker.element.addEventListener('click', onMarkerClick);
        }

        setMapLoading(false);

      } catch (error) {
        console.error("Failed to load Google Maps", error);
        setMapError(true);
        setMapLoading(false);
      }
    };

    initMap();

  }, [latitude, longitude, title, zoom, onMapClick, onMarkerClick, markerConfig]);

  return (
    <div className={`relative ${className}`} style={style}>
      <div 
        ref={mapRef} 
        className="w-full h-full cursor-pointer"
      />
      
      {/* 지도 로딩 중 표시 */}
      {mapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="text-gray-500">Loading map...</div>
        </div>
      )}

      {/* 지도 로딩 에러 표시 */}
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="text-red-500 text-center">
            <div>Failed to load map</div>
            <div className="text-xs mt-1">Please refresh the page</div>
          </div>
        </div>
      )}

      {/* 클릭 힌트 오버레이 */}
      {!mapLoading && !mapError && showClickHint && clickHintText.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white text-xs p-2 rounded">
          {clickHintText}
        </div>
      )}
    </div>
  );
}