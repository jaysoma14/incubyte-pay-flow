import "dotenv/config";
import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const employeeCount = 10_000;
const departments = [
  "Engineering",
  "Finance",
  "Human Resources",
  "Marketing",
  "Operations",
  "Product",
  "Sales",
  "Customer Support",
] as const;
const countries = [
  { name: "Australia", currency: "AUD" },
  { name: "Canada", currency: "CAD" },
  { name: "Germany", currency: "EUR" },
  { name: "India", currency: "INR" },
  { name: "Singapore", currency: "SGD" },
  { name: "United Arab Emirates", currency: "AED" },
  { name: "United Kingdom", currency: "GBP" },
  { name: "United States", currency: "USD" },
] as const;
const firstNames = [
  "Aarav",
  "Amara",
  "Ava",
  "Daniel",
  "Fatima",
  "Ibrahim",
  "Isabella",
  "Liam",
  "Maya",
  "Noah",
  "Oliver",
  "Priya",
  "Sofia",
  "Wei",
] as const;
const lastNames = [
  "Ahmed",
  "Brown",
  "Chen",
  "Garcia",
  "Gupta",
  "Johnson",
  "Khan",
  "Kim",
  "Miller",
  "Patel",
  "Singh",
  "Smith",
  "Taylor",
  "Wilson",
] as const;
const designations: Record<(typeof departments)[number], readonly string[]> = {
  Engineering: ["Software Engineer", "Senior Software Engineer", "Engineering Manager"],
  Finance: ["Financial Analyst", "Accountant", "Finance Manager"],
  "Human Resources": ["HR Specialist", "Recruiter", "HR Manager"],
  Marketing: ["Marketing Specialist", "Content Strategist", "Marketing Manager"],
  Operations: ["Operations Analyst", "Operations Specialist", "Operations Manager"],
  Product: ["Product Analyst", "Product Designer", "Product Manager"],
  Sales: ["Sales Representative", "Account Executive", "Sales Manager"],
  "Customer Support": ["Support Specialist", "Support Engineer", "Support Manager"],
};

