import { Link as RouterLink, useParams } from "react-router-dom";
import { Box, Button, Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import { useGetEmployeeQuery } from "@/api/employeeApi";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/common";
import { EmployeeStatus } from "@/features/employees/EmployeeStatus";
import { formatDate, formatMoney } from "@/utils/format";

function EmployeeDetailPage() {
  const { id = "" } = useParams();
  const employeeQuery = useGetEmployeeQuery(id);
  const employee = employeeQuery.data?.data;

  if (employeeQuery.isLoading) return <LoadingState label="Loading employee…" />;
  if (employeeQuery.isError) return <ErrorState error={employeeQuery.error} onRetry={() => void employeeQuery.refetch()} />;
  if (!employee) return <EmptyState>Employee record not found.</EmptyState>;

  const asOf = new Date().toISOString().slice(0, 10);
  const currentSalary = employee.salaries?.find((salary) =>
    salary.effectiveFrom.slice(0, 10) <= asOf &&
    (!salary.effectiveTo || salary.effectiveTo.slice(0, 10) >= asOf),
  );

  return (
    <Stack spacing={2.5}>
      <Button component={RouterLink} to="/employees" startIcon={<ArrowBackOutlinedIcon />} sx={{ alignSelf: "flex-start" }}>Back to employees</Button>
      <PageHeader title={`${employee.firstName} ${employee.lastName}`} description={`${employee.employeeCode} · ${employee.designation}`} actions={<Button component={RouterLink} to={`/employees/${encodeURIComponent(id)}/edit`} variant="outlined" startIcon={<EditOutlinedIcon />}>Edit employee</Button>} />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 7 }}><Card><CardContent><Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Employee information</Typography><Box className="detail-grid">
          <span>Work email</span><strong>{employee.email}</strong><span>Department</span><strong>{employee.department.name}</strong><span>Country</span><strong>{employee.country}</strong><span>Employment status</span><strong><EmployeeStatus status={employee.employmentStatus} /></strong><span>Joining date</span><strong>{formatDate(employee.joiningDate)}</strong><span>Record created</span><strong>{formatDate(employee.createdAt)}</strong>
        </Box></CardContent></Card></Grid>
        <Grid size={{ xs: 12, lg: 5 }}><Card><CardContent><Typography variant="h6" sx={{ fontWeight: 700 }}>Current salary</Typography>
          {currentSalary ? <><Typography variant="h4" sx={{ fontWeight: 750, mt: 2 }}>{formatMoney(currentSalary.amount, currentSalary.currency)}</Typography><Typography color="text.secondary">Effective {formatDate(currentSalary.effectiveFrom)}</Typography></> : <Typography color="text.secondary" sx={{ mt: 2 }}>No salary applies today.</Typography>}
          <Stack spacing={1} sx={{ mt: 2 }}><Button component={RouterLink} to={`/employees/${encodeURIComponent(id)}/salary-history`} variant="outlined" startIcon={<HistoryOutlinedIcon />}>View salary history</Button><Button component={RouterLink} to={`/employees/${encodeURIComponent(id)}/salary-revision`} variant="contained">Revise salary</Button></Stack>
        </CardContent></Card></Grid>
      </Grid>
    </Stack>
  );
}

export default EmployeeDetailPage;