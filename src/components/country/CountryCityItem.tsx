import { getCityBgUrl } from "@/utils/image/getCityBgImage";
import { TCityInfoForCountryDetail } from "dplus_common_v1";
import Link from "next/link";

export const CompCountryCityItem = ({ city }: { city: TCityInfoForCountryDetail }) => {
  const bg = getCityBgUrl(city);
  return (
    <Link
      key={city.city_code}
      href={`/city/${city.city_code}`}
      className={[
        "relative flex flex-col items-center justify-center gap-1",
        "h-full min-h-[120px] w-full rounded-3xl overflow-hidden group",
        "transition-all duration-300",
        bg 
          ? "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_1px_1px_0px_rgba(0,0,0,0.15)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_6px_8px_-5px_rgba(0,0,0,0.2)] active:translate-y-0" 
          : "border border-gray-200 bg-gray-50 hover:bg-gray-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_1px_0px_rgba(0,0,0,0.15)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_6px_8px_-5px_rgba(0,0,0,0.2)] active:translate-y-0",
      ].join(" ")}
    >
      {bg && (
        <>
          {/* 배경 이미지 */}
          <div
            className="absolute inset-0 bg-center bg-cover transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${bg})` }}
            aria-hidden="true"
          />
          
          {/* 어두운 그라데이션 오버레이 (하단 → 상단) */}
          <div 
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 transition-opacity duration-300 group-hover:from-black/60 group-hover:via-black/30 group-hover:to-black/10" 
            aria-hidden="true"
          />
          
          {/* 상단 하이라이트 */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent pointer-events-none" 
            aria-hidden="true"
          />
        </>
      )}
      
      <div className="relative z-10 w-full p-4">
        <div
          className={[
            "text-xl font-bold text-center transition-transform duration-200",
            bg 
              ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]" 
              : "text-gray-900",
          ].join(" ")}
        >
          {city.name_native ?? city.name}
        </div>
        <div
          className={[
            "text-sm text-center transition-transform duration-200",
            bg
              ? "text-white/95 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
              : "text-muted-foreground",
          ].join(" ")}
        >
          {city.name}
        </div>
      </div>
    </Link>
  );
};