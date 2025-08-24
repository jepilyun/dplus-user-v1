import { Paper, InputBase, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";

export default function TopNavSearchBox() {
  // 3. 포커스 상태를 관리할 state 변수를 생성합니다. (초기값: false)
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
        boxShadow: "none",
        // 4. isFocused 상태에 따라 동적으로 스타일을 변경합니다.
        backgroundColor: isFocused ? "#fff" : "rgba(255, 255, 255, 0.2)", // 포커스 시 흰색, 평소엔 반투명
        border: isFocused ? "1px solid #2DB0E0" : "1px solid #e0e0e0",
        // 5. 부드러운 전환 효과를 추가합니다.
        transition: "background-color 0.3s ease, border-color 0.3s ease",
      }}
    >
      <InputBase
        sx={{
          ml: 1,
          flex: 1,
          // 포커스 상태에 따라 텍스트 색상 변경
          color: isFocused ? "text.primary" : "text.secondary",
          // Placeholder 색상도 동적으로 변경
          "& ::placeholder": {
            color: "text.secondary",
            opacity: 1,
          },
        }}
        placeholder="ex. Gyeongbokgung Palace"
        inputProps={{ "aria-label": "search" }}
        // 6. 포커스되면 isFocused를 true로, 포커스를 잃으면 false로 설정
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      <IconButton type="button" sx={{ p: "10px" }} aria-label="search">
        {/* 포커스 상태에 따라 아이콘 색상 변경 */}
        <SearchIcon sx={{ color: isFocused ? "#2DB0E0" : "action.disabled" }} />
      </IconButton>
    </Paper>
  );
}
