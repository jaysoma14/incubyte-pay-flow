import { describe, expect, it } from "vitest";
import { salaryCreateSchema, salaryOverviewQuerySchema } from "./salary.schema";

describe("salary validation", () => {
  it("accepts a positive salary with a supported currency and valid date", () => {
    expect(salaryCreateSchema.safeParse({
      amount: "85000.25",
      currency: "INR",
      effectiveFrom: "2026-01-01",
      reason: "Annual adjustment",
    }).success).toBe(true);
  });

  it("rejects unsupported currencies, zero amounts, and invalid calendar dates", () => {
    expect(salaryCreateSchema.safeParse({
      amount: "0.00",
      currency: "USD",
      effectiveFrom: "2026-01-01",
      reason: "Reason",
    }).success).toBe(false);
    expect(salaryCreateSchema.safeParse({
      amount: "100",
      currency: "ZZZ",
      effectiveFrom: "2026-01-01",
      reason: "Reason",
    }).success).toBe(false);
    expect(salaryCreateSchema.safeParse({
      amount: "100",
      currency: "USD",
      effectiveFrom: "2026-02-30",
      reason: "Reason",
    }).success).toBe(false);
  });

  it("compares salary ranges without floating-point precision loss", () => {
    expect(salaryOverviewQuerySchema.safeParse({
      minAmount: "9007199254740992.01",
      maxAmount: "9007199254740992.00",
    }).success).toBe(false);
    expect(salaryOverviewQuerySchema.safeParse({ page: "1", limit: "101" }).success).toBe(false);
  });
});
