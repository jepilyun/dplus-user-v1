import { getCityBgUrl } from "@/utils/get-city-bg-image";
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
        "h-full min-h-[120px] w-full rounded-3xl border border-gray-200 p-4",
        "transition-all duration-200 overflow-hidden group shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_5px_0_rgba(0,0,0,0.15)]",
        bg ? "bg-gray-900" : "bg-gray-50 hover:bg-gray-100",
      ].join(" ")}
    >
      {bg && (
        <>
          <div
            className="absolute inset-0 bg-center bg-cover transition-transform duration-300 group-hover:scale-105"
            style={{ backgroundImage: `url(${bg})` }}
            aria-hidden="true"
          />
          <div 
            className="absolute inset-0 bg-black/60 transition-opacity duration-200 group-hover:bg-black/40" 
            aria-hidden="true"
          />
        </>
      )}
      <div className="relative z-10 w-full">
        <div
          className={[
            "text-xl font-bold text-center transition-transform duration-200",
            bg 
              ? "text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] group-hover:scale-105" 
              : "text-gray-900",
          ].join(" ")}
        >
          {city.name_native ?? city.name}
        </div>
        <div
          className={[
            "text-sm text-center transition-transform duration-200",
            bg
              ? "text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:scale-105"
              : "text-muted-foreground",
          ].join(" ")}
        >
          {city.name}
        </div>
      </div>
    </Link>
  );
};