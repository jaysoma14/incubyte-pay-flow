import { createContext, useContext } from "react";

export type Notice = { message: string; severity: "success" | "error" | "info" };
export const NotificationContext = createContext<(notice: Notice) => void>(() => undefined);
export const useNotify = () => useContext(NotificationContext);
