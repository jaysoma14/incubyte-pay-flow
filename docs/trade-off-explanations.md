# PayFlow – Trade-off Explanations

## 1. Purpose

This document explains the key technical and architectural trade-offs made while designing and developing PayFlow.

The goal is not to choose the most complex technology or architecture, but to select solutions that meet the assessment requirements while keeping the application maintainable, reliable, secure, and practical to deliver.

Each decision considers:
- The selected approach.
- Alternatives considered.
- Why the selected approach was preferred.
- Limitations and compromises.
- Potential improvements for the future.

---

## 2. Frontend Technology Decisions

### 2.1 React with TypeScript

**Selected:** React + TypeScript + Vite

**Alternatives considered:**
- React with JavaScript.
- Next.js.
- Angular.

**Reasoning:**

React provides a flexible component-based architecture and a mature ecosystem. TypeScript improves maintainability through static type checking, particularly when working with employee records, salary information, API responses, and complex table data.

Vite provides a lightweight development environment with fast startup and build times.

**Trade-offs:**

Advantages:
- Strong typing and better developer experience.
- Reusable components.
- Large ecosystem.
- Fast development and build process.

Disadvantages:
- Type definitions require additional effort.
- React requires decisions about routing, data fetching, and application structure.
- Vite does not provide built-in server-side rendering.

**Future consideration:**

Next.js could be considered if server-side rendering, SEO, or more advanced server-side capabilities become important. These are not major requirements for the current authenticated HR application.

### 2.2 Material UI

**Selected:** Material UI

**Alternatives considered:**
- Tailwind CSS.
- Bootstrap.
- Ant Design.
- Custom CSS.

**Reasoning:**

PayFlow is an internal business application with forms, dashboards, filters, dialogs, and data tables. Material UI provides ready-to-use components and consistent design patterns.

**Trade-offs:**

Advantages:
- Faster UI development.
- Accessible components.
- Consistent design system.
- Good integration with React.

Disadvantages:
- Default styling can make applications look generic.
- Customization may require additional styling.
- Bundle size can increase if components are not imported carefully.

**Future consideration:**

A custom design system can be introduced if the application grows or requires a more distinctive visual identity.

### 2.3 AG Grid for Employee and Salary Tables

**Selected:** AG Grid

**Alternatives considered:**
- Material UI Data Grid.
- TanStack Table.
- Custom HTML tables.

**Reasoning:**

PayFlow needs to manage approximately 10,000 employee records and provide a centralized salary overview.

AG Grid offers sorting, filtering, pagination, column management, and server-side data integration.

The application will use backend-driven pagination, sorting, and filtering rather than loading all records into the browser.

**Trade-offs:**

Advantages:
- Rich data-grid functionality.
- Suitable for large datasets.
- Flexible column configuration.
- Supports server-side data operations.

Disadvantages:
- More configuration than a basic table.
- Larger bundle size than simpler alternatives.
- Some advanced features require a commercial AG Grid license.

**Future consideration:**

Evaluate the required AG Grid edition and licensing before using enterprise-only functionality. If advanced grid features are unnecessary, a simpler table solution could reduce complexity.

### 2.4 Redux Toolkit and RTK Query

**Selected:** Redux Toolkit + RTK Query

**Alternatives considered:**
- React Context API.
- TanStack Query.
- Zustand.
- Component-level state.

**Reasoning:**

The application has multiple features that share server data, including employees, salaries, authentication, and dashboard metrics.

Redux Toolkit provides predictable application state management, while RTK Query handles API requests, caching, loading states, and cache invalidation.

**Trade-offs:**

Advantages:
- Centralized API configuration.
- Consistent server-state management.
- Automatic caching and invalidation.
- Good integration with Redux.

Disadvantages:
- Additional setup and concepts.
- Redux may be unnecessary for a small application.
- Cache invalidation must be configured carefully.

**Future consideration:**

Keep local UI state inside components. Use Redux only for shared application state and RTK Query for server data rather than putting every value into the global store.

### 2.5 Formik and Yup

**Selected:** Formik + Yup

**Alternatives considered:**
- React Hook Form + Zod.
- Controlled components with custom validation.

**Reasoning:**

Formik provides structured form state management, while Yup provides schema-based validation.

This combination is suitable for employee forms, login forms, and salary revision forms.

**Trade-offs:**

