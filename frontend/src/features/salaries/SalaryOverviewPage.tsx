import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Card, CardContent, Grid, MenuItem, Stack, TextField, Typography } from "@mui/material";
import type { ColDef, SortModelItem } from "ag-grid-community";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import { useGetDepartmentsQuery } from "@/api/departmentApi";
import { useGetSalaryOverviewQuery } from "@/api/salaryApi";
import { BaseTable, CountrySelect, ErrorState, LoadingState, PageHeader, ServerPagination } from "@/components/common";
import { formatDate, formatMoney } from "@/utils/format";
import type { SalaryFilters } from "@/types";

const today = () => new Date().toISOString().slice(0, 10);
const emptyFilters: SalaryFilters = {
  page: 1, limit: 25, sortBy: "employeeName", sortOrder: "asc", asOf: today(),
};

function SalaryOverviewPage() {
  const [filters, setFilters] = useState<SalaryFilters>(emptyFilters);
  const [searchText, setSearchText] = useState("");
  const departments = useGetDepartmentsQuery();

  useEffect(() => {
    const timer = window.setTimeout(() => setFilters((current) => ({ ...current, page: 1, search: searchText.trim() || undefined })), 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  const overview = useGetSalaryOverviewQuery(filters);

  const update = (key: keyof SalaryFilters, value: string) => {
    setFilters((current) => ({ ...current, page: 1, [key]: value || undefined }));
  };
  const clear = () => {
    setSearchText("");
    setFilters(emptyFilters);
  };
  const salaryColumns: ColDef<NonNullable<typeof overview.data>["data"][number]>[] = [
    { field: "employeeId", headerName: "Employee ID", minWidth: 130, cellStyle: { fontWeight: 650, color: "#425be8" } },
    {
      field: "employeeName",
      headerName: "Employee name",
      sortable: true,
      sort: filters.sortBy === "employeeName" ? filters.sortOrder : undefined,
      minWidth: 205,
      cellRenderer: ({ data }: { data?: NonNullable<typeof overview.data>["data"][number] }) => data ? (
        <div className="grid-person">
          <strong>{data.employeeName}</strong>
          <small>{data.email}</small>
        </div>
      ) : null,
    },
    { field: "department", headerName: "Department" },
    { field: "designation", headerName: "Designation" },
    { field: "country", headerName: "Country" },
    {
      colId: "amount",
      headerName: "Salary",
      sortable: true,
      sort: filters.sortBy === "amount" ? filters.sortOrder : undefined,
      minWidth: 165,
      valueGetter: ({ data }) => data?.salary ? Number(data.salary.amount) : null,
      comparator: (valueA, valueB) => (valueA ?? 0) - (valueB ?? 0),
      cellRenderer: ({ data }: { data?: NonNullable<typeof overview.data>["data"][number] }) => data?.salary ? (
        <div className="grid-person">
          <strong>{formatMoney(data.salary.amount, data.salary.currency)}</strong>
          <small>{data.salary.currency}</small>
        </div>
      ) : <span className="muted-cell">No applicable salary</span>,
    },
    {
      colId: "effectiveFrom",
      headerName: "Effective from",
      sortable: true,
      sort: filters.sortBy === "effectiveFrom" ? filters.sortOrder : undefined,
      valueGetter: ({ data }) => data?.salary?.effectiveFrom ?? null,
      valueFormatter: ({ value }) => formatDate(value),
      minWidth: 145,
    },
    { field: "lastUpdatedAt", headerName: "Last updated", valueFormatter: ({ value }) => formatDate(value), minWidth: 140 },
    {
      headerName: "Actions",
      width: 130,
      minWidth: 130,
      maxWidth: 140,
      sortable: false,
      cellRenderer: ({ data }: { data?: NonNullable<typeof overview.data>["data"][number] }) => data ? (
        <div className="grid-actions">
          <Button size="small" aria-label={`History for ${data.employeeId}`} title="Salary history" component={RouterLink} to={`/employees/${encodeURIComponent(data.employeeRecordId)}/salary-history`}><HistoryOutlinedIcon fontSize="small" /></Button>
          <Button size="small" component={RouterLink} to={`/employees/${encodeURIComponent(data.employeeRecordId)}/salary-revision`}>Revise</Button>
        </div>
      ) : null,
    },
  ];
  const handleSalarySort = (sort: SortModelItem | null) => {
    if (sort?.colId === "employeeName" || sort?.colId === "amount" || sort?.colId === "effectiveFrom") {
      if (sort.sort !== "asc" && sort.sort !== "desc") return;
      const sortBy: SalaryFilters["sortBy"] = sort.colId;
      setFilters((current) => ({ ...current, page: 1, sortBy, sortOrder: sort.sort }));
    }
  };

  return (
    <Stack spacing={2.5}>
      <PageHeader title="Salary management" description="Review the salary applicable to every employee on a selected date." />
      <Card><CardContent>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth size="small" label="Search" placeholder="Employee ID, name, or email" value={searchText} onChange={(event) => setSearchText(event.target.value)} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}><TextField select fullWidth size="small" label="Department" value={filters.department ?? ""} onChange={(event) => update("department", event.target.value)}><MenuItem value="">All departments</MenuItem>{(departments.data?.data ?? []).map((department) => <MenuItem key={department.id} value={department.name}>{department.name}</MenuItem>)}</TextField></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}><CountrySelect label="Country" value={filters.country ?? ""} emptyOption="All countries" onChange={(value) => update("country", value)} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}><TextField fullWidth size="small" label="Designation" value={filters.designation ?? ""} onChange={(event) => update("designation", event.target.value)} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}><TextField fullWidth size="small" label="Currency" placeholder="e.g. INR" value={filters.currency ?? ""} onChange={(event) => update("currency", event.target.value.toUpperCase())} slotProps={{ htmlInput: { maxLength: 3 } }} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}><TextField fullWidth size="small" label="Min salary" value={filters.minAmount ?? ""} onChange={(event) => update("minAmount", event.target.value)} slotProps={{ htmlInput: { inputMode: "decimal" } }} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}><TextField fullWidth size="small" label="Max salary" value={filters.maxAmount ?? ""} onChange={(event) => update("maxAmount", event.target.value)} slotProps={{ htmlInput: { inputMode: "decimal" } }} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}><TextField fullWidth size="small" label="Effective on" type="date" value={filters.asOf} onChange={(event) => update("asOf", event.target.value)} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}><Button className="clear-filter" startIcon={<RestartAltOutlinedIcon />} onClick={clear}>Clear filters</Button></Grid>
        </Grid>
      </CardContent></Card>
      {overview.isLoading ? <LoadingState label="Loading salary overview…" /> : overview.isError ? <ErrorState error={overview.error} onRetry={() => void overview.refetch()} /> : (
        <Card className="table-card">
          <BaseTable
            ariaLabel="Salary overview"
            rows={overview.data?.data ?? []}
            columns={salaryColumns}
            emptyMessage="No employees match the current filters for this date."
            getRowId={({ data }) => data.employeeRecordId}
            onSortChanged={handleSalarySort}
          />
          {overview.data && <Box className="table-footer"><Typography variant="body2" color="text.secondary">{overview.data.pagination.total.toLocaleString()} employees · Page {filters.page} of {Math.max(overview.data.pagination.totalPages, 1)}</Typography><ServerPagination page={filters.page} totalPages={overview.data.pagination.totalPages} onChange={(page) => setFilters((current) => ({ ...current, page }))} /></Box>}
        </Card>
      )}
    </Stack>
  );
}

export default SalaryOverviewPage;