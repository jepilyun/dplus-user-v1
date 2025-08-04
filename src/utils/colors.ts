/**
 * https://mui.com/material-ui/customization/color/
 */

/**
 * 이미지 플레이스홀더용 배경 색상 팔레트
 * 다양하고 생동감 있는 색상들로 구성
 */
export const MUI_COLORS = [
  // Vibrant Red 계열
  "#ff1744", // Red A400
  "#f50057", // Pink A400
  "#e91e63", // Pink 500
  "#ff5722", // Deep Orange 500
  "#ff3d00", // Deep Orange A400
  
  // Purple & Violet 계열
  "#d500f9", // Purple A400
  "#9c27b0", // Purple 500
  "#673ab7", // Deep Purple 500
  "#651fff", // Deep Purple A400
  "#7c4dff", // Deep Purple A200
  
  // Blue 계열
  "#3d5afe", // Indigo A400
  "#2979ff", // Blue A400
  "#1976d2", // Blue 700
  "#00b0ff", // Light Blue A400
  "#03a9f4", // Light Blue 500
  "#00bcd4", // Cyan 500
  "#00e5ff", // Cyan A400
  
  // Green & Teal 계열
  "#1de9b6", // Teal A400
  "#00e676", // Green A400
  "#4caf50", // Green 500
  "#8bc34a", // Light Green 500
  "#cddc39", // Lime 500
  "#76ff03", // Light Green A400
  "#c6ff00", // Lime A400
  
  // Yellow & Orange 계열
  "#ffea00", // Yellow A400
  "#ffc400", // Amber A400
  "#ff9100", // Orange A400
  "#ffab00", // Amber A700
  "#ff8f00", // Amber 800
  
  // 추가 생동감 있는 색상들
  "#e91e63", // Pink 500 (재활용)
  "#9c27b0", // Purple 500 (재활용)
  "#673ab7", // Deep Purple 500 (재활용)
  "#3f51b5", // Indigo 500
  "#2196f3", // Blue 500
  "#009688", // Teal 500
  "#795548", // Brown 500
  
  // 파스텔 & 소프트 톤
  "#ff80ab", // Pink A100
  "#e1bee7", // Purple 200
  "#9fa8da", // Indigo 200
  "#90caf9", // Blue 200
  "#81c784", // Green 300
  "#aed581", // Light Green 300
  "#fff176", // Yellow 300
  "#ffb74d", // Orange 300
  
  // 유니크 컬러
  "#ff6ec7", // Hot Pink
  "#7c4dff", // Electric Purple
  "#40c4ff", // Sky Blue
  "#18ffff", // Aqua
  "#69f0ae", // Spring Green
  "#eeff41", // Electric Lime
  "#ffd740", // Golden Yellow
  "#ff9800"  // Orange 500
];


// 유틸 함수: 배열에서 랜덤 색상 선택
export const getRandomColor = (colorList: string[] = MUI_COLORS) => {
  return colorList[Math.floor(Math.random() * colorList.length)];
};


// 유틸 함수: 배열에서 랜덤 색상 선택
export const getTopCategoryBGColor = (categoryCode: string) => {
  switch (categoryCode) {
    case "food_restaurants":
      return "#d32f2f"; // 따뜻한 빨간색 - 음식의 열정과 맛
    case "cafe_dessert":
      return "#8d6e63"; // 따뜻한 브라운 - 커피와 디저트의 아늑함
    case "tour":
      return "#1976d2"; // 신뢰할 수 있는 파란색 - 여행과 모험
    case "sightseeing":
      return "#388e3c"; // 자연의 초록색 - 풍경과 자연 관광
    case "history":
      return "#5d4037"; // 고풍스러운 다크 브라운 - 역사와 전통
    case "culture":
      return "#7b1fa2"; // 고귀한 보라색 - 문화와 예술
    case "activities":
      return "#f57c00"; // 활동적인 오렌지 - 에너지와 활력
    case "shopping":
      return "#c2185b"; // 세련된 핑크 - 쇼핑과 패션
    case "beauty_relax":
      return "#00695c"; // 평온한 틸 - 휴식과 힐링
    case "nightlife":
      return "#283593"; // 깊은 인디고 - 밤과 엔터테인먼트
    case "accommodation":
      return "#455a64"; // 안정감 있는 블루그레이 - 숙박과 안락함
    case "transportation":
      return "#424242"; // 실용적인 그레이 - 교통과 이동
    case "etc":
      return "#37474f"; // 중성적인 다크 그레이 - 기타 카테고리
    default:
      return "#37474f"; // 기본값
  }
};