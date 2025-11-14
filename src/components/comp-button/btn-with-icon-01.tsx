import { Button } from "@mui/material";

export default function BtnWithIcon01({
  title,
  icon,
  onClick,
  minWidth = null,
  minHeight = null,
  maxWidth = null,
  width = 24,
  height = 24,
}: {
  title: string;
  icon?: React.ReactNode | null;
  onClick?: () => void;
  minWidth?: number | null;
  minHeight?: number | null;
  maxWidth?: number | null;
  width?: number;
  height?: number;
}) {
  return (
    <Button
      variant="contained"
      disableElevation
      sx={{
        backgroundColor: "#f5f5f5",
        color: "#444",
        borderRadius: "9999px",
        boxShadow: "none",
        minWidth: minWidth ?? null,
        minHeight: minHeight ?? null,
        maxWidth: maxWidth ?? null,
        px: 4,                // ⬅️ 좌우 패딩 늘림
        py: 2,                // 세로 패딩은 그대로
        "&:hover": { backgroundColor: "#efefef", boxShadow: "none" },
        "& .MuiButton-startIcon svg": { width: width, height: height },
        
        // 768px 이하에서 텍스트 숨기고 패딩 조정
        // "@media (max-width: 768px)": {
        //   minWidth: "64px",
        //   minHeight: "64px",
        //   px: 2, // 패딩 줄임
        //   "& .button-text": {
        //     display: "none", // 텍스트 숨김
        //   },
        //   "& .MuiButton-startIcon": {
        //     marginRight: 0, // 아이콘 오른쪽 마진 제거
        //     marginLeft: 0, // 아이콘 왼쪽 마진 제거
        //   },
        // },
      }}
      startIcon={icon ?? null}
      onClick={onClick}
    >
      <span className="button-text">{title}</span>
    </Button>
  );
}