import { SUPPORT_LANG_CODES, TMapCategoryEventWithCategoryInfo, TMapCategoryFolderWithCategoryInfo } from "dplus_common_v1";
import Link from "next/link";

export const HeadlineTagsDetail = ({
  targetCountryCode,
  targetCountryName,
  targetCityCode,
  targetCityName,
  categories,
  langCode,
  showCountry = true,
  bgColor,
  fgColor,
  fgHoverColor,
}: {
  targetCountryCode?: string | null;
  targetCountryName?: string | null;
  targetCityCode?: string | null;
  targetCityName?: string | null;
  categories?: TMapCategoryEventWithCategoryInfo[] | TMapCategoryFolderWithCategoryInfo[] | null;
  langCode?: (typeof SUPPORT_LANG_CODES)[number];
  showCountry?: boolean;
  bgColor?: string;
  fgColor?: string;
  fgHoverColor?: string;
}) =>  {
  // const i18n = getDplusI18n(langCode);

  return (
    <div className="flex gap-2 sm:gap-4 flex-wrap justify-center font-bold text-base sm:text-lg" style={{ color: fgColor }}>
      {showCountry && targetCountryName && (
        <Link href={`/country/${targetCountryCode}`}>
          <div 
            className="px-3 py-1 rounded-full font-medium opacity-70 hover:opacity-100 duration-300 transition-all" 
            style={{ color: bgColor, backgroundColor: fgColor }}
          >
            {targetCountryName}
          </div>
        </Link>
      )}
      {targetCityName && (
        <Link href={`/city/${targetCityCode}`}>
          <div 
            className="px-3 py-1 rounded-full font-medium opacity-70 hover:opacity-100 duration-300 transition-all" 
            style={{ color: bgColor, backgroundColor: fgColor }}
          >
            {targetCityName}
          </div>
        </Link>
      )}
      {categories && categories.length > 0 && (
        categories.map((category) => (
          <Link href={`/category/${category.category_info?.category_code}`} key={category.category_info?.category_code}>
            <div 
              className="px-3 py-1 rounded-full font-medium opacity-70 hover:opacity-100 duration-300 transition-all" 
              style={{ color: bgColor, backgroundColor: fgColor }}
            >
              {category.category_info?.name_i18n}
            </div>
          </Link>
        ))
      )}
    </div>
  );
};

