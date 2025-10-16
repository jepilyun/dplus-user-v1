import { Button, CircularProgress } from "@mui/material";

interface CompLoadMoreProps {
  onLoadMore: () => void;
  loading: boolean;
}

export const CompLoadMore = ({ onLoadMore, loading }: CompLoadMoreProps) => {
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
          borderRadius: "24px",
          textTransform: "none",
          fontWeight: "bold",
          border: 0,
          boxShadow: "none",
          color: "#FFF", // 글자색
          backgroundColor: "#333", // 기본 배경 (연한 회색)
          "&:hover": {
            backgroundColor: "#444", // hover 시 조금 더 진하게
            boxShadow: "none",
          },
          "&:active": {
            backgroundColor: "#555", // 클릭 순간 더 진하게
          },
          "&.Mui-disabled": {
            backgroundColor: "#CCC",
            color: "#A0A0A0",
          },
        }}
      >
        {loading ? "Loading..." : "Load More"}
      </Button>
    </div>
  );
};
