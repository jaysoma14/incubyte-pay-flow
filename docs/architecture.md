# PayFlow – System Architecture

## 1. Architecture Overview

PayFlow follows a client-server architecture with a React frontend, Express backend, and PostgreSQL database.

The frontend communicates with the backend through REST APIs. The backend handles authentication, business logic, validation, database operations, and salary calculations.

Prisma ORM is used to interact with PostgreSQL.

## 2. High-Level Architecture

```text
                    HR Manager
                        |
                        v
              React + TypeScript
                 (Vite / MUI)
                        |
          Redux Toolkit + RTK Query
                        |
                 REST API Calls
                        |
                        v
             Node.js + Express API
                  (TypeScript)
                        |
             ---------------------
             |        |          |
             v        v          v
        Auth Layer  Services  Validation
        JWT Cookie  Business    Zod
                    Logic
             |        |
             ---------------------
                        |
                        v
                   Prisma ORM
                        |
                        v
                   PostgreSQL
```

## 3. Frontend Architecture

The frontend is organized by feature.

Main features:
- Authentication
- Dashboard
- Employees
- Salary Management
- Salary History
- Reports

Responsibilities:
- Render the user interface.
- Manage application navigation.
- Handle forms and client-side validation.
- Fetch and cache API data.
- Display tables, analytics, and reports.

Detailed implementation is documented in `frontend-design.md`.

## 4. Backend Architecture

The backend follows a modular, layered structure.

Main modules:
- Authentication
- Users
- Employees
- Salaries
- Salary Audit Logs
- Dashboard and Analytics
- Reports

Responsibilities:
- Authenticate and authorize users.
- Validate incoming requests.
- Apply business rules.
- Execute database operations.
- Maintain salary history and audit records.
- Provide paginated and filtered API responses.

Detailed implementation is documented in `backend-design.md`.

## 5. Database Architecture

PostgreSQL is the primary database.

Prisma ORM provides database access and schema management.

Core entities:

### User
Stores HR Manager authentication information.

### Employee
Stores employee profile and organizational information.

### Salary
Stores salary records and effective periods. Multiple salary records can belong to one employee to preserve salary history.

### SalaryAuditLog
Stores immutable records of salary changes, including previous and updated values, currency, reason, actor, and timestamp.

Relationships:

```text
User
  |
  | 1
  |
  | N (changed by)
SalaryAuditLog
  |
  | N
  |
  | 1
Salary
  |
  | N
  |
  | 1
Employee
```

The actual Prisma schema and relationship details are maintained in `backend-design.md`.

## 6. Salary Data Flow

### Current Salary Overview

1. HR Manager opens the Salary Management page.
2. Frontend requests `GET /api/salaries`.
3. Backend validates filters, sorting, pagination, and the requested effective date.
4. Backend retrieves employees and their salary records applicable on that date.
5. Backend returns one row per employee, including employees without an applicable salary.
6. Frontend displays the result in a paginated salary table.

The current salary must be determined using effective dates, not the most recently created salary record.

### Salary Revision

1. HR Manager submits a salary revision.
2. Frontend validates the form.
3. Backend authenticates the manager and validates the request.
4. Backend checks salary-period rules.
5. Backend creates the new salary record and audit record in a database transaction.
6. Backend returns the updated result.
7. Frontend refreshes the relevant salary data.

## 7. Authentication and Security

- JWT-based authentication.
- JWT stored in secure HTTP-only cookies.
- Passwords hashed with bcrypt.
- Protected frontend routes.
- Protected backend endpoints.
- Server-side role and permission checks.
- Request validation using Zod.
- Authenticated user identity derived from verified server context.

Logout must clear the authentication cookie. If immediate invalidation of previously issued JWTs is required, a server-side session or token-revocation mechanism must also be implemented.

## 8. Data Integrity

- PostgreSQL stores salary amounts using precise decimal types.
- Salary changes are handled transactionally.
- Salary history is retained.
- Salary periods must not overlap.
- Database-level protection should be considered for concurrent salary revisions, such as PostgreSQL range exclusion constraints.
- Audit records must not be editable through normal application APIs.

## 9. Performance and Scalability

- Server-side pagination for employee and salary tables.
- Database indexes for frequently filtered and sorted fields.
- RTK Query caching for API responses.
- Efficient aggregate queries for dashboard metrics.
- CSV exports generated on the backend.
- Avoid loading all 10,000 employees into the browser at once.

## 10. Deployment Overview

The application can be deployed as:
- Frontend: static hosting or a frontend hosting platform.
- Backend: Node.js hosting platform.
- Database: managed PostgreSQL.

Environment-specific configuration and secrets must be managed outside source control.

## 11. Architecture Decisions

| Decision | Choice | Reason |
|---|---|---|
| Frontend | React + TypeScript | Maintainable component-based UI |
| Backend | Express + TypeScript | Lightweight REST API |
| Database | PostgreSQL | Relational integrity and transactions |
| ORM | Prisma | Type-safe database access |
| State | Redux Toolkit + RTK Query | Shared state and API caching |
| Forms | Formik + Yup | Form handling and validation |
| API validation | Zod | Runtime request validation |
| Authentication | JWT HTTP-only cookies | Secure browser authentication |
| Tables | AG Grid | Large datasets and table features |
| Charts | Recharts | Dashboard visualizations |
