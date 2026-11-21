import {
  Alert,
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import type { ColDef } from "ag-grid-community";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  useGetCountryDistributionQuery,
  useGetDashboardSummaryQuery,
  useGetDepartmentDistributionQuery,
  useGetSalaryDistributionQuery,
} from "../../api/dashboardApi";
import {
  BaseTable,
  ErrorState,
  LoadingState,
  PageHeader,
} from "../../components/common";
import { formatMoney } from "../../utils/format";

const chartColors = [
  "#4c6fff",
  "#16a98a",
  "#f0a53a",
  "#a076e8",
  "#e36c83",
  "#32a6c8",
  "#7d95a8",
  "#d18354",
];

type SalaryDistributionRow = {
  department: string;
  designation: string;
  currency: string;
  employeeCount: number;
  totalPayroll: string;
  averageSalary: string;
};

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <Card className="metric-card">
      <CardContent>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Box>
            <Typography color="text.secondary" variant="body2">
              {label}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 750, mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box className="metric-icon">{icon}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const summary = useGetDashboardSummaryQuery();
  const departments = useGetDepartmentDistributionQuery();
  const countries = useGetCountryDistributionQuery();
  const salaryMix = useGetSalaryDistributionQuery();
  const salaryMixColumns: ColDef<SalaryDistributionRow>[] = [
    {
      headerName: "Department / designation",
      minWidth: 210,
      valueGetter: ({ data }) =>
        data ? `${data.department} ${data.designation}` : "",
      cellRenderer: ({ data }: { data?: SalaryDistributionRow }) =>
        data ? (
          <div className="grid-person">
            <strong>{data.department}</strong>
            <small>{data.designation}</small>
          </div>
        ) : null,
    },
    { field: "currency", headerName: "Currency", minWidth: 110 },
    {
      field: "employeeCount",
      headerName: "Employees",
      minWidth: 120,
      valueFormatter: ({ value }) => Number(value ?? 0).toLocaleString(),
    },
    {
      headerName: "Average salary",
      minWidth: 150,
      valueGetter: ({ data }) => (data ? Number(data.averageSalary) : null),
      comparator: (valueA, valueB) => (valueA ?? 0) - (valueB ?? 0),
      valueFormatter: ({ data }) =>
        data ? formatMoney(data.averageSalary, data.currency) : "—",
    },
    {
      headerName: "Total payroll",
      minWidth: 150,
      valueGetter: ({ data }) => (data ? Number(data.totalPayroll) : null),
      comparator: (valueA, valueB) => (valueA ?? 0) - (valueB ?? 0),
      valueFormatter: ({ data }) =>
        data ? formatMoney(data.totalPayroll, data.currency) : "—",
    },
  ];

  if (
    [summary, departments, countries, salaryMix].some(
      ({ isLoading }) => isLoading,
    )
  )
    return <LoadingState label="Preparing your dashboard…" />;

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Dashboard"
        description="A clear view of your workforce and payroll."
      />
      {[summary, departments, countries, salaryMix].some(
        ({ isError }) => isError,
      ) && (
        <Alert severity="warning">
          Some dashboard information could not be loaded. Refresh the page to
          try again.
        </Alert>
      )}
      {summary.isError ? (
        <ErrorState
          error={summary.error}
          onRetry={() => void summary.refetch()}
        />
      ) : null}
      {summary.data && (
        <>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12 }}>
                  <MetricCard
                    label="Total employees"
                    value={summary.data.data.employeeCount.toLocaleString()}
                    icon={<GroupsOutlinedIcon />}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <MetricCard
                    label="Active employees"
                    value={summary.data.data.activeEmployeeCount.toLocaleString()}
                    icon={<CheckCircleOutlinedIcon />}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <MetricCard
                    label="Inactive employees"
                    value={summary.data.data.inactiveEmployeeCount.toLocaleString()}
                    icon={<CancelOutlinedIcon />}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardContent>
                  <Typography color="text.secondary" variant="body2">
                    Current payroll by currency
                  </Typography>
                  <Grid container spacing={1} sx={{ mt: 0.5 }}>
                    {summary.data.data.payrollByCurrency.map((item) => (
                      <Grid key={item.currency} size={{ xs: 12, sm: 6 }}>
                        <Stack
                          direction="row"
                          spacing={1.5}
                          sx={{ alignItems: "center", py: 1 }}
                        >
                          <Box className="metric-icon">
                            <PaymentsOutlinedIcon />
                          </Box>
                          <Box>
                            <Typography sx={{ fontWeight: 700 }}>
                              {formatMoney(item.totalPayroll, item.currency)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.employeeCount.toLocaleString()} employees ·
                              avg{" "}
                              {formatMoney(item.averageSalary, item.currency)}
                            </Typography>
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block" }}
                            >
                              Range{" "}
                              {formatMoney(item.minimumSalary, item.currency)} –{" "}
                              {formatMoney(item.maximumSalary, item.currency)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card className="chart-card">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Employees by department
                  </Typography>
                  {departments.isError ? (
                    <ErrorState
                      error={departments.error}
                      onRetry={() => void departments.refetch()}
                    />
                  ) : (
                    <Box sx={{ width: "100%", height: 300, mt: 1 }}>
                      <ResponsiveContainer>
                        <BarChart
                          data={departments.data?.data ?? []}
                          margin={{ left: 0, right: 12, bottom: 8 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="department"
                            tick={{ fontSize: 11 }}
                            interval={0}
                            angle={-18}
                            textAnchor="end"
                            height={55}
                          />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar
                            dataKey="employeeCount"
                            name="Employees"
                            fill="#4c6fff"
                            radius={[5, 5, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card className="chart-card">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Employees by country
                  </Typography>
                  {countries.isError ? (
                    <ErrorState
                      error={countries.error}
                      onRetry={() => void countries.refetch()}
                    />
                  ) : (
                    <Box sx={{ width: "100%", height: 300, mt: 1 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={countries.data?.data ?? []}
                            dataKey="employeeCount"
                            nameKey="country"
                            innerRadius={66}
                            outerRadius={106}
                            paddingAngle={3}
                          >
                            {countries.data?.data.map((item, index) => (
                              <Cell
                                key={item.country}
                                fill={chartColors[index % chartColors.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  )}
                  <Stack
                    direction="row"
                    spacing={1.5}
                    useFlexGap
                    sx={{ flexWrap: "wrap", justifyContent: "center" }}
                  >
                    {countries.data?.data.slice(0, 8).map((item, index) => (
                      <Typography
                        key={item.country}
                        variant="caption"
                        color="text.secondary"
                      >
                        <span
                          style={{
                            color: chartColors[index % chartColors.length],
                          }}
                        >
                          ●
                        </span>{" "}
                        {item.country} ({item.employeeCount})
                      </Typography>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Card className="chart-card">
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Salary distribution by department
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Payroll totals stay grouped by currency; values are never
                combined across currencies.
              </Typography>
              {salaryMix.isError ? (
                <ErrorState
                  error={salaryMix.error}
                  onRetry={() => void salaryMix.refetch()}
                />
              ) : (
                <BaseTable
                  ariaLabel="Salary distribution by department"
                  rows={salaryMix.data?.data ?? []}
                  columns={salaryMixColumns}
                  emptyMessage="No current salary information is available."
                  height={380}
                  getRowId={({ data }) =>
                    `${data.department}-${data.designation}-${data.currency}`
                  }
                  isLoading={salaryMix.isFetching}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Stack>
  );
}
