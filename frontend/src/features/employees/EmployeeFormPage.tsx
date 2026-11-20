import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { Formik } from "formik";
import { useGetDepartmentsQuery } from "@/api/departmentApi";
import {
  useGetEmployeeQuery,
  useSaveEmployeeMutation,
} from "@/api/employeeApi";
import { useNotify } from "@/components/feedback/useNotify";
import {
  CountrySelect,
  ErrorState,
  LoadingState,
  PageHeader,
} from "@/components/common";
import { employeeValidation } from "@/features/employees/employeeSchemas";
import type { Employee } from "@/types";
import { getErrorMessage } from "@/utils/format";

type EmployeeValues = {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  designation: string;
  country: string;
  employmentStatus: Employee["employmentStatus"];
  joiningDate: string;
};

const blankEmployee: EmployeeValues = {
  employeeCode: "",
  firstName: "",
  lastName: "",
  email: "",
  departmentId: "",
  designation: "",
  country: "",
  employmentStatus: "ACTIVE",
  joiningDate: "",
};

function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const notify = useNotify();
  const employeeQuery = useGetEmployeeQuery(id ?? "", { skip: !id });
  const departmentsQuery = useGetDepartmentsQuery();
  const [saveEmployee, saveState] = useSaveEmployeeMutation();

  if (isEdit && employeeQuery.isLoading)
    return <LoadingState label="Loading employee…" />;
  if (isEdit && employeeQuery.isError)
    return (
      <ErrorState
        error={employeeQuery.error}
        onRetry={() => void employeeQuery.refetch()}
      />
    );
  const employee = employeeQuery.data?.data;
  const initialValues: EmployeeValues = employee
    ? {
        employeeCode: employee.employeeCode,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        departmentId: employee.departmentId,
        designation: employee.designation,
        country: employee.country,
        employmentStatus: employee.employmentStatus,
        joiningDate: employee.joiningDate.slice(0, 10),
      }
    : blankEmployee;

  return (
    <Stack spacing={2.5}>
      <Button
        component={RouterLink}
        to={id ? `/employees/${encodeURIComponent(id)}` : "/employees"}
        startIcon={<ArrowBackOutlinedIcon />}
        sx={{ alignSelf: "flex-start" }}
      >
        {id ? "Back to employee" : "Back to employees"}
      </Button>
      <PageHeader
        title={isEdit ? "Edit employee" : "Add employee"}
        description="Keep employee details accurate and up to date."
      />
      {departmentsQuery.isError && (
        <ErrorState
          error={departmentsQuery.error}
          onRetry={() => void departmentsQuery.refetch()}
        />
      )}
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={employeeValidation}
            onSubmit={async (values, helpers) => {
              try {
                const saved = await saveEmployee({ id, body: values }).unwrap();
                notify({
                  severity: "success",
                  message: isEdit
                    ? "Employee details updated."
                    : "Employee added successfully.",
                });
                navigate(`/employees/${encodeURIComponent(saved.data.id)}`);
              } catch (error) {
                helpers.setStatus(getErrorMessage(error));
                notify({ severity: "error", message: getErrorMessage(error) });
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
                name: keyof EmployeeValues,
                label: string,
                type = "text",
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
                />
              );
              return (
                <Box component="form" onSubmit={handleSubmit} noValidate>
                  <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {field("employeeCode", "Employee ID")}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {field("email", "Work email", "email")}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {field("firstName", "First name")}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {field("lastName", "Last name")}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        name="departmentId"
                        label="Department"
                        value={values.departmentId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(
                          touched.departmentId && errors.departmentId,
                        )}
                        helperText={touched.departmentId && errors.departmentId}
                      >
                        {(departmentsQuery.data?.data ?? []).map(
                          (department) => (
                            <MenuItem key={department.id} value={department.id}>
                              {department.name}
                            </MenuItem>
                          ),
                        )}
                      </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {field("designation", "Designation")}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CountrySelect
                        name="country"
                        label="Country"
                        value={values.country}
                        onChange={(value) =>
                          void setFieldValue("country", value)
                        }
                        onBlur={handleBlur}
                        error={Boolean(touched.country && errors.country)}
                        helperText={touched.country && errors.country}
                        required
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {field("joiningDate", "Joining date", "date")}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        name="employmentStatus"
                        label="Employment status"
                        value={values.employmentStatus}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      >
                        <MenuItem value="ACTIVE">Active</MenuItem>
                        <MenuItem value="INACTIVE">Inactive</MenuItem>
                        <MenuItem value="TERMINATED">Terminated</MenuItem>
                      </TextField>
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
                          to={
                            id
                              ? `/employees/${encodeURIComponent(id)}`
                              : "/employees"
                          }
                          color="inherit"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={
                            isSubmitting ||
                            saveState.isLoading ||
                            departmentsQuery.isLoading
                          }
                        >
                          {isSubmitting || saveState.isLoading
                            ? "Saving…"
                            : "Save employee"}
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
    </Stack>
  );
}

export default EmployeeFormPage;
