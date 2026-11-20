import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import type { z } from "zod";
import { employeeListQuerySchema } from "./employee.schema";

export type EmployeeListQuery = z.output<typeof employeeListQuerySchema>;

export function employeeWhere(query: EmployeeListQuery): Prisma.EmployeeWhereInput {
  const where: Prisma.EmployeeWhereInput = {};
  if (query.department) {
    where.department = { is: { name: { equals: query.department, mode: "insensitive" } } };
  }
  if (query.departmentId) {
    where.departmentId = query.departmentId;
  }
  if (query.designation) {
    where.designation = { equals: query.designation, mode: "insensitive" };
  }
  if (query.country) {
    where.country = { equals: query.country, mode: "insensitive" };
  }
  if (query.employmentStatus) {
    where.employmentStatus = query.employmentStatus;
  }
  if (query.search) {
    const terms = query.search.split(/\s+/).filter(Boolean);
    where.AND = terms.map((term) => ({
      OR: [
        { firstName: { contains: term, mode: "insensitive" } },
        { lastName: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
        { employeeCode: { contains: term, mode: "insensitive" } },
      ],
    }));
  }
  return where;
}

export function employeeOrderBy(
  sortBy: EmployeeListQuery["sortBy"],
  sortOrder: EmployeeListQuery["sortOrder"],
): Prisma.EmployeeOrderByWithRelationInput {
  if (sortBy === "department") {
    return { department: { name: sortOrder } };
  }
  return { [sortBy]: sortOrder };
}

export async function listEmployees(query: EmployeeListQuery) {
  const where = employeeWhere(query);
  const [data, total] = await prisma.$transaction([
    prisma.employee.findMany({
      where,
      include: { department: { select: { id: true, name: true } } },
      orderBy: [employeeOrderBy(query.sortBy, query.sortOrder), { id: "asc" }],
      skip: (query.page - 1) * query.limit,
      take: query.limit,
    }),
    prisma.employee.count({ where }),
  ]);
  return {
    data,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  };
}
