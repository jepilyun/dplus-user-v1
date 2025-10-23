import { Paper, InputBase, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

export default function TopNavSearchBox() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Paper
      component="form"
      sx={{
        p: "2px 1rem",
        display: "flex",
        alignItems: "center",
        width: 400,
        borderRadius: "50px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        // ✅ 반투명 배경 + 블러
        backgroundColor: isFocused
          ? "rgba(255, 255, 255, 0.9)" // 포커스 시 더 밝게
          : "rgba(255, 255, 255, 0.4)", // 평소엔 더 투명
        backdropFilter: "blur(10px)", // ✅ 블러 효과
        WebkitBackdropFilter: "blur(10px)", // Safari 대응
        border: isFocused ? "1px solid #2DB0E0" : "1px solid rgba(255,255,255,0.3)",
        transition: "all 0.3s ease",
      }}
    >
      <InputBase
        sx={{
          ml: 1,
          flex: 1,
          color: isFocused ? "text.primary" : "text.secondary",
          "&::placeholder": {
            color: isFocused ? "text.disabled" : "rgba(255,255,255,0.8)",
            opacity: 1,
          },
        }}
        placeholder="ex. Gyeongbokgung Palace"
        inputProps={{ "aria-label": "search" }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
        <SearchIcon
          sx={{
            color: isFocused ? "#2DB0E0" : "rgba(255,255,255,0.9)",
            transition: "color 0.3s ease",
          }}
        />
      </IconButton>
    </Paper>
  );
}
