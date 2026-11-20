import { describe, expect, it } from "vitest";
import { employeeValidation } from "./employeeSchemas";

describe("employee form validation", () => {
  it("accepts a complete employee record", async () => {
    await expect(employeeValidation.isValid({
      employeeCode: "EMP-2001",
      firstName: "Ava",
      lastName: "Taylor",
      email: "ava@example.com",
      departmentId: "department-id",
      designation: "Analyst",
      country: "Canada",
      employmentStatus: "ACTIVE",
      joiningDate: "2025-03-12",
    })).resolves.toBe(true);
  });

  it("rejects invalid email addresses and missing required details", async () => {
    await expect(employeeValidation.isValid({
      employeeCode: "",
      firstName: "Ava",
      lastName: "Taylor",
      email: "not-an-email",
      departmentId: "",
      designation: "Analyst",
      country: "Canada",
      employmentStatus: "ACTIVE",
      joiningDate: "2025-03-12",
    })).resolves.toBe(false);
  });
});
