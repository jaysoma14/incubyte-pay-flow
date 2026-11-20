import { createAppApi, queryString } from "./api";
import type {
  AuditLog,
  PageResult,
  SalaryFilters,
  SalaryOverviewRow,
  SalaryRecord,
  SalaryRevisionInput,
} from "../types";
import { auditApi } from "./auditApi";
import { dashboardApi } from "./dashboardApi";

export const salaryApi = createAppApi({
  reducerPath: "salaryApi",
  endpoints: (builder) => ({
    getSalaryOverview: builder.query<PageResult<SalaryOverviewRow>, SalaryFilters>({
      query: (filters) => `/salaries?${queryString(filters)}`,
      providesTags: ["Salary"],
    }),
    getSalaryHistory: builder.query<PageResult<SalaryRecord>, { id: string; page: number; limit: number }>({
      query: ({ id, ...pagination }) => `/employees/${encodeURIComponent(id)}/salaries?${queryString(pagination)}`,
      providesTags: (_result, _error, { id }) => [{ type: "Salary", id }],
    }),
    reviseSalary: builder.mutation<{ data: { salary: SalaryRecord; auditLog: AuditLog } }, { id: string; body: SalaryRevisionInput }>({
      query: ({ id, body }) => ({
        url: `/employees/${encodeURIComponent(id)}/salaries`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "Salary", id }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(dashboardApi.util.invalidateTags(["Dashboard"]));
          dispatch(auditApi.util.invalidateTags(["Audit"]));
        } catch {
          // Failed mutations do not invalidate dashboard or audit data.
        }
      },
    }),
  }),
  tagTypes: ["Salary"],
});

export const { useGetSalaryOverviewQuery, useGetSalaryHistoryQuery, useReviseSalaryMutation } = salaryApi;
