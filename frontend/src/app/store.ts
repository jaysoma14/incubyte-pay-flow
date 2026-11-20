import { configureStore } from "@reduxjs/toolkit";
import { auditApi } from "../api/auditApi";
import { authApi } from "../api/authApi";
import { dashboardApi } from "../api/dashboardApi";
import { departmentApi } from "../api/departmentApi";
import { employeeApi } from "../api/employeeApi";
import { salaryApi } from "../api/salaryApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [departmentApi.reducerPath]: departmentApi.reducer,
    [employeeApi.reducerPath]: employeeApi.reducer,
    [salaryApi.reducerPath]: salaryApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [auditApi.reducerPath]: auditApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
    authApi.middleware,
    departmentApi.middleware,
    employeeApi.middleware,
    salaryApi.middleware,
    dashboardApi.middleware,
    auditApi.middleware,
  ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
