# PayFlow – Backend Design

## 1. Overview

The backend is built using Node.js, Express.js, and TypeScript.

It exposes REST APIs for authentication, employee management, salary management, salary history, audit logs, dashboard analytics, and reports.

Prisma ORM is used to access PostgreSQL. Zod is used for runtime request validation.

## 2. Technology Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- Zod
- JWT
- bcrypt
- Swagger / OpenAPI
- Supertest

## 3. Project Structure

```text
src/
├── config/
├── middleware/
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validate.middleware.ts
│
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── auth.schema.ts
│   │
│   ├── employees/
│   │   ├── employee.controller.ts
│   │   ├── employee.service.ts
│   │   ├── employee.routes.ts
│   │   └── employee.schema.ts
│   │
│   ├── salaries/
│   │   ├── salary.controller.ts
│   │   ├── salary.service.ts
│   │   ├── salary.routes.ts
│   │   └── salary.schema.ts
│   │
│   ├── audit-logs/
│   ├── dashboard/
│   └── reports/
│
├── utils/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── app.ts
└── server.ts
```

## 4. API Design

Base URL:

```text
/api
```

### 4.1 Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | HR Manager login |
| POST | `/auth/refresh` | Rotate refresh token and issue a new access token |
| POST | `/auth/logout` | Logout |
| GET | `/auth/me` | Current authenticated user |

### 4.2 Employees

| Method | Endpoint | Description |
|---|---|---|
| GET | `/departments` | List departments for employee forms |
| GET | `/employees` | List employees |
| GET | `/employees/:id` | Employee details |
| POST | `/employees` | Create employee |
| PUT | `/employees/:id` | Update employee |

Employee listing supports:
- Search.
- Department filter.
- Country filter.
- Designation filter.
- Sorting.
- Pagination.

### 4.3 Salary Management

| Method | Endpoint | Description |
|---|---|---|
| GET | `/salaries` | Centralized current salary overview |
| POST | `/employees/:id/salaries` | Create salary record or revision |
| GET | `/employees/:id/salaries` | Employee salary history |
| GET | `/salaries/:id` | Salary record details |

The centralized salary endpoint returns one row per employee with the salary applicable on the requested date.

### 4.4 Salary Overview API

Example request:

```http
GET /api/salaries?page=1&limit=25&search=john&country=India&department=Engineering&currency=INR&sortBy=amount&sortOrder=desc&asOf=2026-11-20
```

Supported query parameters:

| Parameter | Description |
|---|---|
| page | Page number |
| limit | Records per page |
| search | Employee name, email, or employee ID |
| country | Country filter |
| department | Department filter |
| designation | Designation filter |
| currency | Salary currency filter |
| minAmount | Minimum salary |
| maxAmount | Maximum salary |
| sortBy | Supported sortable field |
| sortOrder | `asc` or `desc` |
| asOf | Date for which applicable salary is requested |

The API must validate pagination limits and allowed sort fields. Never use arbitrary client-provided SQL field names.

Example response:

```json
{
  "data": [
    {
      "employeeRecordId": "employee-database-id",
      "employeeId": "EMP-1001",
      "employeeName": "John Smith",
      "email": "john@example.com",
      "department": "Engineering",
      "designation": "Senior Developer",
      "country": "India",
      "salary": {
        "id": "salary-record-id",
        "amount": "85000.00",
        "currency": "INR",
        "effectiveFrom": "2026-01-01",
        "effectiveTo": null
      },
      "lastUpdatedAt": "2026-01-01T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 10000,
    "totalPages": 400
  }
}
```

For employees without an applicable salary, `salary` and `lastUpdatedAt` may be `null`.
`employeeRecordId` is the employee's database ID for employee-specific routes; `employeeId` remains the human-readable employee code.

The total count represents employees matching the employee-level filters, including employees without an applicable salary. Salary-specific filters should return only employees whose applicable salary satisfies those filters.

### 4.5 Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard/summary` | Dashboard metrics |
| GET | `/dashboard/department-distribution` | Department metrics |
| GET | `/dashboard/country-distribution` | Country metrics |
| GET | `/dashboard/salary-distribution` | Salary analytics |

Metrics must be grouped by currency wherever monetary values are involved.

### 4.6 Reports and Export

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/salaries/export` | Export filtered salary data |
| GET | `/reports/employees/export` | Export employee data |

Exports must apply the same validated filters as the corresponding listing APIs. Use streaming or another memory-conscious approach for large CSV exports.

### 4.7 Audit Logs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/audit-logs` | List salary audit records |
| GET | `/employees/:id/audit-logs` | Employee salary audit history |

Audit endpoints are read-only through the application.

## 5. Database Design

### User

- id
- email
- passwordHash
- role
- createdAt
- updatedAt

### Employee

- id
- employeeCode
- firstName
- lastName
- email
- departmentId
- designation
- country
- employmentStatus
- joiningDate
- createdAt
- updatedAt

### Department

- id
- name
- createdAt
- updatedAt

Each employee belongs to one department. Department names are unique and seeded as standalone records.

### Salary

- id
- employeeId
- amount (Decimal)
- currency
- effectiveFrom
- effectiveTo (nullable)
- createdAt
- updatedAt

### SalaryAuditLog

- id
- salaryId
- employeeId
- changedBy
- previousAmount
- previousCurrency
- newAmount
- newCurrency
- effectiveFrom
- reason
- createdAt

The audit record should preserve enough information to explain the salary change independently of subsequent salary updates.

## 6. Salary Business Rules

### Current Salary Calculation

A salary is applicable on a date when:

```text
effectiveFrom <= selectedDate
AND
(effectiveTo IS NULL OR effectiveTo >= selectedDate)
```

