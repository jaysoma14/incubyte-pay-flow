CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Department" ("id", "name", "updatedAt")
SELECT md5('department:' || "department"), "department", CURRENT_TIMESTAMP
FROM "Employee"
GROUP BY "department";

ALTER TABLE "Employee" ADD COLUMN "departmentId" TEXT;

UPDATE "Employee"
SET "departmentId" = "Department"."id"
FROM "Department"
WHERE "Employee"."department" = "Department"."name";

ALTER TABLE "Employee" ALTER COLUMN "departmentId" SET NOT NULL;
ALTER TABLE "Employee" DROP COLUMN "department";

CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");
CREATE INDEX "Employee_departmentId_idx" ON "Employee"("departmentId");

ALTER TABLE "Employee"
ADD CONSTRAINT "Employee_departmentId_fkey"
FOREIGN KEY ("departmentId") REFERENCES "Department"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
