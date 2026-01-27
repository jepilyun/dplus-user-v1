"use client";

import { useEffect, useRef, useState, memo } from "react";
import { Loader } from "@googlemaps/js-api-loader";

/* ===================================
 * Loader Singleton (중요)
 * =================================== */
const googleMapsLoader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  version: "weekly",
  libraries: ["marker"],
});

/* ===================================
 * Types
 * =================================== */
interface GoogleMapProps {
  latitude: number;
  longitude: number;
  title?: string;
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  markerConfig?: {
    scale?: number;
    background?: string;
    borderColor?: string;
    glyphColor?: string;
  };
  mapOptions?: Partial<google.maps.MapOptions>;
}

/* ===================================
 * Defaults
 * =================================== */
const DEFAULT_MARKER_CONFIG = {
  scale: 1,
  background: "#ff1744",
  borderColor: "#ffffff",
  glyphColor: "#ff1744",
} as const;

/* ===================================
 * Component
 * =================================== */
const GoogleMap = memo(function GoogleMap({
  latitude,
  longitude,
  title = "Location",
  zoom = 15,
  className = "w-full h-full",
  style,
  markerConfig = DEFAULT_MARKER_CONFIG,
  mapOptions = {},
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  /* ===================================
   * Map 최초 1회 생성
   * =================================== */
  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      try {
        setMapLoading(true);
        setMapError(false);

        const google = await googleMapsLoader.load();
        if (!mounted) return;

        const { Map } = (await google.maps.importLibrary(
          "maps"
        )) as google.maps.MapsLibrary;

        const { AdvancedMarkerElement, PinElement } =
          (await google.maps.importLibrary(
            "marker"
          )) as google.maps.MarkerLibrary;

        const position = { lat: latitude, lng: longitude };

        const map = new Map(mapRef.current, {
          center: position,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: "auto",
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAP_ID!,
          ...mapOptions,
        });

        const pin = new PinElement({
          scale: markerConfig.scale,
          background: markerConfig.background,
          borderColor: markerConfig.borderColor,
          glyphColor: markerConfig.glyphColor,
        });

        const marker = new AdvancedMarkerElement({
          map,
          position,
          title,
          content: pin.element,
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;

        if (mounted) setMapLoading(false);
      } catch (err) {
        console.error("Failed to load Google Maps", err);
        if (mounted) {
          setMapError(true);
          setMapLoading(false);
        }
      }
    };

    initMap();

    return () => {
      mounted = false;
      // ❗ map / marker destroy ❌ (깜빡임 원인)
    };
  }, []); // ✅ 단 1회

  /* ===================================
   * 좌표 변경 시 위치만 업데이트
   * =================================== */
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    const position = { lat: latitude, lng: longitude };
    mapInstanceRef.current.setCenter(position);
    markerRef.current.position = position;
  }, [latitude, longitude]);

  return (
    <div className={`relative ${className}`} style={style}>
      <div ref={mapRef} className="w-full h-full" />

      {mapLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="text-gray-500 text-sm">Loading map...</div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="text-red-500 text-center text-sm">
            <div>Failed to load map</div>
            <div className="text-xs mt-1">Please refresh</div>
          </div>
        </div>
      )}
    </div>
  );
});

export default GoogleMap;