Advantages:
- Clear form state management.
- Reusable validation schemas.
- Good integration with Material UI.
- Familiar and established ecosystem.

Disadvantages:
- Formik can cause additional rendering overhead in complex forms.
- Yup schemas need to be maintained separately from backend validation.
- Client-side validation does not replace server-side validation.

**Future consideration:**

React Hook Form could be considered if complex forms or rendering performance become a concern.

---

## 3. Backend Technology Decisions

### 3.1 Node.js, Express, and TypeScript

**Selected:** Node.js + Express + TypeScript

**Alternatives considered:**
- NestJS.
- Fastify.
- Java Spring Boot.
- Python FastAPI.

**Reasoning:**

Express is lightweight and provides sufficient flexibility for the REST APIs required by PayFlow.

TypeScript provides type safety across controllers, services, database operations, and API contracts.

**Trade-offs:**

Advantages:
- Simple and lightweight.
- Large ecosystem.
- Flexible middleware architecture.
- Shared TypeScript knowledge across frontend and backend.

Disadvantages:
- Requires defining architectural conventions.
- Does not enforce a module architecture by default.
- Validation, error handling, and dependency organization require deliberate implementation.

**Future consideration:**

NestJS could be considered if the backend grows significantly and needs stronger framework-level conventions, dependency injection, and modular organization.

### 3.2 Prisma ORM

**Selected:** Prisma ORM

**Alternatives considered:**
- TypeORM.
- Sequelize.
- Drizzle ORM.
- Raw SQL.

**Reasoning:**

Prisma provides type-safe database access, schema management, migrations, and a productive development workflow.

It is suitable for the relational data model involving users, employees, salary records, and audit logs.

**Trade-offs:**

Advantages:
- Type-safe database queries.
- Schema-driven development.
- Migration support.
- Convenient relationship handling.
- Good TypeScript integration.

Disadvantages:
- Generated client requires maintenance.
- Complex queries may need raw SQL.
- ORM abstractions can make query optimization less obvious.
- Prisma-specific configuration and migration workflows must be understood.

**Future consideration:**

Use parameterized raw SQL selectively for performance-critical or PostgreSQL-specific operations, such as advanced salary-period overlap protection.

### 3.3 Zod for Backend Validation

**Selected:** Zod

**Alternatives considered:**
- Joi.
- Yup.
- Express-validator.
- Manual validation.

**Reasoning:**

Zod provides runtime validation and TypeScript type inference.

It is useful for validating request bodies, query parameters, pagination, sorting, and salary revision inputs.

**Trade-offs:**

Advantages:
- Runtime validation.
- Type inference.
- Reusable schemas.
- Clear validation errors.

Disadvantages:
- Validation schemas require maintenance.
- Frontend Formik/Yup schemas and backend Zod schemas may duplicate some rules.

**Future consideration:**

Keep backend validation authoritative. Shared API contracts or generated types can reduce duplication if the project expands.

---

## 4. Database Decisions

### 4.1 PostgreSQL Instead of SQLite

**Selected:** PostgreSQL

**Alternatives considered:**
- SQLite.
- MySQL.
- MongoDB.

**Reasoning:**

PayFlow manages relational employee and salary data, historical salary records, and audit logs.

PostgreSQL provides transactions, relational integrity, indexing, precise decimal types, and advanced database constraints.

These capabilities are important for salary-related operations.

**Trade-offs:**

Advantages:
- Strong relational data integrity.
- Transaction support.
- NUMERIC/DECIMAL monetary storage.
- Advanced indexing.
- Suitable for concurrent database operations.

Disadvantages:
- Requires a database server.
- More setup than SQLite.
- Deployment and database maintenance require additional configuration.

**Future consideration:**

Use managed PostgreSQL in production to reduce operational overhead.

### 4.2 Relational Database Instead of MongoDB

**Selected:** Relational data model using PostgreSQL.

**Reasoning:**

Employees, salary records, users, and audit logs have clear relationships.

Salary records depend on employees, and audit logs reference salary changes and authenticated users.

A relational database makes these relationships and integrity constraints explicit.

**Trade-offs:**

Advantages:
- Foreign-key constraints.
- Structured data.
- Transactional operations.
- Reliable joins and aggregations.

Disadvantages:
- Schema changes require migrations.
- Less flexibility for frequently changing document structures.

**Future consideration:**

A document database is unnecessary for the current requirements. PostgreSQL remains sufficient for structured employee and salary information.

