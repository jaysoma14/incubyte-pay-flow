# PayFlow – Frontend Design

## 1. Overview

The PayFlow frontend is built using React, TypeScript, and Vite.

The UI uses Material UI, AG Grid for large data tables, Redux Toolkit and RTK Query for state management and API integration, and Formik with Yup for form handling and validation.

The application is organized by feature to keep the codebase maintainable and scalable.

## 2. Technology Stack

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
- Vitest
- React Testing Library

## 3. Project Structure

```text
src/
├── app/
│   ├── store.ts
│   ├── hooks.ts
│   └── router.tsx
│
├── components/
│   ├── layout/
│   ├── common/
│   └── feedback/
│
├── features/
│   ├── auth/
│   │   ├── pages/
│   │   ├── components/
│   │   └── authApi.ts
│   │
│   ├── dashboard/
│   │   ├── pages/
│   │   ├── components/
│   │   └── dashboardApi.ts
│   │
│   ├── employees/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── employeeApi.ts
│   │   └── employeeSchemas.ts
│   │
│   ├── salaries/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── salaryApi.ts
│   │   └── salarySchemas.ts
│   │
│   ├── reports/
│   │   ├── pages/
│   │   └── reportsApi.ts
│   │
│   └── audit-logs/
│       ├── pages/
│       └── auditApi.ts
│
├── hooks/
├── utils/
├── types/
└── main.tsx
```

## 4. Application Layout

The authenticated application uses:
- Sidebar navigation.
- Top navigation bar.
- Main content area.
- Consistent page headers.
- Loading, empty, and error states.

Navigation:
- Dashboard
- Employees
- Salary Management
- Reports
- Audit Logs
- Logout

## 5. Routing

Suggested routes:

```text
/login
/dashboard
/employees
/employees/new
/employees/:id
/employees/:id/edit
/employees/:id/salary-history
/salaries
/salaries/:id/revise
/reports
/audit-logs
```

Authenticated routes must be protected.

The backend remains the source of truth for authorization; frontend route protection is only a user-experience layer.

## 6. State Management and API Integration

Use Redux Toolkit for application state and RTK Query for server data.

Responsibilities:
- Central API configuration.
- Authentication API.
- Employee API.
- Salary API.
- Dashboard API.
- Reports API.
- Audit log API.

Configure RTK Query to:
- Cache API responses.
- Handle loading and error states.
- Invalidate relevant cache tags after mutations.
- Refetch salary overview and history after salary revisions.

For cookie-based authentication, configure API requests to include credentials and configure the backend CORS policy accordingly.

## 7. Employee Management

Employee listing should use AG Grid or an equivalent data-grid component.

Features:
- Server-side pagination.
- Search.
- Department, country, and designation filters.
- Sorting.
- Create and edit employee forms.
- Employee detail view.

Employee forms use Formik and Yup.

## 8. Salary Management Page

### Purpose

Provide a centralized view where the HR Manager can review the current applicable salary of every employee.

The primary table must display one row per employee, not one row per salary revision.

### Table Columns

| Column | Description |
|---|---|
| Employee ID | Unique employee identifier |
| Employee Name | Employee's full name |
| Department | Employee department |
| Designation | Employee designation |
| Country | Employee country |
| Salary Amount | Current applicable salary |
| Currency | Salary currency |
| Effective From | Start date of applicable salary |
| Last Updated | Last salary modification timestamp |
| Actions | View history / Revise salary |

### Table Features

- Search by employee ID, employee name, and email.
- Filter by country.
- Filter by department.
- Filter by designation.
- Filter by currency.
- Filter by salary range.
- Sort by employee name, salary amount, and effective date.
- Server-side pagination.
- CSV export using the current filters.
- Clear filters.
- Loading, error, and empty states.

Use AG Grid with server-side data fetching. Do not fetch all 10,000 records and filter them in the browser.

### Date Selection

The page should support a selected effective date, defaulting to today.

For that date, display the salary record whose effective period includes the selected date.

If no salary applies to an employee on that date, show an appropriate empty value rather than selecting an unrelated salary record.

### API Integration

Use:

```http
GET /api/salaries
```

Example:

```http
GET /api/salaries?page=1&limit=25&search=john&country=India&department=Engineering&currency=INR&sortBy=amount&sortOrder=desc&asOf=2026-11-20
```

The backend handles filtering, sorting, and pagination.

## 9. Salary Revision Form

The salary revision form should use Formik and Yup.

Fields:
- Salary Amount
- Currency
- Effective From
- Reason for Change

Validation:
- Salary amount must be a valid positive number.
- Currency is required.
- Effective date is required.
- Reason is required if specified by the product validation rules.
- Display backend validation errors clearly.

On successful submission:
- Show a success notification.
- Refresh salary overview data.
- Refresh the employee's salary history.
- Refresh relevant dashboard data.

## 10. Salary History

Provide a dedicated history view for an employee.

Display:
- Previous salary.
- New salary.
- Currency.
- Effective date.
- Reason.
- Changed by.
- Change timestamp.

This view is separate from the centralized current-salary overview.

## 11. Dashboard

Display:
- Employee count.
- Payroll totals grouped by currency.
- Average salary grouped by currency.
- Minimum and maximum salary grouped by currency.
- Department distribution.
- Country distribution.
- Salary distribution by department.

Use Recharts for visualizations.

Do not combine salary values from different currencies into a single total without conversion.

## 12. Reports and Export

- Provide report filters.
- Export employee and salary data as CSV.
- Use backend export APIs.
- Ensure exported data respects active filters.
- Handle large exports without loading the complete dataset into frontend memory.

## 13. UX Requirements

- Responsive layout.
- Consistent typography and spacing.
- Confirmation before important destructive actions.
- Clear success and error notifications.
- Accessible form labels and validation messages.
- Loading indicators for API requests.
- Empty states with useful guidance.

## 14. Frontend Testing

Use Vitest and React Testing Library.

Test:
- Authentication flows.
- Protected routes.
- Employee forms.
- Salary revision form validation.
- Salary table rendering.
- Search and filter behavior.
- Pagination and sorting requests.
- Salary history display.
- API loading and error states.