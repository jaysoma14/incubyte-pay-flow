import { createAppApi, queryString } from "./api";
import type { Employee, EmployeeFilters, PageResult } from "../types";
import { dashboardApi } from "./dashboardApi";

export const employeeApi = createAppApi({
  reducerPath: "employeeApi",
  endpoints: (builder) => ({
    getEmployees: builder.query<PageResult<Employee>, EmployeeFilters>({
      query: (filters) => `/employees?${queryString(filters)}`,
      providesTags: (result) => [
        "Employee",
        ...(result?.data.map(({ id }) => ({ type: "Employee" as const, id })) ?? []),
      ],
    }),
    getEmployee: builder.query<{ data: Employee }, string>({
      query: (id) => `/employees/${encodeURIComponent(id)}`,
      providesTags: (_result, _error, id) => [{ type: "Employee", id }],
    }),
    saveEmployee: builder.mutation<{ data: Employee }, { id?: string; body: Partial<Employee> }>({
      query: ({ id, body }) => ({
        url: id ? `/employees/${encodeURIComponent(id)}` : "/employees",
        method: id ? "PUT" : "POST",
        body,
      }),
      invalidatesTags: ["Employee"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(dashboardApi.util.invalidateTags(["Dashboard"]));
        } catch {
          // Failed mutations do not invalidate dashboard data.
        }
      },
    }),
  }),
  tagTypes: ["Employee"],
});

export const { useGetEmployeesQuery, useGetEmployeeQuery, useSaveEmployeeMutation } = employeeApi;