### 4.3 Decimal Instead of Floating-Point Salary Values

**Selected:** PostgreSQL NUMERIC/DECIMAL and Prisma Decimal.

**Alternatives considered:**
- JavaScript `number`.
- PostgreSQL floating-point types.

**Reasoning:**

Salary information represents financial values. Floating-point arithmetic can introduce precision errors.

Decimal storage and calculations provide more predictable financial results.

**Trade-offs:**

Advantages:
- Accurate decimal representation.
- Better financial data integrity.
- Suitable for salary calculations and reporting.

Disadvantages:
- Requires explicit serialization when returning API responses.
- Decimal values require careful handling in TypeScript.
- Some arithmetic operations are less convenient than normal JavaScript numbers.

**Future consideration:**

Keep monetary calculations in decimal-safe operations and serialize monetary values as strings in API responses.

---

## 5. Salary Management Design Decisions

### 5.1 Centralized Salary Overview Instead of Employee-by-Employee Review

**Selected:** Dedicated Salary Management page with one row per employee.

**Alternatives considered:**
- Viewing salary information only inside employee details.
- Showing every salary revision in one large table.
- Separate salary records without a centralized overview.

**Reasoning:**

The HR Manager needs to review salary information across the entire organization.

A centralized table makes it easier to compare employees, search for salary information, apply filters, and export reports.

The main table displays the salary applicable on a selected date, with today as the default.

Individual salary history remains available separately.

**Trade-offs:**

Advantages:
- Easier organization-wide salary review.
- Centralized filtering and searching.
- Better reporting and CSV export.
- Clear separation between current salary and historical revisions.

Disadvantages:
- More complex database query.
- Requires careful effective-date handling.
- Salary-specific filters need to operate on the applicable salary record.

**Future consideration:**

Add saved filters, department-level salary comparisons, and configurable table columns if HR usage requires them.

### 5.2 Salary History Instead of Overwriting Salary Records

**Selected:** Maintain separate salary records for each revision.

**Alternatives considered:**
- Update the existing salary amount.
- Store only the latest salary.
- Maintain a separate history table without effective dates.

**Reasoning:**

Salary history is important for auditing and understanding how employee compensation changes over time.

Overwriting salary records would remove important historical information.

Each revision therefore creates a new salary record with an effective date.

**Trade-offs:**

Advantages:
- Complete salary history.
- Historical salary reporting.
- Easier audit tracking.
- Supports future-dated salary changes.

Disadvantages:
- More complex queries.
- Requires effective-date validation.
- Historical data must be handled carefully.

**Future consideration:**

Support salary revision scheduling and historical reporting over arbitrary date ranges if required.

### 5.3 Effective-Date-Based Current Salary

**Selected:** Determine the applicable salary using `effectiveFrom` and `effectiveTo`.

**Alternatives considered:**
- Use the most recently created salary record.
- Use the highest salary record ID.
- Store a separate current salary field on the employee.

**Reasoning:**

The most recently created record is not necessarily the salary currently applicable.

For example, a salary revision may be created today but become effective next month.

The salary applicable on a selected date must satisfy:

`effectiveFrom <= selectedDate`

and

`effectiveTo IS NULL OR effectiveTo >= selectedDate`

**Trade-offs:**

Advantages:
- Correct historical salary lookup.
- Supports future-effective revisions.
- Avoids confusion between creation time and effective time.

Disadvantages:
- More complex query logic.
- Requires strict validation of salary periods.
- Concurrent revisions need database-level protection.

**Future consideration:**

Use PostgreSQL range types and exclusion constraints, where appropriate, to prevent overlapping salary periods at the database level.

### 5.4 Salary Audit Log in the Same Transaction

**Selected:** Create the salary revision and corresponding audit record in one database transaction.

**Alternatives considered:**
- Create audit logs after the salary update.
- Maintain audit logs asynchronously.
- Store only salary history without a separate audit record.

**Reasoning:**

A salary change should never be committed without its corresponding audit record.

Saving both records in one transaction ensures that either both operations succeed or neither does.

**Trade-offs:**

Advantages:
- Consistent salary and audit data.
- Reliable change tracking.
- Better accountability.

Disadvantages:
- Additional database write for every salary change.
- Transaction failure means the complete operation must be retried.

**Future consideration:**

Introduce a more general audit framework only if the application needs to track changes beyond salary management.

