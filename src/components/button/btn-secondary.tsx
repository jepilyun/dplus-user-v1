import { Button } from "@mui/material";


export default function BtnSecondary({
  title,
  icon,
}: {
  title: string;
  icon?: React.ReactNode | null;
}) {
  return (
    <Button
      variant="contained"
      disableElevation
      sx={{
        backgroundColor: "#ededed",
        color: "#000",
        borderRadius: "9999px",
        boxShadow: "none",
        px: 4,                // ⬅️ 좌우 패딩 늘림
        py: 2,                // 세로 패딩은 그대로
        "&:hover": { backgroundColor: "#d5d5d5", boxShadow: "none" },
        "& .MuiButton-startIcon svg": { width: 18, height: 18 },
      }}
      startIcon={icon ?? null}
    >
      {title}
    </Button>
  );
}