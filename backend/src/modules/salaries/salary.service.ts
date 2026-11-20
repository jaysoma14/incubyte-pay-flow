import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../lib/errors";
import type { z } from "zod";
import { salaryOverviewQuerySchema } from "./salary.schema";

export type SalaryOverviewQuery = z.output<typeof salaryOverviewQuerySchema>;

export interface SalaryOverviewRow {
  employeeId: string;
  employeeName: string;
  email: string;
  department: string;
  designation: string;
  country: string;
  salary: null | {
    id: string;
    amount: string;
    currency: string;
    effectiveFrom: Date;
    effectiveTo: Date | null;
  };
  lastUpdatedAt: Date | null;
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}

function buildSalaryFilters(query: SalaryOverviewQuery, asOf: string) {
  const filters: Prisma.Sql[] = [];
  if (query.search) {
    const terms = query.search.split(/\s+/).filter(Boolean);
    for (const term of terms) {
      const like = `%${escapeLike(term)}%`;
      filters.push(Prisma.sql`(
        e."employeeCode" ILIKE ${like} ESCAPE E'\\\\'
        OR e."firstName" ILIKE ${like} ESCAPE E'\\\\'
        OR e."lastName" ILIKE ${like} ESCAPE E'\\\\'
        OR (e."firstName" || ' ' || e."lastName") ILIKE ${like} ESCAPE E'\\\\'
        OR e."email" ILIKE ${like} ESCAPE E'\\\\'
      )`);
    }
  }
  if (query.country) {
    filters.push(Prisma.sql`e."country" ILIKE ${query.country}`);
  }
  if (query.department) {
    filters.push(Prisma.sql`d."name" ILIKE ${query.department}`);
  }
  if (query.designation) {
    filters.push(Prisma.sql`e."designation" ILIKE ${query.designation}`);
  }
  filters.push(Prisma.sql`(s."id" IS NULL OR s."effectiveFrom" <= ${asOf}::date)`);
  if (query.currency) {
    filters.push(Prisma.sql`s."currency" = ${query.currency}`);
  }
  if (query.minAmount) {
    filters.push(Prisma.sql`s."amount" >= ${query.minAmount}::numeric`);
  }
  if (query.maxAmount) {
    filters.push(Prisma.sql`s."amount" <= ${query.maxAmount}::numeric`);
  }
  if (query.currency || query.minAmount || query.maxAmount) {
    filters.push(Prisma.sql`s."id" IS NOT NULL`);
  }
  return filters.length > 0
    ? Prisma.sql`WHERE ${Prisma.join(filters, " AND ")}`
    : Prisma.empty;
}

function salaryOrder(query: SalaryOverviewQuery) {
  const direction = Prisma.raw(query.sortOrder.toUpperCase());
  switch (query.sortBy) {
    case "amount":
      return Prisma.sql`s."amount" ${direction} NULLS LAST, e."employeeCode" ASC`;
    case "effectiveFrom":
      return Prisma.sql`s."effectiveFrom" ${direction} NULLS LAST, e."employeeCode" ASC`;
    default:
      return Prisma.sql`e."lastName" ${direction}, e."firstName" ${direction}, e."employeeCode" ASC`;
  }
}

function applicableSalaryJoin(asOf: string) {
  return Prisma.sql`LEFT JOIN LATERAL (
    SELECT sal."id", sal."amount", sal."currency", sal."effectiveFrom", sal."effectiveTo", sal."updatedAt"
    FROM "Salary" sal
    WHERE sal."employeeId" = e."id"
      AND sal."effectiveFrom" <= ${asOf}::date
      AND (sal."effectiveTo" IS NULL OR sal."effectiveTo" >= ${asOf}::date)
    ORDER BY sal."effectiveFrom" DESC, sal."id" ASC
    LIMIT 1
  ) s ON TRUE`;
}

