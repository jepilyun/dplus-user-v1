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
}: {
  targetCountryCode?: string | null;
  targetCountryName?: string | null;
  targetCityCode?: string | null;
  targetCityName?: string | null;
  categories?: TMapCategoryEventWithCategoryInfo[] | TMapCategoryFolderWithCategoryInfo[] | null;
  langCode?: (typeof SUPPORT_LANG_CODES)[number];
}) =>  {
  const i18n = getDplusI18n(langCode);

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {targetCountryName && (
        <Link href={`/country/${targetCountryCode}`}>
          <div className="bg-tag-country">{targetCountryName}</div>
        </Link>
      )}
      {targetCityName && (
        <Link href={`/city/${targetCityCode}`}>
          <div className="bg-tag-city">{targetCityName}</div>
        </Link>
      )}
      {categories && categories.length > 0 && (
        categories.map((category) => (
          <Link href={`/category/${category.category_info?.category_code}`} key={category.category_info?.category_code}>
            <div className="bg-tag-category">{category.category_info?.name_i18n}</div>
          </Link>
        ))
      )}
    </div>
  );
};