---

## 6. Authentication and Security Decisions

### 6.1 JWT in HTTP-Only Cookies

**Selected:** JWT authentication using HTTP-only cookies.

**Alternatives considered:**
- JWT in localStorage.
- Session-based authentication.
- JWT in browser sessionStorage.

**Reasoning:**

HTTP-only cookies prevent client-side JavaScript from directly reading the authentication token.

This reduces exposure to token theft through certain XSS scenarios.

**Trade-offs:**

Advantages:
- Token inaccessible to JavaScript.
- Browser handles cookie transmission.
- Suitable for protected REST APIs.

Disadvantages:
- Requires careful CORS and cookie configuration.
- Cookie-based authentication introduces CSRF considerations.
- Stateless JWTs are not immediately invalidated just by clearing the browser cookie.

**Future consideration:**

Use CSRF protection where required by the cookie and deployment configuration. Introduce server-side sessions or token revocation if immediate logout invalidation is required.

### 6.2 Single HR Manager Role Initially

**Selected:** `HR_MANAGER` role.

**Alternatives considered:**
- Multiple roles such as Admin, HR Manager, Finance Manager, and Employee.
- Fine-grained permission management.

**Reasoning:**

The initial assessment focuses on HR salary management. Implementing a full RBAC system would add complexity without providing immediate value.

**Trade-offs:**

Advantages:
- Simpler authorization logic.
- Faster implementation.
- Easier testing.

Disadvantages:
- Limited access-control flexibility.
- Additional roles will require authorization changes.

**Future consideration:**

Introduce role-based permissions when the product requires multiple user types or department-level access.

---

## 7. Data Loading and Performance Decisions

### 7.1 Server-Side Pagination Instead of Client-Side Pagination

**Selected:** Server-side pagination, filtering, and sorting.

**Alternatives considered:**
- Fetch all 10,000 employees and filter in the browser.
- Client-side pagination.
- Infinite scrolling.

**Reasoning:**

The application needs to display employee and salary data without unnecessarily transferring the entire dataset to the browser.

Server-side pagination reduces response sizes and database-to-client data transfer.

**Trade-offs:**

Advantages:
- Smaller API responses.
- Better initial loading performance.
- Reduced browser memory usage.
- Database handles filtering and sorting efficiently.

Disadvantages:
- More backend query logic.
- Requires pagination state synchronization.
- Total-count queries can become expensive at larger scales.

**Future consideration:**

Use cursor-based pagination if the dataset grows substantially or offset pagination becomes a bottleneck.

### 7.2 Backend CSV Export Instead of Browser Export

**Selected:** Backend-generated CSV exports.

**Alternatives considered:**
- Export currently loaded table rows.
- Fetch every record and generate CSV in the browser.

**Reasoning:**

The salary table uses server-side pagination. Exporting only the currently loaded page would produce incomplete reports.

The backend can apply the same validated filters to the complete matching dataset.

**Trade-offs:**

Advantages:
- Complete filtered exports.
- Consistent filtering behavior.
- Reduced frontend memory usage.

Disadvantages:
- Additional backend endpoint.
- Large exports require careful memory management.
- Export requests may take longer for large datasets.

**Future consideration:**

Use streaming CSV responses and background export jobs if export sizes or request durations become significant.

### 7.3 RTK Query Caching

**Selected:** RTK Query caching and invalidation.

**Alternatives considered:**
- Fetch on every page render.
- Manual caching.
- TanStack Query.

**Reasoning:**

RTK Query reduces unnecessary API requests and provides consistent loading, error, and cache management.

**Trade-offs:**

Advantages:
- Reduced duplicate API calls.
- Automatic cache lifecycle.
- Convenient mutation invalidation.

Disadvantages:
- Incorrect invalidation can display stale data.
- Cache behavior requires configuration.

**Future consideration:**

Tune cache retention and invalidation based on real application usage.

---

## 8. Testing Decisions

### 8.1 Vitest Instead of Jest

**Selected:** Vitest.

**Alternatives considered:**
- Jest.
- Mocha.

**Reasoning:**

The frontend uses Vite, and Vitest provides strong integration with the Vite ecosystem.

It can also be used for backend unit and integration tests.

**Trade-offs:**

Advantages:
- Fast execution.
- Vite configuration compatibility.
- TypeScript support.
- One primary testing framework across the project.

