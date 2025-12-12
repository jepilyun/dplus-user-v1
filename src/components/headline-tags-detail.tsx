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
}: {
  targetCountryCode?: string | null;
  targetCountryName?: string | null;
  targetCityCode?: string | null;
  targetCityName?: string | null;
  categories?: TMapCategoryEventWithCategoryInfo[] | TMapCategoryFolderWithCategoryInfo[] | null;
  langCode?: (typeof SUPPORT_LANG_CODES)[number];
  showCountry?: boolean;
}) =>  {
  const i18n = getDplusI18n(langCode);

  return (
    <div className="mb-6 flex gap-2 sm:gap-4 flex-wrap justify-center font-bold text-md sm:text-xl">
      {showCountry && targetCountryName && (
        <Link href={`/country/${targetCountryCode}`}>
          <div className="text-gray-700 font-medium hover:text-[var(--dplus-red)]">#{targetCountryName}</div>
        </Link>
      )}
      {targetCityName && (
        <Link href={`/city/${targetCityCode}`}>
          <div className="text-gray-700 font-medium hover:text-[var(--dplus-red)]">#{targetCityName}</div>
        </Link>
      )}
      {categories && categories.length > 0 && (
        categories.map((category) => (
          <Link href={`/category/${category.category_info?.category_code}`} key={category.category_info?.category_code}>
            <div className="text-gray-700 font-medium hover:text-[var(--dplus-red)]">#{category.category_info?.name_i18n}</div>
          </Link>
        ))
      )}
    </div>
  );
};

