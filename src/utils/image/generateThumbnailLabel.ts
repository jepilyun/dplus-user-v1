// import { LABEL_ACCOMMODATION_I18N, LABEL_ACTIVITY_I18N, LABEL_ASIAN_FOOD_I18N, LABEL_ATTRACTION_I18N, LABEL_BAR_I18N, LABEL_BEAUTY_I18N, LABEL_BRUNCH_I18N, LABEL_BTS_I18N, LABEL_CAFE_I18N, LABEL_CHINESE_FOOD_I18N, LABEL_DESSERT_I18N, LABEL_EVENT_I18N, LABEL_EXHIBITION_I18N, LABEL_EXPERIENCE_I18N, LABEL_FASHION_I18N, LABEL_FESTIVAL_I18N, LABEL_FINE_DINING_I18N, LABEL_FOOD_I18N, LABEL_GALLERY_I18N, LABEL_HOT_I18N, LABEL_ITALIAN_FOOD_I18N, LABEL_JAPANESE_FOOD_I18N, LABEL_KOREAN_FOOD_I18N, LABEL_KPOP_I18N, LABEL_LIST, LABEL_MUSEUM_I18N, LABEL_NIGHTLIFE_I18N, LABEL_PARK_I18N, LABEL_POPULAR_I18N, LABEL_POPUP_STORE_I18N, LABEL_SHOPPING_I18N, LABEL_SHOPPING_MALL_I18N, LABEL_SIGHTSEEING_I18N, LABEL_THEMEPARK_I18N, LABEL_TOUR_I18N } from "dplus_common_v1";

