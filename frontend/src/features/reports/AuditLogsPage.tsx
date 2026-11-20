import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import type { ColDef } from "ag-grid-community";
import {
  useGetAuditLogsQuery,
  useGetEmployeeAuditLogsQuery,
} from "@/api/auditApi";
import {
  BaseTable,
  ErrorState,
  LoadingState,
  PageHeader,
  ServerPagination,
} from "@/components/common";
import { formatDate, formatMoney } from "@/utils/format";
import type { AuditLog } from "@/types";

function AuditLogsPage({ employeeId }: { employeeId?: string }) {
  const [page, setPage] = useState(1);
  const pageSize = 25;
  const globalQuery = useGetAuditLogsQuery(
    { page, limit: pageSize },
    { skip: Boolean(employeeId) },
  );
  const employeeQuery = useGetEmployeeAuditLogsQuery(
    { id: employeeId ?? "", page, limit: pageSize },
    { skip: !employeeId },
  );
  const query = employeeId ? employeeQuery : globalQuery;
  const auditColumns: ColDef<AuditLog>[] = [
    {
      field: "createdAt",
      headerName: "Changed",
      valueFormatter: ({ value }) => formatDate(value),
      minWidth: 140,
    },
    {
      headerName: "Employee",
      minWidth: 180,
      valueGetter: ({ data }) =>
        data ? `${data.employee.firstName} ${data.employee.lastName}` : "",
      cellRenderer: ({ data }: { data?: AuditLog }) =>
        data ? (
          <div className="grid-person">
            <a
              className="grid-link"
              href={`/employees/${encodeURIComponent(data.employee.id)}`}
            >
              {data.employee.firstName} {data.employee.lastName}
            </a>
            <small>{data.employee.employeeCode}</small>
          </div>
        ) : null,
    },
    {
      headerName: "Previous salary",
      valueGetter: ({ data }) =>
        data?.previousAmount
          ? formatMoney(data.previousAmount, data.previousCurrency)
          : "Initial salary",
      minWidth: 150,
    },
    {
      headerName: "New salary",
      valueGetter: ({ data }) =>
        data ? formatMoney(data.newAmount, data.newCurrency) : "",
      cellStyle: { fontWeight: 700 },
      minWidth: 145,
    },
    {
      field: "effectiveFrom",
      headerName: "Effective date",
      valueFormatter: ({ value }) => formatDate(value),
      minWidth: 140,
    },
    {
      field: "reason",
      headerName: "Reason",
      minWidth: 190,
      wrapText: true,
      autoHeight: true,
    },
    { field: "changedBy.email", headerName: "Changed by", minWidth: 190 },
  ];

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title={employeeId ? "Employee audit history" : "Audit logs"}
        description={
          employeeId
            ? "Salary changes recorded for this employee."
            : "A chronological record of salary changes across your workforce."
        }
        actions={
          employeeId ? (
            <Button
              component={RouterLink}
              to={`/employees/${encodeURIComponent(employeeId)}`}
              variant="outlined"
            >
              Back to employee
            </Button>
          ) : undefined
        }
      />
      {query.isLoading ? (
        <LoadingState label="Loading audit logs…" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => void query.refetch()} />
      ) : (
        <Card className="table-card">
          <BaseTable
            ariaLabel="Salary audit logs"
            rows={query.data?.data ?? []}
            columns={auditColumns}
            emptyMessage="No salary audit entries have been recorded."
            getRowId={({ data }) => data.id}
          />
          {query.data && (
            <Box className="table-footer">
              <Typography variant="body2" color="text.secondary">
                {query.data.pagination.total.toLocaleString()} changes recorded
              </Typography>
              <ServerPagination
                page={page}
                totalPages={query.data.pagination.totalPages}
                onChange={setPage}
              />
            </Box>
          )}
        </Card>
      )}
    </Stack>
  );
}

export default AuditLogsPage;