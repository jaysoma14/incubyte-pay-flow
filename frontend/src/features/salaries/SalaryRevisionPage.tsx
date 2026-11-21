import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Formik } from "formik";
import { useGetEmployeeQuery } from "@/api/employeeApi";
import { useReviseSalaryMutation } from "@/api/salaryApi";
import { useNotify } from "@/components/feedback/useNotify";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/components/common";
import { FormControlCurrencySelect } from "@/components/formControls";
import { salaryRevisionValidation } from "@/features/salaries/salarySchemas";
import { formatDate, formatMoney, getErrorMessage } from "@/utils/format";

const today = () => new Date().toISOString().slice(0, 10);

function SalaryRevisionPage() {
  const { id = "" } = useParams();
  const employeeQuery = useGetEmployeeQuery(id);
  const [revise, revisionState] = useReviseSalaryMutation();
  const navigate = useNavigate();
  const notify = useNotify();

  if (employeeQuery.isLoading)
    return <LoadingState label="Loading employee…" />;
  if (employeeQuery.isError)
    return (
      <ErrorState
        error={employeeQuery.error}
        onRetry={() => void employeeQuery.refetch()}
      />
    );
  const employee = employeeQuery.data?.data;
  if (!employee) return <EmptyState>Employee record not found.</EmptyState>;

  const lastSalary = employee.salaries?.[0];
  return (
    <Stack spacing={2.5}>
      <Button
        component={RouterLink}
        to={`/employees/${encodeURIComponent(id)}`}
        startIcon={<ArrowBackOutlinedIcon />}
        sx={{ alignSelf: "flex-start" }}
      >
        Back to employee
      </Button>
      <PageHeader
        title="Revise salary"
        description={`${employee.firstName} ${employee.lastName} · ${employee.employeeCode}`}
      />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                CURRENT SALARY
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 750, mt: 1 }}>
                {lastSalary
                  ? formatMoney(lastSalary.amount, lastSalary.currency)
                  : "Not set"}
              </Typography>
              {lastSalary && (
                <Typography color="text.secondary">
                  Since {formatDate(lastSalary.effectiveFrom)}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                New salary details
              </Typography>
              <Formik
                initialValues={{
                  amount: "",
                  currency: lastSalary?.currency ?? "",
                  effectiveFrom: today(),
                  reason: "",
                }}
                validationSchema={salaryRevisionValidation}
                onSubmit={async (values, helpers) => {
                  try {
                    await revise({
                      id,
                      body: { ...values, amount: String(values.amount) },
                    }).unwrap();
                    notify({
                      severity: "success",
                      message: "Salary revision saved successfully.",
                    });
                    navigate(
                      `/employees/${encodeURIComponent(id)}/salary-history`,
                    );
                  } catch (error) {
                    const message = getErrorMessage(error);
                    helpers.setStatus(message);
                    notify({ severity: "error", message });
                  }
                }}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  setFieldValue,
                  isSubmitting,
                  status,
                }) => {
                  const field = (
                    name: "amount" | "currency" | "effectiveFrom" | "reason",
                    label: string,
                    type = "text",
                    multiline = false,
                  ) => (
                    <TextField
                      fullWidth
                      name={name}
                      label={label}
                      type={type}
                      value={values[name]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched[name] && errors[name])}
                      helperText={touched[name] && errors[name]}
                      multiline={multiline}
                      minRows={multiline ? 3 : undefined}
                      slotProps={{
                        htmlInput:
                          name === "amount"
                            ? { inputMode: "decimal" }
                            : undefined,
                        inputLabel:
                          type === "date" ? { shrink: true } : undefined,
                      }}
                    />
                  );
                  return (
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                      <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          {field("amount", "Salary amount", "number")}
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <FormControlCurrencySelect
                            name="currency"
                            label="Currency (ISO 4217)"
                            value={values.currency}
                            onChange={(event) =>
                              void setFieldValue(
                                "currency",
                                event.target.value,
                              )
                            }
                            onBlur={handleBlur}
                            error={Boolean(
                              touched.currency && errors.currency,
                            )}
                            helperText={touched.currency && errors.currency}
                            required
                          />
                        </Grid>
                        <Grid size={12}>
                          {field("effectiveFrom", "Effective from", "date")}
                        </Grid>
                        <Grid size={12}>
                          {field("reason", "Reason for change", "text", true)}
                        </Grid>
                        {status && (
                          <Grid size={12}>
                            <Alert severity="error">{status}</Alert>
                          </Grid>
                        )}
                        <Grid size={12}>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{ justifyContent: "flex-end" }}
                          >
                            <Button
                              component={RouterLink}
                              to={`/employees/${encodeURIComponent(id)}`}
                              color="inherit"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              variant="contained"
                              disabled={isSubmitting || revisionState.isLoading}
                            >
                              {isSubmitting || revisionState.isLoading
                                ? "Saving…"
                                : "Save salary revision"}
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Box>
                  );
                }}
              </Formik>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  );
}

export default SalaryRevisionPage;
