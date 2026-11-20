# PayFlow – Requirements Document

## 1. Overview

PayFlow is a web-based Employee Salary Management System designed to help the HR team manage salary information for approximately 10,000 employees across multiple countries.

Currently, salary information is maintained in spreadsheets. PayFlow will centralize employee and salary data and provide an interface for managing salaries, reviewing salary information, tracking changes, and understanding the organization's compensation structure.

## 2. Goals

- Centralize employee and salary information.
- Allow HR Managers to review all employees' current salaries in one table.
- Create and manage salary revisions.
- Maintain salary history and salary-change audit records.
- Provide dashboards and salary analytics.
- Support searching, filtering, sorting, and exporting salary data.
- Handle at least 10,000 employee records efficiently.

## 3. User Roles

### HR Manager

The initial version supports one role: `HR_MANAGER`.

The HR Manager can:
- Log in and log out.
- View the dashboard and salary insights.
- Create, update, search, and view employees.
- Review all employees' current salaries.
- Filter, sort, and export salary data.
- Create salary revisions.
- View salary history and audit records.

Additional roles and permissions are outside the initial scope.

## 4. Functional Requirements

### 4.1 Authentication

- Provide a login page for HR Managers.
- Authenticate users using email and password.
- Use secure HTTP-only cookies for JWT authentication.
- Protect application routes and backend APIs.
- Provide logout functionality.
- Hash passwords using bcrypt.

### 4.2 Dashboard and Salary Insights

Display relevant organizational salary metrics, including:
- Total number of employees.
- Total payroll.
- Average salary.
- Minimum and maximum salary.
- Employee distribution by department.
- Employee distribution by country.
- Salary distribution by department and designation.

**Currency handling:** Salary amounts in different currencies must not be added together or compared as if they share a common currency. Display currency-specific totals and averages. Automatic currency conversion is outside the initial scope.

### 4.3 Employee Management

HR Managers can:
- Create employees.
- View employee details.
- Update employee information.
- Search employees by name, email, or employee ID.
- Filter by department, designation, and country.
- Sort and paginate employee records.

Employee information includes:
- Employee ID
- First name and last name
- Email
- Department
- Designation
- Country
- Employment status
- Joining date

### 4.4 Centralized Salary Management

Provide a dedicated Salary Management page where the HR Manager can review salaries for all employees in one place.

The primary view must show **one row per employee**, displaying the salary applicable on the selected date (today by default).

Suggested columns:
- Employee ID
- Employee Name
- Department
- Designation
- Country
- Salary Amount
- Currency
- Effective From
- Last Updated
- Actions

Actions:
- View salary history.
- Revise salary.

Features:
- Search by employee ID, name, or email.
- Filter by country, department, designation, and currency.
- Filter by salary range.
- Sort by employee name, salary amount, and effective date.
- Server-side pagination.
- Export filtered salary data as CSV.
- Allow the HR Manager to view employees who do not have a salary effective on the selected date, with their salary displayed as unavailable.

The table must use server-side filtering, sorting, and pagination rather than loading all employee records into the browser.

### 4.5 Salary Management and Revisions

HR Managers can:
- Assign an initial salary to an employee.
- Create a salary revision.
- Specify salary amount, currency, effective date, and reason.
- View salary records for an employee.
- View previous and updated salary information.

Salary rules:
- Salary records must retain their historical information.
- Existing salary records must not be overwritten when a revision is created.
- Salary amounts must be stored using precise decimal values.
- Salary periods for the same employee must not overlap.
- The current salary is determined by its effective date, not by its creation date.
- A salary is applicable when its effective period includes the selected date.

### 4.6 Salary History and Audit Logs

Provide a salary history view for each employee.

Display:
- Previous salary amount and currency.
- New salary amount and currency.
- Effective date.
- Change reason.
- Changed by.
- Change timestamp.

Every salary change must create an immutable audit record.

The salary update and its audit record must be saved within the same database transaction.

The authenticated manager's identity must be obtained from the verified server-side authentication context, not from client-submitted data.

### 4.7 Reports and CSV Export

- Export employee and salary data as CSV.
- Respect active search and filter criteria.
- Provide salary summaries grouped by currency, department, and country.
- Ensure reports do not combine currencies without an explicit conversion mechanism.

## 5. Non-Functional Requirements

### Performance
- Support approximately 10,000 employee records.
- Use server-side pagination, sorting, and filtering.
- Add appropriate database indexes.
- Avoid fetching unnecessary data.
- Keep API response times reasonable for normal usage.

### Security
- Secure authentication using JWT and HTTP-only cookies.
- Hash passwords using bcrypt.
- Validate incoming API requests.
- Protect restricted endpoints.
- Prevent unauthorized salary modifications.
- Store audit records for salary changes.

### Data Integrity
- Use PostgreSQL transactions for salary changes.
- Preserve salary history.
- Prevent overlapping salary periods.
- Use precise decimal storage for monetary values.

## 6. Technology Stack

### Frontend
- React.js
- TypeScript
- Vite
- Material UI
- AG Grid
- Redux Toolkit
- RTK Query
- React Router
- Formik
- Yup
- Recharts

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod
- JWT
- bcrypt

### Testing and Documentation
- Vitest
- React Testing Library
- Supertest
- Swagger / OpenAPI

## 7. Out of Scope

- Payroll disbursement.
- Tax and statutory compliance.
- Bank and payment integrations.
- External HRMS integrations.
- Automatic foreign exchange conversion.
- Complex salary approval workflows.
- Employee self-service portal.
- Password reset and email verification.

## 8. Success Criteria

- HR Managers can securely access the application.
- Employee information can be managed centrally.
- All employees' current applicable salaries can be reviewed in one table.
- Salary revisions preserve historical information.
- Salary changes are recorded in audit logs.
- Salary insights are available without incorrectly combining currencies.
- Search, filtering, sorting, pagination, and CSV export work correctly with 10,000 employees.