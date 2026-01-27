import { TCategoryInfoForCountryDetail } from "dplus_common_v1";
import Link from "next/link";

export const CompCountryCategoryItem = ({ category }: { category: TCategoryInfoForCountryDetail }) => {
  return (
    <Link
      key={category.category_code}
      href={`/category/${category.category_code}`}
      className="block"
    >
      <div className="flex flex-col items-center justify-center gap-1 h-full w-full rounded-full border border-white px-6 py-3 bg-gradient-to-b from-white/90 via-white/80 to-transparent transition shadow-[inset_0_1px_0_0_rgba(255,255,255,0.8),0_1px_1px_0px_rgba(0,0,0,0.15)] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_6px_8px_-5px_rgba(0,0,0,0.2)] active:translate-y-0">
        <div className="text-md text-center">
          {category.name_i18n ?? category.name}
        </div>
      </div>
    </Link>
  );
};