export async function salaryOverview(query: SalaryOverviewQuery) {
  const asOf = query.asOf ?? new Date().toISOString().slice(0, 10);
  const filters = buildSalaryFilters(query, asOf);
  const join = applicableSalaryJoin(asOf);
  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<SalaryOverviewRow[]>(Prisma.sql`
      SELECT
        e."employeeCode" AS "employeeId",
        e."firstName" || ' ' || e."lastName" AS "employeeName",
        e."email" AS "email",
        d."name" AS "department",
        e."designation" AS "designation",
        e."country" AS "country",
        CASE WHEN s."id" IS NULL THEN NULL ELSE jsonb_build_object(
          'id', s."id",
          'amount', s."amount"::text,
          'currency', s."currency",
          'effectiveFrom', s."effectiveFrom",
          'effectiveTo', s."effectiveTo"
        ) END AS "salary",
        s."updatedAt" AS "lastUpdatedAt"
      FROM "Employee" e
      JOIN "Department" d ON d."id" = e."departmentId"
      ${join}
      ${filters}
      ORDER BY ${salaryOrder(query)}
      LIMIT ${query.limit}
      OFFSET ${(query.page - 1) * query.limit}
    `),
    prisma.$queryRaw<Array<{ total: number }>>(Prisma.sql`
      SELECT COUNT(*)::int AS "total"
      FROM "Employee" e
      JOIN "Department" d ON d."id" = e."departmentId"
      ${join}
      ${filters}
    `),
  ]);
  return {
    data: rows,
    pagination: {
      page: query.page,
      limit: query.limit,
      total: countRows[0]?.total ?? 0,
      totalPages: Math.ceil((countRows[0]?.total ?? 0) / query.limit),
    },
  };
}

export function dayBefore(date: Date) {
  const previous = new Date(date);
  previous.setUTCDate(previous.getUTCDate() - 1);
  return previous;
}

export async function createSalaryRevision(input: {
  employeeId: string;
  changedById: string;
  amount: string;
  currency: string;
  effectiveFrom: string;
  reason: string;
}) {
  const start = new Date(`${input.effectiveFrom}T00:00:00.000Z`);
  return prisma.$transaction(async (transaction) => {
    await transaction.$queryRaw(Prisma.sql`
      SELECT 1 AS "locked"
      FROM pg_advisory_xact_lock(hashtextextended(${input.employeeId}, 0))
    `);

    const employee = await transaction.employee.findUnique({
      where: { id: input.employeeId },
      select: { id: true },
    });
    if (!employee) {
      return null;
    }

    const nextSalary = await transaction.salary.findFirst({
      where: { employeeId: input.employeeId, effectiveFrom: { gt: start } },
      orderBy: [{ effectiveFrom: "asc" }, { id: "asc" }],
      select: { effectiveFrom: true },
    });
    const previousSalaries = await transaction.salary.findMany({
      where: {
        employeeId: input.employeeId,
        effectiveFrom: { lte: start },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: start } }],
      },
      orderBy: [{ effectiveFrom: "desc" }, { id: "asc" }],
    });
    if (previousSalaries.length > 1) {
      throw new HttpError(409, "Overlapping salary periods already exist for this employee");
    }
    const previousSalary = previousSalaries[0];
    if (previousSalary?.effectiveFrom.getTime() === start.getTime()) {
      throw new HttpError(409, "A salary record already exists for this effective date");
    }

    const effectiveTo = nextSalary ? dayBefore(nextSalary.effectiveFrom) : null;
    if (effectiveTo && effectiveTo < start) {
      throw new HttpError(409, "A salary record already exists for this effective date");
    }

    if (previousSalary) {
      await transaction.salary.update({
        where: { id: previousSalary.id },
        data: { effectiveTo: dayBefore(start) },
      });
    }

    const salary = await transaction.salary.create({
      data: {
        employeeId: input.employeeId,
        amount: new Prisma.Decimal(input.amount),
        currency: input.currency,
        effectiveFrom: start,
        effectiveTo,
      },
    });
    const auditLog = await transaction.salaryAuditLog.create({
      data: {
        employeeId: input.employeeId,
        salaryId: salary.id,
        changedById: input.changedById,
        previousAmount: previousSalary?.amount ?? null,
        previousCurrency: previousSalary?.currency ?? null,
        newAmount: salary.amount,
        newCurrency: salary.currency,
        effectiveFrom: salary.effectiveFrom,
        reason: input.reason,
      },
      include: { changedBy: { select: { id: true, email: true } } },
    });
    return { salary, auditLog };
  }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted });
}
