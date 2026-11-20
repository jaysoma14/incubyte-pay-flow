/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useParams,
} from "react-router-dom";
import LoginPage from "@/features/auth/LoginPage";
import ProtectedLayout from "@/router/ProtectedLayout";

const DashboardPage = lazy(() => import("@/features/dashboard/DashboardPage"));
const EmployeesPage = lazy(() => import("@/features/employees/EmployeesPage"));
const EmployeeFormPage = lazy(
  () => import("@/features/employees/EmployeeFormPage"),
);
const EmployeeDetailPage = lazy(
  () => import("@/features/employees/EmployeeDetailPage"),
);
const EmployeeSalaryHistoryPage = lazy(
  () => import("@/features/employees/EmployeeSalaryHistoryPage"),
);
const AuditLogsPage = lazy(() => import("@/features/reports/AuditLogsPage"));
const ReportsPage = lazy(() => import("@/features/reports/ReportsPage"));
const SalaryOverviewPage = lazy(
  () => import("@/features/salaries/SalaryOverviewPage"),
);
const SalaryRevisionPage = lazy(
  () => import("@/features/salaries/SalaryRevisionPage"),
);

function EmployeeAuditRoute() {
  const { id = "" } = useParams();
  return <AuditLogsPage employeeId={id} />;
}

export function createAppRouter() {
  return createBrowserRouter([
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      element: <ProtectedLayout />,
      children: [
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: "dashboard", element: <DashboardPage /> },
        {
          path: "employees",
          element: <Outlet />,
          children: [
            { index: true, element: <EmployeesPage /> },
            { path: "new", element: <EmployeeFormPage /> },
            { path: ":id", element: <EmployeeDetailPage /> },
            { path: ":id/edit", element: <EmployeeFormPage /> },
            {
              path: ":id/salary-history",
              element: <EmployeeSalaryHistoryPage />,
            },
            { path: ":id/salary-revision", element: <SalaryRevisionPage /> },
            { path: ":id/audit-logs", element: <EmployeeAuditRoute /> },
          ],
        },
        { path: "salaries", element: <SalaryOverviewPage /> },
        { path: "reports", element: <ReportsPage /> },
        { path: "audit-logs", element: <AuditLogsPage /> },
      ],
    },
    { path: "*", element: <Navigate to="/dashboard" replace /> },
  ]);
}
