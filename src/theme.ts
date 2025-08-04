// theme.ts 또는 theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  // 1. 색상 팔레트 (Color Palette)
  palette: {
    mode: "light",
    primary: {
      main: "#2DB0E0", // 조금 더 진한 파란색을 메인으로 사용
      light: "#6FD8FE", // 제공해주신 밝은 파란색
      dark: "#248DB2", // 메인 컬러보다 어두운 색
      contrastText: "#FFFFFF", // << 요청하신 대로 버튼 위 글자를 흰색으로 변경
    },
    secondary: {
      main: "#FFD600", // 강조 컬러 1: 햇살 같은 노란색
      contrastText: "#333333",
    },
    warning: {
      main: "#FF7043", // 강조 컬러 2: 활기찬 코랄색
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8F9FA", // 아주 연한 회색으로 편안한 배경
      paper: "#FFFFFF",
    },
    text: {
      primary: "#212529", // 기본 텍스트 (더 진한 검정)
      secondary: "#6C757D", // 보조 텍스트 (회색)
    },
  },

  // 2. 타이포그래피 (폰트 시스템)
  typography: {
    // 1. 기본 본문 폰트를 CSS 변수로 지정
    fontFamily: "var(--font-noto-sans-kr)",

    // 2. 로고 및 헤드라인 폰트를 CSS 변수로 지정
    h1: {
      fontFamily: "var(--font-cherry-swash), cursive",
      fontWeight: 700,
      fontSize: "3rem",
    },
    h2: {
      fontFamily: "var(--font-cherry-swash), cursive",
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    // ... (h3, body1 등 나머지 설정은 이전과 동일)
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },

  // 3. 주요 컴포넌트 스타일 재정의
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "20px", // 더 둥글고 부드러운 버튼
          padding: "8px 20px",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 8px 16px rgba(0,0,0,0.05)", // 좀 더 입체적인 그림자
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.8)", // 반투명한 흰색 배경
          backdropFilter: "blur(8px)", // 블러 효과 (모던한 느낌)
          boxShadow: "inset 0px -1px 1px #F0F0F0", // 얇은 하단 경계선
          color: "#212529",
        },
      },
    },
  },
});

export default theme;
