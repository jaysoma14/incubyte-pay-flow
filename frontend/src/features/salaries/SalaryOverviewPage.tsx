import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
} from "@mui/material";
import type { ColDef, SortModelItem } from "ag-grid-community";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";
import { useGetDepartmentsQuery } from "@/api/departmentApi";
import { useGetSalaryOverviewQuery } from "@/api/salaryApi";
import {
  BaseTable,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/components/common";
import { formatDate, formatMoney } from "@/utils/format";
import type { SalaryFilters, SalaryOverviewRow } from "@/types";
import {
  FormControlCountrySelect,
  FormControlCurrencySelect,
  FormControlSelect,
} from "@/components/formControls";

const today = () => new Date().toISOString().slice(0, 10);
const emptyFilters: SalaryFilters = {
  page: 1,
  limit: 25,
  sortBy: "employeeName",
  sortOrder: "asc",
  asOf: today(),
};

  const salaryColumns: ColDef<
    NonNullable<SalaryOverviewRow>
  >[] = [
    {
      field: "employeeId",
      headerName: "Employee ID",
      minWidth: 130,
      cellStyle: { fontWeight: 650, color: "#425be8" },
    },
    {
      field: "employeeName",
      headerName: "Employee name",
      sortable: true,
      minWidth: 205,
      cellRenderer: ({
        data,
      }: {
        data?: NonNullable<SalaryOverviewRow>;
      }) =>
        data ? (
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
      minWidth: 165,
      valueGetter: ({ data }) =>
        data?.salary ? Number(data.salary.amount) : null,
      comparator: (valueA, valueB) => (valueA ?? 0) - (valueB ?? 0),
      cellRenderer: ({
        data,
      }: {
        data?: NonNullable<SalaryOverviewRow>;
      }) =>
        data?.salary ? (
          <div className="grid-person">
            <strong>
              {formatMoney(data.salary.amount, data.salary.currency)}
            </strong>
            <small>{data.salary.currency}</small>
          </div>
        ) : (
          <span className="muted-cell">No applicable salary</span>
        ),
    },
    {
      colId: "effectiveFrom",
      headerName: "Effective from",
      sortable: true,
      valueGetter: ({ data }) => data?.salary?.effectiveFrom ?? null,
      valueFormatter: ({ value }) => formatDate(value),
      minWidth: 145,
    },
    {
      field: "lastUpdatedAt",
      headerName: "Last updated",
      valueFormatter: ({ value }) => formatDate(value),
      minWidth: 140,
    },
    {
      headerName: "Actions",
      width: 130,
      minWidth: 130,
      maxWidth: 140,
      sortable: false,
      cellRenderer: ({
        data,
      }: {
        data?: NonNullable<SalaryOverviewRow>;
      }) =>
        data ? (
          <div className="grid-actions">
            <Button
              size="small"
              aria-label={`History for ${data.employeeId}`}
              title="Salary history"
              component={RouterLink}
              to={`/employees/${encodeURIComponent(data.employeeRecordId)}/salary-history`}
            >
              <HistoryOutlinedIcon fontSize="small" />
            </Button>
            <Button
              size="small"
              component={RouterLink}
              to={`/employees/${encodeURIComponent(data.employeeRecordId)}/salary-revision`}
            >
              Revise
            </Button>
          </div>
        ) : null,
    },
  ];

function SalaryOverviewPage() {
  const [filters, setFilters] = useState<SalaryFilters>(emptyFilters);
  const [searchText, setSearchText] = useState("");
  const departments = useGetDepartmentsQuery();

  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        setFilters((current) => ({
          ...current,
          page: 1,
          search: searchText.trim() || undefined,
        })),
      300,
    );
    return () => window.clearTimeout(timer);
  }, [searchText]);

  const overview = useGetSalaryOverviewQuery(filters);

  const update = (key: keyof SalaryFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      page: 1,
      [key]: value || undefined,
    }));
  };
  const clear = () => {
    setSearchText("");
    setFilters(emptyFilters);
  };

  const handleSalarySort = (sort: SortModelItem | null) => {
    if (
      sort?.colId === "employeeName" ||
      sort?.colId === "amount" ||
      sort?.colId === "effectiveFrom"
    ) {
      if (sort.sort !== "asc" && sort.sort !== "desc") return;
      const sortBy: SalaryFilters["sortBy"] = sort.colId;
      setFilters((current) => ({
        ...current,
        page: 1,
        sortBy,
        sortOrder: sort.sort,
      }));
    }
  };

  const departmentOptions = useMemo(() => {
    return [
      ...(departments.data?.data.map((d) => ({
        value: d.name,
        label: d.name,
      })) || []),
    ];
  }, [departments.data?.data]);

  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    page: number,
  ) => {
    setFilters((current) => ({ ...current, page: page + 1 }));
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const limit = parseInt(event.target.value, 10);
    setFilters((current) => ({ ...current, page: 1, limit }));
  };

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Salary management"
        description="Review the salary applicable to every employee on a selected date."
      />
      <Card>
        <CardContent>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                placeholder="Employee ID, name, or email"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControlSelect
                size="small"
                label="Department"
                options={departmentOptions}
                value={filters.department ?? ""}
                emptyOption="All departments"
                onChange={(event) => update("department", event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControlCountrySelect
                label="Country"
                size="small"
                value={filters.country ?? ""}
                emptyOption="All countries"
                onChange={({ target: { value } }) =>
                  update("country", value || "")
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Designation"
                value={filters.designation ?? ""}
                onChange={(event) => update("designation", event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControlCurrencySelect
                label="Currency"
                size="small"
                value={filters.currency ?? ""}
                onChange={(event) => update("currency", event.target.value)}
                emptyOption="All currencies"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Min salary"
                value={filters.minAmount ?? ""}
                onChange={(event) => update("minAmount", event.target.value)}
                slotProps={{ htmlInput: { inputMode: "decimal" } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Max salary"
                value={filters.maxAmount ?? ""}
                onChange={(event) => update("maxAmount", event.target.value)}
                slotProps={{ htmlInput: { inputMode: "decimal" } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Effective on"
                type="date"
                value={filters.asOf}
                onChange={(event) => update("asOf", event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                className="clear-filter"
                startIcon={<RestartAltOutlinedIcon />}
                onClick={clear}
              >
                Clear filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {overview.isLoading ? (
        <LoadingState label="Loading salary overview…" />
      ) : overview.isError ? (
        <ErrorState
          error={overview.error}
          onRetry={() => void overview.refetch()}
        />
      ) : (
        <Card className="table-card">
          <BaseTable
            ariaLabel="Salary overview"
            rows={overview.data?.data ?? []}
            columns={salaryColumns}
            emptyMessage="No employees match the current filters for this date."
            getRowId={({ data }) => data.employeeRecordId}
            onSortChanged={handleSalarySort}
            paginationMeta={overview.data?.pagination}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
            isLoading={overview.isFetching}
          />
        </Card>
      )}
    </Stack>
  );
}

export default SalaryOverviewPage;
