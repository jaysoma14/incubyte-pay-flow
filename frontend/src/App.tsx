import { Suspense, useState } from "react";
import { CircularProgress } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { store } from "@/app/store";
import { NotificationsProvider } from "@/components/feedback/Notifications";
import { createAppRouter } from "@/router";
import theme from "./theme";
import "./App.css";

export default function App() {
  const [router] = useState(createAppRouter);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <NotificationsProvider>
          <Suspense
            fallback={
              <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
                <CircularProgress />
              </div>
            }
          >
            <RouterProvider router={router} />
          </Suspense>
        </NotificationsProvider>
      </ThemeProvider>
    </Provider>
  );
}
