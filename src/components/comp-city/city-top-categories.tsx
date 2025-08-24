"use client";

import { useEffect, useState } from "react";
import { Link } from "@mui/material";
import { TCategoryOption } from "trand_common_v1";
import { getTopCategoryIcon } from "../category/get-top-category-icon";


/**
 * CityTopCategories
 * @param cityCode - 도시 코드
 * @param langCode - 언어 코드
 * @param categories - 카테고리 목록
 */
export default function CityTopCategories({ cityCode, langCode, categories }: { cityCode: string, langCode: string, categories: TCategoryOption[] }) {
  const [topCategories, setTopCategories] = useState<TCategoryOption[]>([]);

  useEffect(() => {
    setTopCategories(categories.filter(category => {
      return (category.target_country_code === "AA" || category.target_country_code === "KR") && category.upper_category_code === null;
    }));
  }, [categories]);

  return (
    <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4 gap-y-4">
      {topCategories.map((category) => (
        <Link href={`/city/${cityCode}/${langCode}/category/${category.category_code}`} key={category.category_code} underline="none">
          <div
            key={category.category_code}
            className="border border-gray-200 rounded-md text-gray-700 hover:border-gray-300 hover:bg-gray-100 transition-all duration-300 overflow-hidden"
          >
            <div className="py-4 md:min-w-36 flex flex-col items-center gap-4 font-poppins">
              <div className="w-6 h-6">
                {getTopCategoryIcon(category.category_code)}
              </div>
              <span className="text-sm">{category.name}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}