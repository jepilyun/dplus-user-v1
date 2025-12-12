import { Button } from "@mui/material";

export default function BtnWithIcon01({
  title,
  icon,
  onClick,
  loading = false,
  minWidth = null,
  minHeight = null,
  maxWidth = null,
  width = 24,
  height = 24,
  borderColor = "#333333",
  textColor = "#333333",
}: {
  title: string;
  icon?: React.ReactNode | null;
  onClick?: () => void;
  loading?: boolean;
  minWidth?: number | null;
  minHeight?: number | null;
  maxWidth?: number | null;
  width?: number;
  height?: number;
  borderColor?: string;
  textColor?: string;
}) {
  const borderColorValue = borderColor ? `1px solid ${borderColor}` : "1px solid #333333";
  const textColorValue = textColor ? textColor : "#333333";

  return (
    <Button
      variant="contained"
      disableElevation
      disabled={loading}
      sx={{
        position: "relative",
        backgroundColor: "#ffffff",
        color: textColorValue,
        border: borderColorValue,
        borderRadius: "9999px",
        // boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)",
        minWidth: minWidth ?? null,
        minHeight: minHeight ?? null,
        maxWidth: maxWidth ?? null,
        px: 4,
        py: 2,
        transition: "all 0.2s ease-in-out", // ✅ 부드러운 전환 효과
        "&:hover": { 
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)", // ✅ 더 길고 연한 그림자
        },
        "& .MuiButton-startIcon svg": { width: width, height: height },
        
        "&.Mui-disabled": {
          backgroundColor: "#ff007e",
          color: "#999",
        },
      }}
      startIcon={loading ? null : icon ?? null}
      onClick={onClick}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <span className="button-text font-bold">{title}</span>
      )}
    </Button>
  );
}