// export const generateThumbnailLabel = (label: typeof LABEL_LIST[number], langCode: string | null) => {
//   switch (label) {
//     case "shopping":
//       return LABEL_SHOPPING_I18N[langCode as keyof typeof LABEL_SHOPPING_I18N] || "Shopping";
//     case "shopping_mall":
//       return LABEL_SHOPPING_MALL_I18N[langCode as keyof typeof LABEL_SHOPPING_MALL_I18N] || "Shopping Mall";
//     case "popup_store":
//       return LABEL_POPUP_STORE_I18N[langCode as keyof typeof LABEL_POPUP_STORE_I18N] || "Popup Store";
//     case "themepark":
//       return LABEL_THEMEPARK_I18N[langCode as keyof typeof LABEL_THEMEPARK_I18N] || "Themepark";
//     case "museum":
//       return LABEL_MUSEUM_I18N[langCode as keyof typeof LABEL_MUSEUM_I18N] || "Museum";
//     case "gallery":
//       return LABEL_GALLERY_I18N[langCode as keyof typeof LABEL_GALLERY_I18N] || "Gallery";
//     case "food":
//       return LABEL_FOOD_I18N[langCode as keyof typeof LABEL_FOOD_I18N] || "Food";
//     case "brunch":
//       return LABEL_BRUNCH_I18N[langCode as keyof typeof LABEL_BRUNCH_I18N] || "Brunch";
//     case "fine_dining":
//       return LABEL_FINE_DINING_I18N[langCode as keyof typeof LABEL_FINE_DINING_I18N] || "Fine Dining";
//     case "korean_food":
//       return LABEL_KOREAN_FOOD_I18N[langCode as keyof typeof LABEL_KOREAN_FOOD_I18N] || "Korean Food";
//     case "italian_food":
//       return LABEL_ITALIAN_FOOD_I18N[langCode as keyof typeof LABEL_ITALIAN_FOOD_I18N] || "Italian Food";
//     case "japanese_food":
//       return LABEL_JAPANESE_FOOD_I18N[langCode as keyof typeof LABEL_JAPANESE_FOOD_I18N] || "Japanese Food";
//     case "chinese_food":
//       return LABEL_CHINESE_FOOD_I18N[langCode as keyof typeof LABEL_CHINESE_FOOD_I18N] || "Chinese Food";
//     case "asian_food":
//       return LABEL_ASIAN_FOOD_I18N[langCode as keyof typeof LABEL_ASIAN_FOOD_I18N] || "Asian Food";
//     case "cafe":
//       return LABEL_CAFE_I18N[langCode as keyof typeof LABEL_CAFE_I18N] || "Cafe";
//     case "dessert":
//       return LABEL_DESSERT_I18N[langCode as keyof typeof LABEL_DESSERT_I18N] || "Dessert";
//     case "bar":
//       return LABEL_BAR_I18N[langCode as keyof typeof LABEL_BAR_I18N] || "Bar";
//     case "nightlife":
//       return LABEL_NIGHTLIFE_I18N[langCode as keyof typeof LABEL_NIGHTLIFE_I18N] || "Nightlife";
//     case "park":
//       return LABEL_PARK_I18N[langCode as keyof typeof LABEL_PARK_I18N] || "Park";
//     case "experience":
//       return LABEL_EXPERIENCE_I18N[langCode as keyof typeof LABEL_EXPERIENCE_I18N] || "Experience";
//     case "event":
//       return LABEL_EVENT_I18N[langCode as keyof typeof LABEL_EVENT_I18N] || "Event";
//     case "festival":
//       return LABEL_FESTIVAL_I18N[langCode as keyof typeof LABEL_FESTIVAL_I18N] || "Festival";
//     case "accommodation":
//       return LABEL_ACCOMMODATION_I18N[langCode as keyof typeof LABEL_ACCOMMODATION_I18N] || "Accommodation";
//     case "attraction":
//       return LABEL_ATTRACTION_I18N[langCode as keyof typeof LABEL_ATTRACTION_I18N] || "Attraction";
//     case "activity":
//       return LABEL_ACTIVITY_I18N[langCode as keyof typeof LABEL_ACTIVITY_I18N] || "Activity";
//     case "tour":
//       return LABEL_TOUR_I18N[langCode as keyof typeof LABEL_TOUR_I18N] || "Tour";
//     case "exhibition":
//       return LABEL_EXHIBITION_I18N[langCode as keyof typeof LABEL_EXHIBITION_I18N] || "Exhibition";
//     case "sightseeing":
//       return LABEL_SIGHTSEEING_I18N[langCode as keyof typeof LABEL_SIGHTSEEING_I18N] || "Sightseeing";
//     case "fashion":
//       return LABEL_FASHION_I18N[langCode as keyof typeof LABEL_FASHION_I18N] || "Fashion";
//     case "beauty":
//       return LABEL_BEAUTY_I18N[langCode as keyof typeof LABEL_BEAUTY_I18N] || "Beauty";
//     case "hot":
//       return LABEL_HOT_I18N[langCode as keyof typeof LABEL_HOT_I18N] || "Hot";
//     case "popular":
//       return LABEL_POPULAR_I18N[langCode as keyof typeof LABEL_POPULAR_I18N] || "Popular";
//     case "kpop":
//       return LABEL_KPOP_I18N[langCode as keyof typeof LABEL_KPOP_I18N] || "Kpop";
//     case "bts":
//       return LABEL_BTS_I18N[langCode as keyof typeof LABEL_BTS_I18N] || "Bts";
//     default:
//       return null;
//   }
// }

// /**
//  * https://mui.com/material-ui/customization/color/
//  */
// /**
//  * 썸네일 위 라벨용 색상 팔레트 - 흰색 글씨 최적화
//  * 모든 색상은 WCAG AA 기준 이상의 대비율을 제공합니다
//  */
// export const LABEL_BG_COLORS = [
//   // Red 계열
//   "#d32f2f", // Material Red 700
//   "#c62828", // Material Red 800
//   "#b71c1c", // Material Red 900
//   "#e53935", // Material Red 600
//   "#ad1457", // Pink 800

//   // Pink 계열
//   "#c2185b", // Pink 700
//   "#880e4f", // Pink 900
//   "#e91e63", // Pink 500
//   "#a0004d", // Deep Pink

//   // Purple 계열
//   "#7b1fa2", // Purple 700
//   "#6a1b9a", // Purple 800
//   "#4a148c", // Purple 900
//   "#8e24aa", // Purple 600
//   "#512da8", // Deep Purple 700
//   "#4527a0", // Deep Purple 800
//   "#311b92", // Deep Purple 900

//   // Indigo & Blue 계열
//   "#303f9f", // Indigo 700
//   "#283593", // Indigo 800
//   "#1a237e", // Indigo 900
//   "#1976d2", // Blue 700
//   "#1565c0", // Blue 800
//   "#0d47a1", // Blue 900
//   "#0277bd", // Light Blue 800
//   "#01579b", // Light Blue 900

