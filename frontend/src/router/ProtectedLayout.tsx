import { Box } from "@mui/material";
import { Navigate, useLocation } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import { ErrorState, LoadingState } from "@/components/common";
import { useGetMeQuery } from "@/api/authApi";

export default function ProtectedLayout() {
  const { data, error, isLoading, isError, refetch } = useGetMeQuery();
  const location = useLocation();

  if (isLoading) return <LoadingState label="Checking your session…" />;
  if (isError) {
    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 401
    ) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return (
      <Box sx={{ maxWidth: 720, mx: "auto", pt: 10, px: 2 }}>
        <ErrorState error={error} onRetry={() => void refetch()} />
      </Box>
    );
  }
  if (!data?.user)
    return <Navigate to="/login" replace state={{ from: location }} />;
  return <AppLayout email={data.user.email} />;
}
