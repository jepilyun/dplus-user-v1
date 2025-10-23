import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  // 1. 색상 팔레트 (Color Palette)
  palette: {
    mode: "light",
    primary: {
      main: "#F13094", // 요청하신 메인 컬러
      light: "#FF6DBA", // 밝은 버전
      dark: "#C1006C", // 어두운 버전
      contrastText: "#FFFFFF", // 버튼 등에서 글자 흰색
    },
    secondary: {
      main: "#FFD600", // 햇살 같은 노란색
      contrastText: "#333333",
    },
    warning: {
      main: "#FF7043", // 활기찬 코랄색
      contrastText: "#FFFFFF",
    },
    background: {
      default: "#F8F9FA", // 연한 회색 배경
      paper: "#FFFFFF",
    },
    text: {
      primary: "#212529", // 진한 검정 텍스트
      secondary: "#6C757D", // 회색 보조 텍스트
    },
  },

  // 2. 타이포그래피 (폰트 시스템)
  typography: {
    fontFamily: "var(--font-noto-sans-kr)",

    h1: {
      fontFamily: "var(--font-poppins), cursive",
      fontWeight: 700,
      fontSize: "3rem",
    },
    h2: {
      fontFamily: "var(--font-poppins), cursive",
      fontWeight: 700,
      fontSize: "2.5rem",
    },
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
          borderRadius: "20px",
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
          boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(8px)",
          boxShadow: "inset 0px -1px 1px #F0F0F0",
          color: "#212529",
        },
      },
    },
  },
});

export default theme;
