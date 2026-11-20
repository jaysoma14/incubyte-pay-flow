import { Router } from "express";
import { prisma } from "../../lib/prisma";

export const departmentRouter = Router();

departmentRouter.get("/", async (_request, response) => {
  const data = await prisma.department.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      _count: { select: { employees: true } },
    },
  });
  response.json({
    data: data.map(({ _count, ...department }) => ({
      ...department,
      employeeCount: _count.employees,
    })),
  });
});
