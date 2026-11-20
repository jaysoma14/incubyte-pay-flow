import { useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useGetEmployeeQuery } from "@/api/employeeApi";
import { useGetSalaryHistoryQuery } from "@/api/salaryApi";
import { BaseTable, ErrorState, LoadingState, PageHeader, ServerPagination } from "@/components/common";
import { formatDate, formatMoney } from "@/utils/format";
import type { SalaryRecord } from "@/types";
import type { ColDef } from "ag-grid-community";

function EmployeeSalaryHistoryPage() {
  const { id = "" } = useParams();
  const [page, setPage] = useState(1);
  const employeeQuery = useGetEmployeeQuery(id);
  const historyQuery = useGetSalaryHistoryQuery({ id, page, limit: 25 });

  if (employeeQuery.isLoading || historyQuery.isLoading) return <LoadingState label="Loading salary history…" />;
  if (employeeQuery.isError) return <ErrorState error={employeeQuery.error} onRetry={() => void employeeQuery.refetch()} />;
  if (historyQuery.isError) return <ErrorState error={historyQuery.error} onRetry={() => void historyQuery.refetch()} />;
  const employee = employeeQuery.data?.data;
  const historyColumns: ColDef<SalaryRecord>[] = [
    { field: "effectiveFrom", headerName: "Effective from", valueFormatter: ({ value }) => formatDate(value), minWidth: 140 },
    { field: "effectiveTo", headerName: "Effective to", valueFormatter: ({ value }) => formatDate(value), minWidth: 140 },
    {
      headerName: "Previous salary",
      valueGetter: ({ data }) => {
        const change = data?.auditLogs?.[0];
        return change?.previousAmount ? formatMoney(change.previousAmount, change.previousCurrency) : "—";
      },
    },
    {
      headerName: "New salary",
      valueGetter: ({ data }) => data ? formatMoney(data.amount, data.currency) : "—",
      cellStyle: { fontWeight: 700 },
    },
    { headerName: "Reason", valueGetter: ({ data }) => data?.auditLogs?.[0]?.reason ?? "—", minWidth: 190 },
    { headerName: "Changed by", valueGetter: ({ data }) => data?.auditLogs?.[0]?.changedBy.email ?? "—", minWidth: 190 },
    { headerName: "Changed on", valueGetter: ({ data }) => formatDate(data?.auditLogs?.[0]?.createdAt ?? data?.createdAt), minWidth: 140 },
  ];

  return (
    <Stack spacing={2.5}>
      <Button component={RouterLink} to={`/employees/${encodeURIComponent(id)}`} startIcon={<ArrowBackOutlinedIcon />} sx={{ alignSelf: "flex-start" }}>Back to employee</Button>
      <PageHeader title="Salary history" description={employee ? `${employee.firstName} ${employee.lastName} · ${employee.employeeCode}` : undefined} actions={<Button component={RouterLink} to={`/employees/${encodeURIComponent(id)}/salary-revision`} variant="contained">Revise salary</Button>} />
      <Card className="table-card">
        <BaseTable
          ariaLabel="Employee salary history"
          rows={historyQuery.data?.data ?? []}
          columns={historyColumns}
          emptyMessage="No salary records have been recorded for this employee."
          getRowId={({ data }) => data.id}
        />
        {historyQuery.data && <Box className="table-footer"><Typography variant="body2" color="text.secondary">{historyQuery.data.pagination.total} salary records</Typography><ServerPagination page={page} totalPages={historyQuery.data.pagination.totalPages} onChange={setPage} /></Box>}
      </Card>
    </Stack>
  );
}

export default EmployeeSalaryHistoryPage;