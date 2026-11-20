import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { ColDef, SortModelItem } from "ag-grid-community";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { useGetDepartmentsQuery } from "@/api/departmentApi";
import { useGetEmployeesQuery } from "@/api/employeeApi";
import {
  BaseTable,
  CountrySelect,
  ErrorState,
  LoadingState,
  PageHeader,
  ServerPagination,
} from "@/components/common";
import type { Employee, EmployeeFilters } from "@/types";
import { EmployeeStatus } from "@/features/employees/EmployeeStatus";
import { formatDate } from "@/utils/format";

const initialFilters: EmployeeFilters = {
  page: 1,
  limit: 25,
  sortBy: "employeeCode",
  sortOrder: "asc",
};

function EmployeesPage() {
  const [filters, setFilters] = useState<EmployeeFilters>(initialFilters);
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

  const employees = useGetEmployeesQuery(filters);
  const changeFilter = (key: keyof EmployeeFilters, value: string) => {
    setFilters((current) => ({
      ...current,
      page: 1,
      [key]: value || undefined,
    }));
  };
  const sortBy = (
    field: EmployeeFilters["sortBy"],
    sortOrder: "asc" | "desc",
  ) => {
    setFilters((current) => ({
      ...current,
      sortBy: field,
      sortOrder,
    }));
  };
  const employeeColumns: ColDef<Employee>[] = [
    {
      field: "employeeCode",
      headerName: "Employee ID",
      sortable: true,
      sort: filters.sortBy === "employeeCode" ? filters.sortOrder : undefined,
      minWidth: 130,
      cellStyle: { fontWeight: 650, color: "#425be8" },
    },
    {
      headerName: "Employee",
      sortable: true,
      sort: filters.sortBy === "firstName" ? filters.sortOrder : undefined,
      minWidth: 210,
      valueGetter: ({ data }) =>
        data ? `${data.firstName} ${data.lastName}` : "",
      cellRenderer: ({ data }: { data?: Employee }) =>
        data ? (
          <div className="grid-person">
            <strong>
              {data.firstName} {data.lastName}
            </strong>
            <small>{data.email}</small>
          </div>
        ) : null,
    },
    {
      field: "department.name",
      headerName: "Department",
      sortable: true,
      sort: filters.sortBy === "department" ? filters.sortOrder : undefined,
    },
    { field: "designation", headerName: "Designation" },
    { field: "country", headerName: "Country" },
    {
      field: "employmentStatus",
      headerName: "Status",
      minWidth: 120,
      cellRenderer: ({ value }: { value?: Employee["employmentStatus"] }) =>
        value ? <EmployeeStatus status={value} /> : null,
    },
    {
      field: "joiningDate",
      headerName: "Joined",
      valueFormatter: ({ value }) => formatDate(value),
    },
    {
      headerName: "Actions",
      width: 100,
      minWidth: 100,
      maxWidth: 110,
      sortable: false,
      cellRenderer: ({ data }: { data?: Employee }) =>
        data ? (
          <Button
            size="small"
            component={RouterLink}
            to={`/employees/${encodeURIComponent(data.id)}`}
          >
            View
          </Button>
        ) : null,
    },
  ];

  const handleEmployeeSort = (sort: SortModelItem | null) => {
    if (!sort) return;
    const sortFields: Record<string, EmployeeFilters["sortBy"]> = {
      employeeCode: "employeeCode",
      firstName: "firstName",
      "department.name": "department",
    };
    const field = sortFields[sort.colId];
    if (field) sortBy(field, sort.sort);
  };

  return (
    <Stack spacing={2.5}>
      <PageHeader
        title="Employees"
        description="Manage your workforce and employee records."
        actions={
          <Button
            component={RouterLink}
            to="/employees/new"
            variant="contained"
            startIcon={<AddOutlinedIcon />}
          >
            Add employee
          </Button>
        }
      />
      <Card>
        <CardContent>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                size="small"
                label="Search"
                placeholder="Name, employee ID, or email"
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Department"
                value={filters.department ?? ""}
                onChange={(event) =>
                  changeFilter("department", event.target.value)
                }
              >
                <MenuItem value="">All departments</MenuItem>
                {(departments.data?.data ?? []).map((department) => (
                  <MenuItem key={department.id} value={department.name}>
                    {department.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <CountrySelect
                label="Country"
                value={filters.country ?? ""}
                emptyOption="All countries"
                onChange={(value) => changeFilter("country", value)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <TextField
                fullWidth
                size="small"
                label="Designation"
                value={filters.designation ?? ""}
                onChange={(event) =>
                  changeFilter("designation", event.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <TextField
                select
                fullWidth
                size="small"
                label="Status"
                value={filters.employmentStatus ?? ""}
                onChange={(event) =>
                  changeFilter("employmentStatus", event.target.value)
                }
              >
                <MenuItem value="">All statuses</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="TERMINATED">Terminated</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {employees.isLoading ? (
        <LoadingState label="Loading employees…" />
      ) : employees.isError ? (
        <ErrorState
          error={employees.error}
          onRetry={() => void employees.refetch()}
        />
      ) : (
        <Card className="table-card">
          <BaseTable
            ariaLabel="Employees"
            rows={employees.data?.data ?? []}
            columns={employeeColumns}
            emptyMessage="No employees match your filters. Try changing your search or add an employee."
            getRowId={({ data }) => data.id}
            onSortChanged={handleEmployeeSort}
          />
          {employees.data && (
            <Box className="table-footer">
              <Typography variant="body2" color="text.secondary">
                {employees.data.pagination.total.toLocaleString()} employees
              </Typography>
              <ServerPagination
                page={filters.page}
                totalPages={employees.data.pagination.totalPages}
                onChange={(page) =>
                  setFilters((current) => ({ ...current, page }))
                }
              />
            </Box>
          )}
        </Card>
      )}
    </Stack>
  );
}

export default EmployeesPage;
