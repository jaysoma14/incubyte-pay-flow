import { Chip } from "@mui/material";
import type { Employee } from "@/types";

export function EmployeeStatus({ status }: { status: Employee["employmentStatus"] }) {
  const color = status === "ACTIVE" ? "success" : status === "INACTIVE" ? "warning" : "default";
  return <Chip size="small" color={color} label={status.toLowerCase()} className="status-chip" />;
}
