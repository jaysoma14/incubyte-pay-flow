export interface User {
  id: string;
  email: string;
  role: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PageResult<T> {
  data: T[];
  pagination: Pagination;
}

export interface Department {
  id: string;
  name: string;
  employeeCount: number;
}

export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId: string;
  department: { id: string; name: string };
  designation: string;
  country: string;
  employmentStatus: "ACTIVE" | "INACTIVE" | "TERMINATED";
  joiningDate: string;
  createdAt: string;
  updatedAt: string;
  salaries?: SalaryRecord[];
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  amount: string;
  currency: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  createdAt: string;
  updatedAt: string;
  auditLogs?: AuditLog[];
}

export interface SalaryOverviewRow {
  employeeRecordId: string;
  employeeId: string;
  employeeName: string;
  email: string;
  department: string;
  designation: string;
  country: string;
  salary: {
    id: string;
    amount: string;
    currency: string;
    effectiveFrom: string;
    effectiveTo: string | null;
  } | null;
  lastUpdatedAt: string | null;
}

export interface AuditLog {
  id: string;
  employeeId: string;
  salaryId: string;
  previousAmount: string | null;
  previousCurrency: string | null;
  newAmount: string;
  newCurrency: string;
  effectiveFrom: string;
  reason: string;
  createdAt: string;
  employee: {
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
  };
  salary: Pick<
    SalaryRecord,
    "amount" | "currency" | "effectiveFrom" | "effectiveTo"
  >;
  changedBy: { id: string; email: string };
}

export interface SalaryFilters {
  page: number;
  limit: number;
  search?: string;
  country?: string;
  department?: string;
  designation?: string;
  currency?: string;
  minAmount?: string;
  maxAmount?: string;
  sortBy: "employeeName" | "amount" | "effectiveFrom";
  sortOrder: "asc" | "desc";
  asOf: string;
}

export interface EmployeeFilters {
  page: number;
  limit: number;
  search?: string;
  department?: string;
  country?: string;
  designation?: string;
  employmentStatus?: Employee["employmentStatus"];
  sortBy:
    | "employeeCode"
    | "firstName"
    | "lastName"
    | "joiningDate"
    | "department"
    | "designation"
    | "country"
    | "createdAt";
  sortOrder: "asc" | "desc";
}

export interface SalaryRevisionInput {
  amount: string;
  currency: string;
  effectiveFrom: string;
  reason: string;
}

export interface DashboardSummary {
  employeeCount: number;
  inactiveEmployeeCount: number;
  activeEmployeeCount: number;
  payrollByCurrency: Array<{
    currency: string;
    employeeCount: number;
    totalPayroll: string;
    averageSalary: string;
    minimumSalary: string;
    maximumSalary: string;
  }>;
}
