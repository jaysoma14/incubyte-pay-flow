import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#425be8", dark: "#3549c4", light: "#eef0ff" },
    secondary: { main: "#16a98a" },
    background: { default: "#f6f7fb", paper: "#ffffff" },
    text: { primary: "#20253b", secondary: "#72798d" },
    success: { main: "#18886d" },
    error: { main: "#d94b58" },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Arial, sans-serif',
    h4: { fontSize: "1.75rem", letterSpacing: "-0.04em" },
    h6: { fontSize: "1.05rem", letterSpacing: "-0.02em" },
    button: { textTransform: "none", fontWeight: 650 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #e8eaf1",
          boxShadow: "0 2px 10px rgba(27, 38, 74, 0.035)",
        },
      },
    },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 9, paddingInline: 16 } },
    },
    MuiOutlinedInput: { styleOverrides: { root: { borderRadius: 9 } } },
  },
});

export default theme;