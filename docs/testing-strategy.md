# PayFlow – Testing Strategy

## 1. Overview

PayFlow uses automated tests to validate frontend behavior, backend APIs, salary business rules, data integrity, and performance with 10,000 employee records.

Testing tools:
- Vitest
- React Testing Library
- Supertest
- PostgreSQL test database

## 2. Frontend Testing

### Authentication
- Login form validation.
- Successful login.
- Invalid credentials handling.
- Protected route behavior.
- Logout behavior.

### Employee Management
- Employee list rendering.
- Search behavior.
- Department and country filters.
- Sorting and pagination requests.
- Create and edit form validation.
- API error states.

### Salary Management Overview

Verify:
- Salary table displays one row per employee.
- Applicable salary is displayed for the selected date.
- Employees without an applicable salary show an empty salary value.
- Search sends the correct query parameters.
- Country, department, designation, currency, and salary filters work.
- Sorting sends supported sort fields and direction.
- Pagination requests the correct page and limit.
- Changing the effective date refreshes the salary overview.
- Loading, error, and empty states render correctly.
- CSV export uses active filters.

### Salary Revision
- Formik and Yup validation.
- Positive salary amount validation.
- Currency validation.
- Effective date validation.
- Backend validation errors are displayed.
- Successful revision refreshes relevant data.

### Salary History and Audit Logs
- History records display correctly.
- Previous and new salary values are shown.
- Effective dates and reasons are displayed.
- Changed-by information is displayed.
- Audit records are presented as read-only.

### Dashboard
- Summary metrics render.
- Currency-specific totals are displayed.
- Charts handle empty data.
- API loading and error states are handled.

## 3. Backend Unit Testing

Test individual service and utility functions.

### Authentication
- Password hashing.
- Password verification.
- Token generation.
- Authentication middleware.
- Role authorization.

### Salary Business Logic
- Select salary applicable on a given date.
- Handle salary effective-from dates.
- Handle salary effective-to dates.
- Handle employees without salary records.
- Reject invalid salary amounts.
- Reject invalid currencies.
- Reject overlapping salary periods.
- Preserve historical salary records.

### Currency and Decimal Handling
- Avoid floating-point calculations for monetary values.
- Keep currency-specific aggregations separate.
- Validate decimal values and serialization.

## 4. Backend API Integration Testing

Use Supertest with a dedicated PostgreSQL test database.

### Authentication APIs
- Successful login.
- Invalid login.
- Authenticated user lookup.
- Logout.
- Unauthorized access.

### Employee APIs
- Create employee.
- Retrieve employee.
- Update employee.
- Search employees.
- Filter employees.
- Sort and paginate employees.

### Salary Overview API

Test `GET /api/salaries`.

Scenarios:
- Returns one row per matching employee.
- Returns the salary applicable on the requested date.
- Does not select the latest-created salary when another record is applicable.
- Returns null salary for employees without an applicable salary.
- Supports employee search.
- Supports department, designation, country, and currency filters.
- Supports minimum and maximum salary filters.
- Supports allowed sorting fields.
- Supports pagination and correct total counts.
- Rejects invalid pagination and sort parameters.
- Correctly handles date boundaries.

### Salary Revision APIs
- Create initial salary.
- Create a salary revision.
- Retrieve salary history.
- Reject invalid salary values.
- Reject overlapping salary periods.
- Preserve existing salary records.
- Verify transaction rollback when audit creation fails.

### Audit Logs
- Salary changes create audit records.
- Audit records contain previous and new salary values.
- Actor identity comes from authenticated server context.
- Client-submitted actor IDs are ignored or rejected.
- Audit endpoints require authentication.
- Audit records cannot be edited or deleted through application APIs.

### Dashboard and Reports
- Dashboard metrics are calculated correctly.
- Currency-specific totals are correct.
- Department and country distributions are correct.
- CSV export respects filters.
- Exported records match the corresponding filtered dataset.

## 5. Database Integration Testing

Use PostgreSQL rather than an in-memory substitute for tests involving database-specific behavior.

Verify:
- Employee and salary relationships.
- Decimal storage and retrieval.
- Transaction rollback.
- Salary history preservation.
- Unique constraints.
- Foreign-key constraints.
- Salary-period overlap protection.
- Concurrent salary revision behavior.
- Audit-log immutability through application access.

If PostgreSQL exclusion constraints or custom SQL migrations are used, test those constraints against PostgreSQL directly.

## 6. Test Data

Use deterministic synthetic data.

Test datasets should include:
- Employees across multiple countries.
- Multiple departments and designations.
- Multiple currencies.
- Employees with one salary record.
- Employees with multiple salary revisions.
- Employees without an applicable current salary.
- Salary records with past, current, and future effective dates.

The full seed dataset should contain approximately 10,000 employees.

## 7. Performance Testing

Validate:
- Employee listing with 10,000 records.
- Salary overview with 10,000 employees.
- Server-side filtering and sorting.
- Pagination query performance.
- Dashboard aggregate query performance.
- CSV export for large datasets.

Check database query plans and add indexes where justified.

The frontend must not load the full employee or salary dataset for normal table navigation.

## 8. Manual QA Checklist

- HR Manager can log in and log out.
- Protected routes require authentication.
- Employee CRUD works.
- Salary Management displays all employees.
- Only the salary applicable on the selected date is displayed.
- Salary filters and search work together.
- Pagination and sorting work correctly.
- Salary revisions preserve previous records.
- Salary history is accurate.
- Audit logs record salary changes.
- Currency-specific analytics are correct.
- CSV exports respect filters.
- Application handles empty and error states.

## 9. Definition of Done

A feature is considered complete when:
- Business requirements are implemented.
- Input validation is in place.
- Relevant automated tests pass.
- Error states are handled.
- Authorization is enforced where required.
- Database integrity is maintained.
- API documentation is updated where applicable.
- The feature is manually verified in the application.