//   // Teal & Green 계열
//   "#00695c", // Teal 800
//   "#004d40", // Teal 900
//   "#00796b", // Teal 700
//   "#388e3c", // Green 700
//   "#2e7d32", // Green 800
//   "#1b5e20", // Green 900
//   "#689f38", // Light Green 700
//   "#558b2f", // Light Green 800
//   "#33691e", // Light Green 900

//   // Yellow & Orange 계열 (어두운 톤)
//   "#f57f17", // Yellow 800
//   "#e65100", // Orange 900
//   "#ef6c00", // Orange 800
//   "#f57c00", // Orange 700
//   "#ff8f00", // Amber 800
//   "#ff6f00", // Amber 900

//   // Brown & Grey 계열
//   "#5d4037", // Brown 700
//   "#4e342e", // Brown 800
//   "#3e2723", // Brown 900
//   "#424242", // Grey 800
//   "#212121", // Grey 900
//   "#37474f", // Blue Grey 800
//   "#263238", // Blue Grey 900

//   // 추가 다크 톤
//   "#1a1a2e", // Dark Navy
//   "#16213e", // Midnight Blue
//   "#0f3460", // Deep Blue
//   "#e65100", // Vibrant Orange
//   "#4a4a4a"  // Charcoal
// ];

// // // 유틸 함수: 배열에서 랜덤 색상 선택
// // export const getLabelBGColor = (label: typeof LABEL_LIST[number]) => {
// //   switch (label) {
// //     case "shopping":
// //       return "#e91e63";
// //     case "shopping_mall":
// //       return "#e91e63";
// //     case "popup_store":
// //       return "#e91e63";
// //     case "themepark":
// //       return "#8e24aa"; // Purple 600
// //     case "museum":
// //       return LABEL_BG_COLORS[4];
// //     case "gallery":
// //       return LABEL_BG_COLORS[5];
// //     case "food":
// //       return "#689f38"; // Light Green 700
// //     case "brunch":
// //       return "#689f38"; // Light Green 700
// //     case "fine_dining":
// //       return "#689f38"; // Light Green 700
// //     case "korean_food":
// //       return "#689f38"; // Light Green 700
// //     case "italian_food":
// //       return "#689f38"; // Light Green 700
// //     case "japanese_food":
// //       return "#689f38"; // Light Green 700
// //     case "chinese_food":
// //       return "#689f38"; // Light Green 700
// //     case "asian_food":
// //       return "#689f38"; // Light Green 700
// //     case "cafe":
// //       return "#5d4037"; // Brown 700
// //     case "dessert":
// //       return "#0277bd"; // Light Blue 800
// //     case "bar":
// //       return "#6a1b9a"; // Purple 800
// //     case "nightlife":
// //       return "#16213e"; // Midnight Blue
// //     case "park":
// //       return "#558b2f"; // Light Green 800
// //     case "experience":
// //       return "#e65100"; // Vibrant Orange
// //     case "event":
// //       return "#1a1a2e"; // Dark Navy
// //     case "festival":
// //       return "#6a1b9a"; // Purple 800
// //     case "accommodation":
// //       return "#0f3460"; // Deep Blue
// //     case "attraction":
// //       return LABEL_BG_COLORS[23];
// //     case "activity":
// //       return LABEL_BG_COLORS[24];
// //     case "tour":
// //       return LABEL_BG_COLORS[25];
// //     case "exhibition":
// //       return LABEL_BG_COLORS[26];
// //     case "sightseeing":
// //       return LABEL_BG_COLORS[27];
// //     case "hot":
// //       return "#e53935"; // Material Red 600
// //     case "popular":
// //       return LABEL_BG_COLORS[29];
// //     case "kpop":
// //       return LABEL_BG_COLORS[30];
// //     case "bts":
// //       return LABEL_BG_COLORS[31];
// //     default:
// //       return null;
// //   }
// // };

// // LabelColors 타입이 아래와 같이 정의되어 있다고 가정합니다.
// type LabelColors = {
//   backgroundColor: string;
//   textColor: string;
// };

// // LABEL_LIST에 사용된 모든 키워드가 포함되어 있다고 가정합니다.
// // 예: const LABEL_LIST = ["shopping", "food", "kpop", ...];