function requiredEnvironmentVariable(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required to seed the database`);
  }
  return value;
}

const connectionString = requiredEnvironmentVariable("DATABASE_URL");
const managerEmail = requiredEnvironmentVariable("SEED_HR_MANAGER_EMAIL");
const managerPassword = requiredEnvironmentVariable("SEED_HR_MANAGER_PASSWORD");

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

function makeEmployees(departmentIds: Map<string, string>) {
  return Array.from({ length: employeeCount }, (_, offset) => {
    const index = offset + 1;
    const department = departments[offset % departments.length]!;
    const country = countries[(offset * 3) % countries.length]!;
    const firstName = firstNames[(offset * 7) % firstNames.length]!;
    const lastName = lastNames[(offset * 11) % lastNames.length]!;

    return {
      id: randomUUID(),
      employeeCode: `EMP-${1000 + index}`,
      firstName,
      lastName,
      email: `employee.${String(index).padStart(5, "0")}@payflow.test`,
      departmentId: departmentIds.get(department)!,
      designation:
        designations[department][Math.floor(offset / departments.length) % designations[department].length]!,
      country: country.name,
      employmentStatus: index % 97 === 0 ? ("TERMINATED" as const) : index % 53 === 0 ? ("INACTIVE" as const) : ("ACTIVE" as const),
      joiningDate: new Date(Date.UTC(2018 + (offset % 8), offset % 12, (offset % 27) + 1)),
    };
  });
}

function makeSalaries(changedById: string, employeeIds: Map<number, string>) {
  const salaries: Array<{
    key: string;
    data: {
      id: string;
      employeeId: string;
      amount: string;
      currency: string;
      effectiveFrom: Date;
      effectiveTo: Date | null;
      createdAt: Date;
      updatedAt: Date;
    };
  }> = [];
  const auditLogs: Array<{
    salaryKey: string;
    data: {
      id: string;
      employeeId: string;
      changedById: string;
      previousAmount: string | null;
      previousCurrency: string | null;
      newAmount: string;
      newCurrency: string;
      effectiveFrom: Date;
      reason: string;
      createdAt: Date;
    };
  }> = [];

  for (let index = 1; index <= employeeCount; index += 1) {
    if (index % 20 === 0) {
      continue;
    }

    const employeeId = employeeIds.get(index);
    if (!employeeId) {
      throw new Error(`Seed employee ${index} was not found after insertion`);
    }
    const currency = countries[((index - 1) * 3) % countries.length]!.currency;
    const amount = String(45_000 + ((index * 7919) % 105_000));
    const oldAmount = String(Math.max(30_000, Number(amount) - 8_000));
    const historicalOnly = index % 20 === 1;
    const hasRevision = !historicalOnly && index % 5 === 0;
    const oldEffectiveFrom = new Date(Date.UTC(2023, 0, 1));
    const oldEffectiveTo = new Date(Date.UTC(historicalOnly ? 2025 : 2024, 11, 31));
    const oldCreatedAt = new Date(Date.UTC(2023, 0, 1));

    if (historicalOnly || hasRevision) {
      const salaryKey = `${employeeId}:${oldEffectiveFrom.toISOString().slice(0, 10)}`;
      salaries.push({
        key: salaryKey,
        data: {
          id: randomUUID(),
          employeeId,
          amount: oldAmount,
          currency,
          effectiveFrom: oldEffectiveFrom,
          effectiveTo: oldEffectiveTo,
          createdAt: oldCreatedAt,
          updatedAt: oldEffectiveTo,
        },
      });
      auditLogs.push({
        salaryKey,
        data: {
          id: randomUUID(),
          employeeId,
          changedById,
          previousAmount: null,
          previousCurrency: null,
          newAmount: oldAmount,
          newCurrency: currency,
          effectiveFrom: oldEffectiveFrom,
          reason: "Initial synthetic salary assignment",
          createdAt: oldCreatedAt,
        },
      });
    }

    if (!historicalOnly) {
      const effectiveFrom = hasRevision
        ? new Date(Date.UTC(2025, 0, 1))
        : new Date(Date.UTC(2024, 0, 1));
      const salaryKey = `${employeeId}:${effectiveFrom.toISOString().slice(0, 10)}`;
      salaries.push({
        key: salaryKey,
        data: {
          id: randomUUID(),
          employeeId,
          amount,
          currency,
          effectiveFrom,
          effectiveTo: null,
          createdAt: effectiveFrom,
          updatedAt: effectiveFrom,
        },
      });
      auditLogs.push({
        salaryKey,
        data: {
          id: randomUUID(),
          employeeId,
          changedById,
          previousAmount: hasRevision ? oldAmount : null,
          previousCurrency: hasRevision ? currency : null,
          newAmount: amount,
          newCurrency: currency,
          effectiveFrom,
          reason: hasRevision ? "Annual synthetic salary revision" : "Initial synthetic salary assignment",
          createdAt: effectiveFrom,
        },
      });
    }
  }

  return { salaries, auditLogs };
}

async function main() {
  const passwordHash = await bcrypt.hash(managerPassword, 12);

  await prisma.$transaction(async (transaction) => {
    const departmentIds = new Map<string, string>();
    for (const name of departments) {
      const department = await transaction.department.upsert({
        where: { name },
        create: { name, id: randomUUID() },
        update: {},
        select: { id: true },
      });
      departmentIds.set(name, department.id);
    }

    const manager = await transaction.user.upsert({
      where: { email: managerEmail },
      create: {
        id: randomUUID(),
        email: managerEmail,
        passwordHash,
        role: "HR_MANAGER",
      },
      update: { passwordHash, role: "HR_MANAGER" },
    });

    const employees = makeEmployees(departmentIds);
    for (let offset = 0; offset < employees.length; offset += 500) {
      await transaction.employee.createMany({
        data: employees.slice(offset, offset + 500),
        skipDuplicates: true,
      });
    }

    const employeeIds = new Map<number, string>();
    for (let offset = 0; offset < employees.length; offset += 500) {
      const employeeBatch = employees.slice(offset, offset + 500);
      const persistedEmployees = await transaction.employee.findMany({
        where: { employeeCode: { in: employeeBatch.map(({ employeeCode }) => employeeCode) } },
        select: { id: true, employeeCode: true },
      });
      for (const employee of persistedEmployees) {
        employeeIds.set(Number(employee.employeeCode.slice("EMP-".length)) - 1000, employee.id);
      }
    }

    const { salaries, auditLogs } = makeSalaries(manager.id, employeeIds);
    const employeeIdList = [...employeeIds.values()];
    const salaryIdsByKey = new Map<string, string>();
    for (let offset = 0; offset < employeeIdList.length; offset += 500) {
      const existingSalaries = await transaction.salary.findMany({
        where: { employeeId: { in: employeeIdList.slice(offset, offset + 500) } },
        select: { id: true, employeeId: true, effectiveFrom: true },
      });
      for (const salary of existingSalaries) {
        salaryIdsByKey.set(
          `${salary.employeeId}:${salary.effectiveFrom.toISOString().slice(0, 10)}`,
          salary.id,
        );
      }
    }

    const missingSalaries = salaries.filter(({ key }) => !salaryIdsByKey.has(key));
    for (let offset = 0; offset < missingSalaries.length; offset += 500) {
      await transaction.salary.createMany({
        data: missingSalaries.slice(offset, offset + 500).map(({ data }) => data),
        skipDuplicates: true,
      });
    }

    for (let offset = 0; offset < employeeIdList.length; offset += 500) {
      const persistedSalaries = await transaction.salary.findMany({
        where: { employeeId: { in: employeeIdList.slice(offset, offset + 500) } },
        select: { id: true, employeeId: true, effectiveFrom: true },
      });
      for (const salary of persistedSalaries) {
        salaryIdsByKey.set(
          `${salary.employeeId}:${salary.effectiveFrom.toISOString().slice(0, 10)}`,
          salary.id,
        );
      }
    }

    const auditRecords = auditLogs.map(({ salaryKey, data }) => {
      const salaryId = salaryIdsByKey.get(salaryKey);
      if (!salaryId) {
        throw new Error(`Seed salary ${salaryKey} was not found after insertion`);
      }
      return { ...data, salaryId };
    });
    const existingAuditSalaryIds = new Set<string>();
    for (let offset = 0; offset < auditRecords.length; offset += 500) {
      const existingAudits = await transaction.salaryAuditLog.findMany({
        where: { salaryId: { in: auditRecords.slice(offset, offset + 500).map(({ salaryId }) => salaryId) } },
        select: { salaryId: true },
      });
      for (const audit of existingAudits) {
        existingAuditSalaryIds.add(audit.salaryId);
      }
    }
    const missingAudits = auditRecords.filter(({ salaryId }) => !existingAuditSalaryIds.has(salaryId));
    for (let offset = 0; offset < missingAudits.length; offset += 500) {
      await transaction.salaryAuditLog.createMany({
        data: missingAudits.slice(offset, offset + 500),
        skipDuplicates: true,
      });
    }
  }, { maxWait: 10_000, timeout: 120_000 });

  console.info(
    `Seeded ${employeeCount} synthetic employees, ${departments.length} departments, and the HR Manager account.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error("Database seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });