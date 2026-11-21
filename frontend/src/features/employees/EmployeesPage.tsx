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
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RestartAltOutlinedIcon from "@mui/icons-material/RestartAltOutlined";

import { useGetDepartmentsQuery } from "@/api/departmentApi";
import { useGetEmployeesQuery } from "@/api/employeeApi";
import {
  BaseTable,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/components/common";
import type { Employee, EmployeeFilters } from "@/types";
import { EmployeeStatus } from "@/features/employees/EmployeeStatus";
import { formatDate } from "@/utils/format";
import {
  FormControlCountrySelect,
  FormControlSelect,
} from "@/components/formControls";
import { employeeStatusOptions } from "@/constants/employee";

const initialFilters: EmployeeFilters = {
  page: 1,
  limit: 25,
  sortBy: "employeeCode",
  sortOrder: "asc",
};

const employeeColumns: ColDef<Employee>[] = [
  {
    field: "employeeCode",
    headerName: "Employee ID",
    sortable: true,
    minWidth: 130,
    cellStyle: { fontWeight: 650, color: "#425be8" },
  },
  {
    field: "firstName",
    headerName: "Employee",
    sortable: true,
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
  },
  {
    field: "designation",
    headerName: "Designation",
    sortable: true,
  },
  {
    field: "country",
    headerName: "Country",
    sortable: true,
  },
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
    sortable: true,
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

  const handleEmployeeSort = (sort: SortModelItem | null) => {
    if (!sort) return;
    const sortFields: Record<string, EmployeeFilters["sortBy"]> = {
      employeeCode: "employeeCode",
      firstName: "firstName",
      "department.name": "department",
    };
    const field = sortFields[sort.colId] || sort.colId;
    if (field) sortBy(field, sort.sort);
  };

  const departmentOptions = useMemo(() => {
    return [
      ...(departments.data?.data.map((d) => ({
        value: d.name,
        label: d.name,
      })) || []),
    ];
  }, [departments.data?.data]);

  const clearFilters = () => {
    setSearchText("");
    setFilters(initialFilters);
  };

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
              <FormControlSelect
                label="Department"
                size="small"
                options={departmentOptions}
                emptyOption="All departments"
                value={filters.department ?? ""}
                onChange={(event) =>
                  changeFilter("department", event.target.value || "")
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
              <FormControlCountrySelect
                label="Country"
                size="small"
                value={filters.country ?? ""}
                emptyOption="All countries"
                onChange={({ target: { value } }) =>
                  changeFilter("country", value || "")
                }
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
              <FormControlSelect
                size="small"
                label="Status"
                value={filters.employmentStatus ?? ""}
                options={employeeStatusOptions}
                emptyOption="All statuses"
                onChange={(event) =>
                  changeFilter("employmentStatus", event.target.value)
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                className="clear-filter"
                startIcon={<RestartAltOutlinedIcon />}
                onClick={clearFilters}
              >
                Clear filters
              </Button>
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
            paginationMeta={employees.data?.pagination}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
            isLoading={employees.isFetching}
          />
        </Card>
      )}
    </Stack>
  );
}

export default EmployeesPage;
