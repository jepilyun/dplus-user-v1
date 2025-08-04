import Link from "next/link";
import TopNavSearchBox from "./top-nav-search-box";

export default function TopNavCity({ cityName, cityCode, langCode }: { cityName?: string, cityCode?: string, langCode?: string }) {

  return (
    <nav className="flex justify-between items-center p-6 px-12">
      <div className="flex items-center gap-4">
        <Link href="/">
          <div className="font-logo">Trand</div>
        </Link>
        {cityName && (
          <Link href={`/city/${cityCode}/${langCode}`}>
            <div className="top-nav-city">
              #{cityName}
            </div>
          </Link>
        )}
      </div>
      <TopNavSearchBox />
    </nav>
  );
}
