import { Router } from "express";
import type { Request } from "express";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/errors";
import { parseBody, parseQuery } from "../../middleware/validate";
import { paginatedQuerySchema, salaryCreateSchema, salaryOverviewQuerySchema } from "./salary.schema";
import { createSalaryRevision, salaryOverview } from "./salary.service";

export const salaryRouter = Router();
export const employeeSalaryRouter = Router({ mergeParams: true });

salaryRouter.get("/", async (request, response) => {
  const query = parseQuery(salaryOverviewQuerySchema, request);
  response.json(await salaryOverview(query));
});

salaryRouter.get("/:id", async (request, response) => {
  const salary = await prisma.salary.findUnique({
    where: { id: request.params.id },
    include: {
      employee: { select: { employeeCode: true, firstName: true, lastName: true, email: true } },
      auditLogs: {
        orderBy: { createdAt: "desc" },
        include: { changedBy: { select: { id: true, email: true } } },
      },
    },
  });
  if (!salary) {
    throw new HttpError(404, "Salary record not found");
  }
  response.json({ data: salary });
});

employeeSalaryRouter.get("/", async (request, response) => {
  const pagination = parseQuery(paginatedQuerySchema, request);
  const employeeId = (request as Request<{ id: string }>).params.id;
  const where = { employeeId };
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { id: true },
  });
  if (!employee) {
    throw new HttpError(404, "Employee not found");
  }
  const [data, total] = await prisma.$transaction([
    prisma.salary.findMany({
      where,
      orderBy: [{ effectiveFrom: "desc" }, { id: "asc" }],
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      include: {
        auditLogs: {
          orderBy: { createdAt: "desc" },
          include: { changedBy: { select: { id: true, email: true } } },
        },
      },
    }),
    prisma.salary.count({ where }),
  ]);
  response.json({
    data,
    pagination: {
      ...pagination,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  });
});

employeeSalaryRouter.post("/", async (request, response) => {
  const input = parseBody(salaryCreateSchema, request);
  const result = await createSalaryRevision({
    ...input,
    employeeId: (request as Request<{ id: string }>).params.id,
    changedById: request.auth!.userId,
  });
  if (!result) {
    throw new HttpError(404, "Employee not found");
  }
  response.status(201).json({ data: result });
});
