import { Router } from "express";
import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/errors";
import { parseBody, parseQuery } from "../../middleware/validate";
import {
  employeeCreateSchema,
  employeeListQuerySchema,
  employeeUpdateSchema,
} from "./employee.schema";
import {
  listEmployees,
} from "./employee.service";

export const employeeRouter = Router();

employeeRouter.get("/", async (request, response) => {
  const query = parseQuery(employeeListQuerySchema, request);
  response.json(await listEmployees(query));
});

employeeRouter.get("/:id", async (request, response) => {
  const employee = await prisma.employee.findUnique({
    where: { id: request.params.id },
    include: {
      department: { select: { id: true, name: true } },
      salaries: {
        orderBy: [{ effectiveFrom: "desc" }, { id: "asc" }],
        include: {
          auditLogs: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { changedBy: { select: { id: true, email: true } } },
          },
        },
      },
    },
  });
  if (!employee) {
    throw new HttpError(404, "Employee not found");
  }
  response.json({ data: employee });
});

employeeRouter.post("/", async (request, response) => {
  const input = parseBody(employeeCreateSchema, request);
  const department = await prisma.department.findUnique({
    where: { id: input.departmentId },
    select: { id: true },
  });
  if (!department) {
    throw new HttpError(400, "Department does not exist");
  }

  const employee = await prisma.employee.create({
    data: {
      ...input,
      joiningDate: new Date(`${input.joiningDate}T00:00:00.000Z`),
    },
    include: { department: { select: { id: true, name: true } } },
  });
  response.status(201).json({ data: employee });
});

employeeRouter.put("/:id", async (request, response) => {
  const input = parseBody(employeeUpdateSchema, request);
  const data: Prisma.EmployeeUpdateInput = {};
  if (input.employeeCode !== undefined) data.employeeCode = input.employeeCode;
  if (input.firstName !== undefined) data.firstName = input.firstName;
  if (input.lastName !== undefined) data.lastName = input.lastName;
  if (input.email !== undefined) data.email = input.email;
  if (input.designation !== undefined) data.designation = input.designation;
  if (input.country !== undefined) data.country = input.country;
  if (input.employmentStatus !== undefined) data.employmentStatus = input.employmentStatus;
  if (input.joiningDate !== undefined) {
    data.joiningDate = new Date(`${input.joiningDate}T00:00:00.000Z`);
  }
  if (input.departmentId !== undefined) {
    const department = await prisma.department.findUnique({
      where: { id: input.departmentId },
      select: { id: true },
    });
    if (!department) {
      throw new HttpError(400, "Department does not exist");
    }
    data.department = { connect: { id: input.departmentId } };
  }
  const employee = await prisma.employee.update({
    where: { id: request.params.id },
    data,
    include: { department: { select: { id: true, name: true } } },
  });
  response.json({ data: employee });
});
