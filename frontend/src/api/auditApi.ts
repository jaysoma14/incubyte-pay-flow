import { createAppApi, queryString } from "./api";
import type { AuditLog, PageResult } from "../types";

export const auditApi = createAppApi({
  reducerPath: "auditApi",
  endpoints: (builder) => ({
    getAuditLogs: builder.query<PageResult<AuditLog>, { page: number; limit: number }>({
      query: (pagination) => `/audit-logs?${queryString(pagination)}`,
      providesTags: ["Audit"],
    }),
    getEmployeeAuditLogs: builder.query<PageResult<AuditLog>, { id: string; page: number; limit: number }>({
      query: ({ id, ...pagination }) => `/employees/${encodeURIComponent(id)}/audit-logs?${queryString(pagination)}`,
      providesTags: (_result, _error, { id }) => [{ type: "Audit", id }],
    }),
  }),
  tagTypes: ["Audit"],
});

export const { useGetAuditLogsQuery, useGetEmployeeAuditLogsQuery } = auditApi;
