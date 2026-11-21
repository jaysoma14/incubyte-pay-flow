import { Router } from "express";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", async (_request, response) => {
  const [
    employeeCount,
    activeEmployeeCount,
    inactiveEmployeeCount,
    payrollByCurrency,
  ] = await Promise.all([
    prisma.employee.count(),
    prisma.employee.count({ where: { employmentStatus: "ACTIVE" } }),
    prisma.employee.count({ where: { employmentStatus: "INACTIVE" } }),
    prisma.$queryRaw<
      Array<{
        currency: string;
        employeeCount: number;
        totalPayroll: string;
        averageSalary: string;
        minimumSalary: string;
        maximumSalary: string;
      }>
    >(Prisma.sql`
      SELECT
        s."currency" AS "currency",
        COUNT(*)::int AS "employeeCount",
        SUM(s."amount")::text AS "totalPayroll",
        AVG(s."amount")::text AS "averageSalary",
        MIN(s."amount")::text AS "minimumSalary",
        MAX(s."amount")::text AS "maximumSalary"
      FROM "Salary" s
      JOIN "Employee" e ON e."id" = s."employeeId"
      WHERE e."employmentStatus" = 'ACTIVE'
        AND s."effectiveFrom" <= CURRENT_DATE
        AND (s."effectiveTo" IS NULL OR s."effectiveTo" >= CURRENT_DATE)
      GROUP BY s."currency"
      ORDER BY s."currency" ASC
    `),
  ]);
  response.json({
    data: {
      employeeCount,
      activeEmployeeCount,
      inactiveEmployeeCount,
      payrollByCurrency,
    },
  });
});

dashboardRouter.get("/department-distribution", async (_request, response) => {
  const data = await prisma.$queryRaw<
    Array<{ department: string; employeeCount: number }>
  >(Prisma.sql`
    SELECT d."name" AS "department", COUNT(e."id")::int AS "employeeCount"
    FROM "Department" d
    LEFT JOIN "Employee" e ON e."departmentId" = d."id"
    GROUP BY d."id", d."name"
    ORDER BY d."name" ASC
  `);
  response.json({ data });
});

dashboardRouter.get("/country-distribution", async (_request, response) => {
  const data = await prisma.employee.groupBy({
    by: ["country"],
    _count: { _all: true },
    orderBy: { country: "asc" },
  });
  response.json({
    data: data.map(({ country, _count }) => ({
      country,
      employeeCount: _count._all,
    })),
  });
});

dashboardRouter.get("/salary-distribution", async (_request, response) => {
  const data = await prisma.$queryRaw<
    Array<{
      department: string;
      designation: string;
      currency: string;
      employeeCount: number;
      totalPayroll: string;
      averageSalary: string;
    }>
  >(Prisma.sql`
    SELECT
      d."name" AS "department",
      e."designation" AS "designation",
      s."currency" AS "currency",
      COUNT(*)::int AS "employeeCount",
      SUM(s."amount")::text AS "totalPayroll",
      AVG(s."amount")::text AS "averageSalary"
    FROM "Salary" s
    JOIN "Employee" e ON e."id" = s."employeeId"
    JOIN "Department" d ON d."id" = e."departmentId"
    WHERE e."employmentStatus" = 'ACTIVE'
      AND s."effectiveFrom" <= CURRENT_DATE
      AND (s."effectiveTo" IS NULL OR s."effectiveTo" >= CURRENT_DATE)
    GROUP BY d."name", e."designation", s."currency"
    ORDER BY d."name", e."designation", s."currency"
  `);
  response.json({ data });
});
