import { z } from "zod";

const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
  (value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
  },
  "Date must be a valid calendar date in YYYY-MM-DD format",
);

const supportedCurrencies = new Set(Intl.supportedValuesOf("currency"));
const amount = z.string().regex(/^(?:0|[1-9]\d{0,15})(?:\.\d{1,2})?$/)
  .refine((value) => /[1-9]/.test(value), "Salary amount must be greater than zero");
const rangeAmount = z.string().regex(/^(?:0|[1-9]\d{0,15})(?:\.\d{1,2})?$/);

export const salaryCreateSchema = z.object({
  amount,
  currency: z.string().regex(/^[A-Z]{3}$/, "Currency must be a 3-letter uppercase code")
    .refine((value) => supportedCurrencies.has(value), "Currency must be a supported ISO 4217 code"),
  effectiveFrom: dateOnly,
  reason: z.string().trim().min(1).max(1000),
});

export const salaryOverviewQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  search: z.string().trim().max(120).optional(),
  country: z.string().trim().min(1).max(100).optional(),
  department: z.string().trim().min(1).max(100).optional(),
  designation: z.string().trim().min(1).max(120).optional(),
  currency: z.string().regex(/^[A-Za-z]{3}$/).transform((value) => value.toUpperCase()).optional(),
  minAmount: rangeAmount.optional(),
  maxAmount: rangeAmount.optional(),
  sortBy: z.enum(["employeeName", "amount", "effectiveFrom"]).default("employeeName"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  asOf: dateOnly.optional(),
}).refine(
  (query) => query.minAmount === undefined || query.maxAmount === undefined ||
    toMinorUnits(query.minAmount) <= toMinorUnits(query.maxAmount),
  { path: ["maxAmount"], message: "maxAmount must be greater than or equal to minAmount" },
);

export const paginatedQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(25),
});

function toMinorUnits(value: string) {
  const [whole, fraction = ""] = value.split(".");
  return BigInt(whole!) * 100n + BigInt(fraction.padEnd(2, "0"));
}
