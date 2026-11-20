import { Alert, Box, Button, Card, CardContent, Stack, TextField, Typography } from "@mui/material";
import { Formik } from "formik";
import * as Yup from "yup";
import { useLocation, useNavigate } from "react-router-dom";
import { useLoginMutation } from "@/api/authApi";
import { useNotify } from "@/components/feedback/useNotify";
import { getErrorMessage } from "@/utils/format";

export default function LoginPage() {
  const [login, { isLoading }] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const notify = useNotify();
  const destination =
    (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname ?? "/dashboard";

  return (
    <Box className="login-page">
      <Box className="login-brand">
        <Box className="brand-mark">P</Box>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          PayFlow
        </Typography>
      </Box>
      <Card className="login-card">
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography variant="h4" sx={{ fontWeight: 750 }}>
            Welcome back
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
            Sign in to manage your people and payroll.
          </Typography>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={Yup.object({
              email: Yup.string()
                .email("Enter a valid email address")
                .required("Email is required"),
              password: Yup.string().required("Password is required"),
            })}
            onSubmit={async (values, helpers) => {
              try {
                await login(values).unwrap();
                navigate(destination, { replace: true });
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
              isSubmitting,
              status,
            }) => (
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2.25}>
                  <TextField
                    fullWidth
                    autoFocus
                    name="email"
                    label="Work email"
                    type="email"
                    autoComplete="username"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.email && errors.email)}
                    helperText={touched.email && errors.email}
                  />
                  <TextField
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    autoComplete="current-password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(touched.password && errors.password)}
                    helperText={touched.password && errors.password}
                  />
                  {status && <Alert severity="error">{status}</Alert>}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading || isSubmitting}
                  >
                    {isLoading || isSubmitting ? "Signing in…" : "Sign in"}
                  </Button>
                </Stack>
              </Box>
            )}
          </Formik>
        </CardContent>
      </Card>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
        Secure access for authorized HR managers.
      </Typography>
    </Box>
  );
}
