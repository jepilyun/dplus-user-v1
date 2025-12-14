"use client";

import { getDplusI18n } from "@/utils/get-dplus-i18n";
import { Button, CircularProgress } from "@mui/material";

interface CompLoadMoreProps {
  onLoadMore: () => void;
  loading: boolean;
  locale: string;
}

export const CompLoadMore = ({ onLoadMore, loading, locale }: CompLoadMoreProps) => {
  return (
    <div className="flex justify-center py-8">
      <Button
        variant="contained"
        disableElevation
        onClick={onLoadMore}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={16} /> : null}
        sx={{
          minWidth: 200,
          height: 48,
          borderRadius: "9999px", // rounded-full
          textTransform: "none",
          fontWeight: 600,
          fontSize: "1rem", // View All과 동일 폰트
          backgroundColor: "#ffffff",
          color: "#444",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",

          "&:hover": {
            backgroundColor: "#fff",
            color: "#333",
            boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.8), 0 3px 6px -1px rgba(0, 0, 0, 0.15)",
          },
          "&:active": {
            backgroundColor: "#efefef",
          },
          "&.Mui-disabled": {
            backgroundColor: "#efefef",
            color: "#888",
          },
        }}
      >
        {loading ? "Loading..." : getDplusI18n(locale).load_more}
      </Button>
    </div>
  );
};
