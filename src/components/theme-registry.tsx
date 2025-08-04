import theme from "@/theme";
import { ThemeProvider, CssBaseline } from "@mui/material";

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
