import { Router } from "express";
import type { Request } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/errors";
import { parseQuery } from "../../middleware/validate";
import { paginatedQuerySchema } from "../salaries/salary.schema";

export const auditRouter = Router();
export const employeeAuditRouter = Router({ mergeParams: true });

async function listAuditLogs(
  employeeId: string | undefined,
  page: number,
  limit: number,
) {
  const where = employeeId ? { employeeId } : {};
  const [data, total] = await prisma.$transaction([
    prisma.salaryAuditLog.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      skip: (page - 1) * limit,
      take: limit,
      include: {
        employee: { select: { id: true, employeeCode: true, firstName: true, lastName: true } },
        salary: { select: { amount: true, currency: true, effectiveFrom: true, effectiveTo: true } },
        changedBy: { select: { id: true, email: true } },
      },
    }),
    prisma.salaryAuditLog.count({ where }),
  ]);
  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

auditRouter.get("/", async (request, response) => {
  const query = parseQuery(paginatedQuerySchema, request);
  response.json(await listAuditLogs(undefined, query.page, query.limit));
});

employeeAuditRouter.get("/", async (request, response) => {
  const employeeId = (request as Request<{ employeeId: string }>).params.employeeId;
  const employeeExists = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  });
  if (!employeeExists) {
    throw new HttpError(404, "Employee not found");
  }
  const query = parseQuery(paginatedQuerySchema, request);
  response.json(await listAuditLogs(employeeId, query.page, query.limit));
});