// /**
//  * 각 키워드에 맞는 배경색과 글자색 조합을 반환합니다.
//  * @param label - 색상을 조회할 키워드
//  * @returns {LabelColors} - 배경색과 글자색 객체
//  */
// export const getLabelColors = (label: string): LabelColors => {
//   switch (label) {
//     // ## 🛍️ 쇼핑 & 문화 (핑크, 퍼플, 인디고, 틸 계열)
//     case "shopping":
//       return { backgroundColor: "#EC407A", textColor: "#FFFFFF" };
//     case "shopping_mall":
//       return { backgroundColor: "#AB47BC", textColor: "#FFFFFF" };
//     case "popup_store":
//       return { backgroundColor: "#7E57C2", textColor: "#FFFFFF" };
//     case "themepark":
//       return { backgroundColor: "#009688", textColor: "#FFFFFF" };
//     case "museum":
//       return { backgroundColor: "#3F51B5", textColor: "#FFFFFF" };
//     case "gallery":
//       return { backgroundColor: "#42A5F5", textColor: "#FFFFFF" };
//     case "exhibition":
//       return { backgroundColor: "#29B6F6", textColor: "#FFFFFF" };

//     // ## 🍔 음식 & 카페 (오렌지, 앰버, 브라운 계열)
//     case "food":
//       return { backgroundColor: "#FB8C00", textColor: "#FFFFFF" };
//     case "brunch":
//       // 밝은 배경색이므로 글자색은 어둡게 처리하여 가독성 확보
//       return { backgroundColor: "#FFCA28", textColor: "#212121" };
//     case "fine_dining":
//       return { backgroundColor: "#6D4C41", textColor: "#FFFFFF" };
//     case "cafe":
//       return { backgroundColor: "#8D6E63", textColor: "#FFFFFF" };
//     case "dessert":
//       return { backgroundColor: "#29B6F6", textColor: "#FFFFFF" };
//     // 여러 음식 종류를 하나의 스타일로 통일 (switch fall-through)
//     case "korean_food":
//     case "italian_food":
//     case "japanese_food":
//     case "chinese_food":
//     case "asian_food":
//       return { backgroundColor: "#FFE0B2", textColor: "#E65100" };

//     // ## 🌳 자연 & 활동 (그린, 딥 오렌지 계열)
//     case "park":
//       return { backgroundColor: "#43A047", textColor: "#FFFFFF" };
//     case "experience":
//       return { backgroundColor: "#FF7043", textColor: "#FFFFFF" };
//     case "activity":
//       return { backgroundColor: "#FF5722", textColor: "#FFFFFF" };
//     case "tour":
//       return { backgroundColor: "#FFA726", textColor: "#FFFFFF" };

//     // ## 🎉 이벤트 & 나이트라이프 (다크 계열, 포인트 컬러)
//     case "bar":
//       return { backgroundColor: "#546E7A", textColor: "#FFFFFF" };
//     case "nightlife":
//       return { backgroundColor: "#263238", textColor: "#CFD8DC" };
//     case "event":
//       return { backgroundColor: "#673AB7", textColor: "#FFFFFF" };
//     case "festival":
//       return { backgroundColor: "#D81B60", textColor: "#FFFFFF" };

//     // ## 🏨 숙박 & 관광 (블루, 틸/시안 계열)
//     case "accommodation":
//       return { backgroundColor: "#1E88E5", textColor: "#FFFFFF" };
//     case "attraction":
//       return { backgroundColor: "#0097A7", textColor: "#FFFFFF" };
//     case "sightseeing":
//       return { backgroundColor: "#26A69A", textColor: "#FFFFFF" };

//     // ## ✨ 인기 & K-POP (레드, 포인트 컬러)
//     case "hot":
//       return { backgroundColor: "#F44336", textColor: "#FFFFFF" };
//     case "popular":
//       return { backgroundColor: "#E53935", textColor: "#FFFFFF" };
//     case "kpop":
//       return { backgroundColor: "#FF4081", textColor: "#FFFFFF" };
//     case "bts":
//       return { backgroundColor: "#7C4DFF", textColor: "#FFFFFF" };

//     // ## 🎨 기본값
//     default:
//       return { backgroundColor: "#78909C", textColor: "#FFFFFF" };
//   }
// };
