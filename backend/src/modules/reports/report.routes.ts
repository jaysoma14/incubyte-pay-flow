import { Router } from "express";
import { parseQuery } from "../../middleware/validate";
import { employeeListQuerySchema } from "../employees/employee.schema";
import { employeeWhere } from "../employees/employee.service";
import { salaryOverviewQuerySchema } from "../salaries/salary.schema";
import { salaryOverview } from "../salaries/salary.service";
import { prisma } from "../../lib/prisma";
import { writeCsvRow } from "../../lib/csv";

export const reportRouter = Router();

reportRouter.get("/employees/export", async (request, response) => {
  const query = parseQuery(
    employeeListQuerySchema.omit({ page: true, limit: true }),
    request,
  );
  const where = employeeWhere({
    ...query,
    page: 1,
    limit: 100,
  });
  response.type("text/csv; charset=utf-8");
  response.attachment("employees.csv");
  if (!await writeCsvRow(response, ["employeeCode", "firstName", "lastName", "email", "department", "designation", "country", "status", "joiningDate"])) {
    return;
  }

  let offset = 0;
  while (true) {
    const batch = await prisma.employee.findMany({
      where,
      take: 500,
      skip: offset,
      orderBy: [{ employeeCode: "asc" }, { id: "asc" }],
      include: { department: { select: { name: true } } },
    });
    for (const employee of batch) {
      const keepWriting = await writeCsvRow(response, [
        employee.employeeCode,
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.department.name,
        employee.designation,
        employee.country,
        employee.employmentStatus,
        employee.joiningDate.toISOString().slice(0, 10),
      ]);
      if (!keepWriting) {
        return;
      }
    }
    if (batch.length < 500) {
      break;
    }
    offset += batch.length;
  }
  response.end();
});

reportRouter.get("/salaries/export", async (request, response) => {
  const query = parseQuery(salaryOverviewQuerySchema, request);
  response.type("text/csv; charset=utf-8");
  response.attachment("salaries.csv");
  if (!await writeCsvRow(response, ["employeeId", "employeeName", "email", "department", "designation", "country", "amount", "currency", "effectiveFrom", "effectiveTo", "lastUpdatedAt"])) {
    return;
  }

  let page = 1;
  while (true) {
    const result = await salaryOverview({ ...query, page, limit: 100 });
    for (const row of result.data) {
      const keepWriting = await writeCsvRow(response, [
        row.employeeId,
        row.employeeName,
        row.email,
        row.department,
        row.designation,
        row.country,
        row.salary?.amount ?? "",
        row.salary?.currency ?? "",
        row.salary?.effectiveFrom ?? "",
        row.salary?.effectiveTo ?? "",
        row.lastUpdatedAt?.toISOString() ?? "",
      ]);
      if (!keepWriting) {
        return;
      }
    }
    if (page * 100 >= result.pagination.total) {
      break;
    }
    page += 1;
  }
  response.end();
});