The backend must select the applicable salary record based on effective dates.

Do not use `createdAt`, record ID, or latest insertion order as a substitute for effective-date logic.

The salary overview query must:
- Start from employees.
- Find the salary record applicable on the requested date.
- Return one row per employee.
- Return a null salary when no salary applies.
- Apply salary-specific filters to the applicable salary.
- Apply pagination and sorting on the backend.

### Salary Revisions

- Preserve existing salary records.
- Create a new salary record for each revision.
- Validate positive salary amounts.
- Validate supported currency codes.
- Prevent overlapping salary periods for an employee.
- Validate effective dates.
- Keep historical salary information available.

### Transactional Updates and Audit Logs

Salary changes must create the salary record and corresponding audit record in the same database transaction.

The authenticated user's ID must be taken from the verified authentication context.

Never trust a client-provided `changedBy` value.

Use appropriate transaction isolation, locking, or PostgreSQL database constraints to protect against concurrent overlapping salary revisions. A normal transaction alone does not guarantee prevention of every concurrent overlap race.

Audit records must not be updated or deleted through normal application endpoints.

## 7. Prisma and PostgreSQL

PostgreSQL is selected because the application requires:
- Relational integrity.
- Transactions.
- Reliable concurrent writes.
- Precise monetary storage.
- Indexing and efficient filtering.
- Production-ready database capabilities.

Use Prisma Decimal for salary amounts and PostgreSQL `Decimal` / `NUMERIC` storage.

Avoid JavaScript floating-point arithmetic for financial calculations.

Suggested indexes:
- Employee employeeCode.
- Employee email.
- Employee department.
- Employee country.
- Salary employeeId.
- Salary effectiveFrom and effectiveTo.
- Salary currency.
- SalaryAuditLog employeeId.
- SalaryAuditLog createdAt.

Review query plans and add composite indexes based on actual query patterns.

## 8. Validation

Use Zod for:
- Login requests.
- Employee creation and update.
- Salary creation and revision.
- Salary listing filters.
- Pagination and sorting.
- Report filters.

Validate and normalize query parameters before passing them to Prisma.

## 9. Authentication and Security

- Hash passwords with bcrypt.
- Issue JWTs after successful authentication.
- Store JWTs in HTTP-only cookies.
- Configure Secure and SameSite cookie attributes appropriately.
- Restrict credentialed CORS and state-changing request origins to configured frontend origins.
- Protect routes with authentication middleware.
- Verify the user's role on protected endpoints.
- Issue short-lived access JWTs and rotate single-use opaque refresh tokens stored hashed in the database.
- Configure CORS for the frontend origin and credentials.
- Never expose password hashes.
- Avoid logging credentials or authentication tokens.

Clearing a cookie on logout does not invalidate a copied stateless JWT. Use a server-side session or token-revocation mechanism if immediate revocation is required.

## 10. Seed Data

Create a deterministic seed script for approximately 10,000 employees.

Requirements:
- Generate realistic synthetic employee data.
- Use multiple departments, designations, and countries.
- Generate salary records with different currencies.
- Include employees with salary history.
- Include employees without a current applicable salary for testing.
- Ensure generated salary periods do not overlap.
- Make seeding repeatable and safe for local development.
- Create an initial HR Manager account using environment-configured credentials.

Do not use real employee or personal information.

Run the seed script with `npm run db:seed` after applying migrations. Set
`SEED_HR_MANAGER_EMAIL` and `SEED_HR_MANAGER_PASSWORD` in the environment; the
password must be at least 12 characters and is stored as a bcrypt hash.

## 11. Error Handling

Use centralized error handling.

Return consistent error responses for:
- Validation errors.
- Authentication errors.
- Authorization errors.
- Missing records.
- Duplicate employee identifiers or email.
- Invalid salary revisions.
- Overlapping salary periods.
- Database errors.

## 12. API Documentation

Use Swagger / OpenAPI to document:
- Endpoints.
- Request parameters.
- Request bodies.
- Response structures.
- Authentication requirements.
- Error responses.

## 13. Backend Testing

Use Vitest and Supertest.

Test:
- Authentication.
- Employee CRUD.
- Salary overview filtering and pagination.
- Current salary selection by effective date.
- Employees without applicable salaries.
- Salary history.
- Salary revision validation.
- Overlapping salary-period prevention.
- Transactional audit-log creation.
- Dashboard currency-aware metrics.
- CSV export filters.

## 14. Running the API

From `backend/`, configure `DATABASE_URL`, `JWT_SECRET` (at least 32 characters),
`FRONTEND_URL`, and `PORT` in the environment. Apply database migrations, then
start the development server with `npm run dev`. Build and start the production
server with `npm run build` and `npm start`.

The interactive OpenAPI UI is available at `/api-docs`; the JSON document is
available at `/api-docs.json`. All `/api` endpoints except login and logout
require the `payflow_token` HTTP-only cookie returned by login. CORS allows the
comma-separated origins in `FRONTEND_URL` and credentials.

Login also sets a `payflow_refresh_token` HTTP-only cookie scoped to `/api/auth`.
Call `POST /api/auth/refresh` with cookies enabled to rotate the refresh token
and receive new access and refresh cookies. Refresh tokens expire after
`REFRESH_TOKEN_EXPIRES_DAYS` (30 days by default, maximum 365), are stored only
as SHA-256 hashes, and can be used once. Logout revokes the presented refresh
token and clears both cookies. Apply the refresh-token migration before starting
the updated API.

Employee create/update requests reference the department by `departmentId`.
Salary create requests provide a decimal string, ISO 4217 currency code,
`effectiveFrom` date, and change reason. Salary range filters accept decimal
strings and are compared using PostgreSQL numeric values.