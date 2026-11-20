import { z } from "zod";
import { EmploymentStatus } from "../../generated/prisma/enums";

const employeeFields = {
  employeeCode: z.string().trim().min(1).max(40),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  departmentId: z.string().min(1),
  designation: z.string().trim().min(1).max(120),
  country: z.string().trim().min(1).max(100),
  employmentStatus: z.enum(EmploymentStatus).default("ACTIVE"),
  joiningDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
    (value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
    },
    "Joining date must be a valid calendar date",
  ),
};

export const employeeCreateSchema = z.object(employeeFields);
export const employeeUpdateSchema = z.object(employeeFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update");

export const employeeListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().max(120).optional(),
  department: z.string().trim().min(1).max(100).optional(),
  departmentId: z.string().trim().min(1).optional(),
  designation: z.string().trim().min(1).max(120).optional(),
  country: z.string().trim().min(1).max(100).optional(),
  employmentStatus: z.enum(EmploymentStatus).optional(),
  sortBy: z.enum([
    "employeeCode",
    "firstName",
    "lastName",
    "joiningDate",
    "department",
    "designation",
    "country",
    "createdAt",
  ]).default("employeeCode"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});
