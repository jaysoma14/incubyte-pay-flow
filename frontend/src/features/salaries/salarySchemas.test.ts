import { describe, expect, it } from "vitest";
import { salaryRevisionValidation } from "./salarySchemas";

describe("salary revision validation", () => {
  it("requires a positive amount, currency, effective date, and reason", async () => {
    await expect(salaryRevisionValidation.isValid({
      amount: "0",
      currency: "US",
      effectiveFrom: "",
      reason: "",
    })).resolves.toBe(false);
  });

  it("accepts valid revision details", async () => {
    await expect(salaryRevisionValidation.isValid({
      amount: "72000.50",
      currency: "CAD",
      effectiveFrom: "2026-11-20",
      reason: "Annual compensation review",
    })).resolves.toBe(true);
  });
});
