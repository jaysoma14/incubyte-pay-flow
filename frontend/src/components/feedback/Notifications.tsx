import { Alert, Snackbar } from "@mui/material";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import { NotificationContext, type Notice } from "./notificationsContext";

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notice, setNotice] = useState<Notice | null>(null);
  const notify = useCallback((next: Notice) => setNotice(next), []);
  const value = useMemo(() => notify, [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        open={notice !== null}
        autoHideDuration={5000}
        onClose={() => setNotice(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {notice ? (
          <Alert onClose={() => setNotice(null)} severity={notice.severity} variant="filled">
            {notice.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotificationContext.Provider>
  );
}
