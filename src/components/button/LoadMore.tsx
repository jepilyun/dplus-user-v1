"use client";

import { getDplusI18n } from "@/utils/getDplusI18n";
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
          borderRadius: "9999px",
          textTransform: "none",
          fontWeight: 600,
          fontSize: "1rem",
          border: "1px solid white",
          background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8), transparent)",
          color: "#444",
          boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.8), 0 1px 1px 0px rgba(0, 0, 0, 0.15)",
          transition: "all 0.15s ease-in-out",

          "&:hover": {
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8), transparent)",
            color: "#333",
            boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.9), 0 6px 8px -5px rgba(0, 0, 0, 0.2)",
          },
          "&:active": {
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8), transparent)",
            transform: "translateY(0)",
          },
          "&.Mui-disabled": {
            background: "linear-gradient(to bottom, rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.6), transparent)",
            color: "#888",
            border: "1px solid rgba(255, 255, 255, 0.5)",
          },
        }}
      >
        {loading ? "Loading..." : getDplusI18n(locale).load_more}
      </Button>
    </div>
  );
};