Disadvantages:
- Some Jest-specific configurations and libraries may require adjustments.
- Environment configuration is still needed for frontend and backend tests.

### 8.2 PostgreSQL Integration Tests

**Selected:** Run database integration tests against PostgreSQL.

**Alternatives considered:**
- Mock every database operation.
- Use SQLite for tests.
- Use an in-memory database.

**Reasoning:**

Salary-period constraints, Decimal values, transactions, and PostgreSQL-specific behavior must be tested against the actual database engine.

**Trade-offs:**

Advantages:
- Realistic database behavior.
- Better confidence in transactions and constraints.
- Catches database-specific issues.

Disadvantages:
- Requires test database setup.
- Integration tests take longer than isolated unit tests.

**Future consideration:**

Use containers to provision an isolated PostgreSQL database for automated CI testing.

---

## 9. Development and Deployment Decisions

### 9.1 Single Repository Instead of Separate Repositories

**Selected:** One repository containing frontend, backend, and documentation.

**Alternatives considered:**
- Separate frontend and backend repositories.
- Full monorepo tooling with Nx or Turborepo.

**Reasoning:**

The assessment requires coordinated frontend and backend development, shared documentation, and a single delivery workflow.

A simple monorepo is sufficient without introducing additional build orchestration tools.

**Trade-offs:**

Advantages:
- One Git repository.
- Easier coordinated changes.
- Centralized documentation.
- Simpler assessment submission.

Disadvantages:
- Independent deployment pipelines need configuration.
- Dependencies and scripts must be managed separately.
- Repository size grows as both applications evolve.

**Future consideration:**

Introduce workspace tooling or monorepo orchestration only when multiple packages, shared libraries, or complex build pipelines justify it.

### 9.2 Docker for PostgreSQL

**Selected:** Run PostgreSQL using Docker for local development.

**Alternatives considered:**
- Install PostgreSQL directly on each developer machine.
- Use a hosted database during all development.

**Reasoning:**

Docker provides a consistent local database environment and simplifies setup.

**Trade-offs:**

Advantages:
- Reproducible development environment.
- Easier database setup.
- Isolated database service.

Disadvantages:
- Requires Docker installation.
- Persistent volumes and ports need configuration.
- Docker does not replace production database operations and backups.

**Future consideration:**

Use managed PostgreSQL for production deployment.

---

## 10. Summary of Key Decisions

| Area | Selected Approach | Main Trade-off |
|---|---|---|
| Frontend | React + TypeScript | Flexible but requires architecture decisions |
| Build tool | Vite | Fast development without built-in SSR |
| UI | Material UI | Faster development with customization overhead |
| Data grid | AG Grid | Rich functionality with licensing considerations |
| State | Redux Toolkit + RTK Query | Structured state with additional setup |
| Forms | Formik + Yup | Familiar validation with duplicated frontend/backend schemas |
| Backend | Express + TypeScript | Lightweight but requires conventions |
| ORM | Prisma | Type safety with limitations for complex queries |
| Validation | Zod | Runtime safety with schema maintenance |
| Database | PostgreSQL | Strong integrity with server setup |
| Monetary values | Decimal | Accurate calculations with serialization overhead |
| Salary model | Effective-dated salary history | Correct historical data with more complex queries |
| Audit | Transactional audit records | Strong consistency with additional writes |
| Authentication | JWT HTTP-only cookies | Reduced token exposure with CSRF considerations |
| Pagination | Server-side | Efficient data transfer with backend complexity |
| Export | Backend CSV | Complete exports with additional server processing |
| Testing | Vitest + Supertest | Unified tooling with environment setup |
| Repository | Single repository | Coordinated development with separate app configuration |

---

## 11. Conclusion

The selected architecture prioritizes correctness, maintainability, data integrity, and practical delivery.

The most important decisions are:

1. PostgreSQL is used because salary information requires reliable relational data management and transactions.
2. Salary records are maintained historically instead of overwriting previous values.
3. Effective dates determine the salary applicable to a given date.
4. Salary changes and audit records are saved transactionally.
5. The centralized salary overview uses server-side filtering, sorting, and pagination.
6. Monetary values use Decimal rather than floating-point calculations.
7. The application avoids unnecessary architectural complexity for the initial assessment.

These decisions provide a solid foundation for the current requirements while leaving room for future improvements without prematurely introducing complex infrastructure.