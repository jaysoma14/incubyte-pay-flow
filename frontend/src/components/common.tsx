import { Alert, Box, CircularProgress, Pagination, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { getErrorMessage } from "../utils/format";
export { BaseTable } from "./common/BaseTable";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <Stack className="page-header" direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" } }}>
      <Box>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>{title}</Typography>
        {description && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{description}</Typography>}
      </Box>
      {actions}
    </Stack>
  );
}

export function LoadingState({ label = "Loading data…" }: { label?: string }) {
  return <Stack spacing={1.5} sx={{ minHeight: 220, alignItems: "center", justifyContent: "center" }}><CircularProgress size={30} /><Typography color="text.secondary">{label}</Typography></Stack>;
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = getErrorMessage(error);
  return <Alert severity="error" action={onRetry ? <button className="inline-action" onClick={onRetry}>Retry</button> : undefined}>{message}</Alert>;
}

export function EmptyState({ children = "No records found." }: { children?: ReactNode }) {
  return <Box className="empty-state"><Typography color="text.secondary">{children}</Typography></Box>;
}

export function ServerPagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;
  return <Stack sx={{ py: 2, alignItems: "center" }}><Pagination count={totalPages} page={page} onChange={(_event, value) => onChange(value)} color="primary" /></Stack>;
}
