import { IconCategoryAccommodation } from "@/icons/icon-category-accommodation";
import { IconCategoryActivities } from "@/icons/icon-category-activities";
import { IconCategoryBeautyRelax } from "@/icons/icon-category-beauty-relax";
import { IconCategoryCafeDessert } from "@/icons/icon-category-cafe-dessert";
import { IconCategoryCulture } from "@/icons/icon-category-culture";
import { IconCategoryEtc } from "@/icons/icon-category-etc";
import { IconCategoryFoodRestaurants } from "@/icons/icon-category-food-restaurants";
import { IconCategoryHistory } from "@/icons/icon-category-history";
import { IconCategoryNightlife } from "@/icons/icon-category-nightlife";
import { IconCategoryShopping } from "@/icons/icon-category-shopping";
import { IconCategorySightseeing } from "@/icons/icon-category-sightseeing";
import { IconCategoryTour } from "@/icons/icon-category-tour";
import { IconCategoryTransportation } from "@/icons/icon-category-transportation";


export const getTopCategoryIcon = (categoryCode: string) => {
  switch (categoryCode) {
    case "food_restaurants":
      return <IconCategoryFoodRestaurants />;
    case "cafe_dessert": 
      return <IconCategoryCafeDessert />;
    case "tour":
      return <IconCategoryTour />;
    case "sightseeing":
      return <IconCategorySightseeing />;
    case "history":
      return <IconCategoryHistory />;
    case "culture":
      return <IconCategoryCulture />;
    case "activities":
      return <IconCategoryActivities />;
    case "shopping":
      return <IconCategoryShopping />;
    case "beauty_relax":
      return <IconCategoryBeautyRelax />;
    case "nightlife":
      return <IconCategoryNightlife />;
    case "accommodation":
      return <IconCategoryAccommodation />;
    case "transportation":
      return <IconCategoryTransportation />;
    case "etc":
      return <IconCategoryEtc />;
    default:
      return <IconCategoryEtc />;
  }
}