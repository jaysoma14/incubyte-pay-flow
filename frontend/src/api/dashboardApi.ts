import { createAppApi } from "./api";
import type { DashboardSummary } from "../types";

export const dashboardApi = createAppApi({
  reducerPath: "dashboardApi",
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<{ data: DashboardSummary }, void>({
      query: () => "/dashboard/summary",
      providesTags: ["Dashboard"],
    }),
    getDepartmentDistribution: builder.query<{ data: Array<{ department: string; employeeCount: number }> }, void>({
      query: () => "/dashboard/department-distribution",
      providesTags: ["Dashboard"],
    }),
    getCountryDistribution: builder.query<{ data: Array<{ country: string; employeeCount: number }> }, void>({
      query: () => "/dashboard/country-distribution",
      providesTags: ["Dashboard"],
    }),
    getSalaryDistribution: builder.query<{ data: Array<{ department: string; designation: string; currency: string; employeeCount: number; totalPayroll: string; averageSalary: string }> }, void>({
      query: () => "/dashboard/salary-distribution",
      providesTags: ["Dashboard"],
    }),
  }),
  tagTypes: ["Dashboard"],
});

export const {
  useGetDashboardSummaryQuery,
  useGetDepartmentDistributionQuery,
  useGetCountryDistributionQuery,
  useGetSalaryDistributionQuery,
} = dashboardApi;
