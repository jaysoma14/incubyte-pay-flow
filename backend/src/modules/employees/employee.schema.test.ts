import { describe, expect, it } from "vitest";
import { employeeCreateSchema, employeeListQuerySchema } from "./employee.schema";

describe("employee validation", () => {
  it("rejects invalid joining dates and malformed email addresses", () => {
    expect(employeeCreateSchema.safeParse({
      employeeCode: "EMP-1",
      firstName: "Ada",
      lastName: "Example",
      email: "invalid",
      departmentId: "department-id",
      designation: "Engineer",
      country: "Canada",
      joiningDate: "2026-02-30",
    }).success).toBe(false);
  });

  it("applies pagination defaults and caps page size", () => {
    expect(employeeListQuerySchema.parse({}).limit).toBe(25);
    expect(employeeListQuerySchema.safeParse({ limit: "101" }).success).toBe(false);
  });
});
