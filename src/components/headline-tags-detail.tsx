import { getDplusI18n } from "@/utils/get-dplus-i18n";
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
  fgColor?: string;
  fgHoverColor?: string;
}) =>  {
  const i18n = getDplusI18n(langCode);
  console.log("i18n", i18n);

  return (
    <div className="flex gap-2 sm:gap-4 flex-wrap justify-center font-bold text-lg sm:text-xl" style={{ color: fgColor }}>
      {showCountry && targetCountryName && (
        <Link href={`/country/${targetCountryCode}`}>
          <div className="font-medium opacity-70 hover:opacity-100 duration-300 transition-all" style={{ color: fgHoverColor }}>#{targetCountryName}</div>
        </Link>
      )}
      {targetCityName && (
        <Link href={`/city/${targetCityCode}`}>
          <div className="font-medium opacity-70 hover:opacity-100 duration-300 transition-all" style={{ color: fgHoverColor }}>#{targetCityName}</div>
        </Link>
      )}
      {categories && categories.length > 0 && (
        categories.map((category) => (
          <Link href={`/category/${category.category_info?.category_code}`} key={category.category_info?.category_code}>
            <div className="font-medium opacity-70 hover:opacity-100 duration-300 transition-all" style={{ color: fgHoverColor }}>#{category.category_info?.name_i18n}</div>
          </Link>
        ))
      )}
    </div>
  );
};

