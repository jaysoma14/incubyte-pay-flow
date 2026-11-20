const pathId = { name: "id", in: "path", required: true, schema: { type: "string" } };
const employeeIdPath = { name: "employeeId", in: "path", required: true, schema: { type: "string" } };
const paginationParameters = [
  { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
  { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100, default: 25 } },
];
const listParameters = [
  ...paginationParameters,
  { name: "search", in: "query", schema: { type: "string" } },
  { name: "department", in: "query", schema: { type: "string" } },
  { name: "departmentId", in: "query", schema: { type: "string" } },
  { name: "designation", in: "query", schema: { type: "string" } },
  { name: "country", in: "query", schema: { type: "string" } },
  { name: "employmentStatus", in: "query", schema: { type: "string", enum: ["ACTIVE", "INACTIVE", "TERMINATED"] } },
];
const salaryParameters = [
  ...paginationParameters,
  { name: "search", in: "query", schema: { type: "string" } },
  { name: "country", in: "query", schema: { type: "string" } },
  { name: "department", in: "query", schema: { type: "string" } },
  { name: "designation", in: "query", schema: { type: "string" } },
  { name: "currency", in: "query", schema: { type: "string", pattern: "^[A-Za-z]{3}$" } },
  { name: "minAmount", in: "query", schema: { type: "string", pattern: "^[0-9]+(\\.[0-9]{1,2})?$" } },
  { name: "maxAmount", in: "query", schema: { type: "string", pattern: "^[0-9]+(\\.[0-9]{1,2})?$" } },
  { name: "sortBy", in: "query", schema: { type: "string", enum: ["employeeName", "amount", "effectiveFrom"] } },
  { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
  { name: "asOf", in: "query", schema: { type: "string", format: "date" } },
];

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "PayFlow API",
    version: "1.0.0",
    description: "Employee and salary management API. Monetary amounts are returned as decimal strings and are never aggregated across currencies.",
  },
  servers: [{ url: "/api" }],
  components: {
    securitySchemes: {
      sessionCookie: { type: "apiKey", in: "cookie", name: "payflow_token" },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: { message: { type: "string" }, details: { type: "array" } },
            required: ["message"],
          },
        },
        required: ["error"],
      },
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer" },
          limit: { type: "integer" },
          total: { type: "integer" },
          totalPages: { type: "integer" },
        },
        required: ["page", "limit", "total", "totalPages"],
      },
      EmployeeInput: {
        type: "object",
        required: [
          "employeeCode",
          "firstName",
          "lastName",
          "email",
          "departmentId",
          "designation",
          "country",
          "joiningDate",
        ],
        properties: {
          employeeCode: { type: "string", maxLength: 40 },
          firstName: { type: "string", maxLength: 80 },
          lastName: { type: "string", maxLength: 80 },
          email: { type: "string", format: "email" },
          departmentId: { type: "string" },
          designation: { type: "string", maxLength: 120 },
          country: { type: "string", maxLength: 100 },
          employmentStatus: { type: "string", enum: ["ACTIVE", "INACTIVE", "TERMINATED"] },
          joiningDate: { type: "string", format: "date" },
        },
      },
      EmployeeUpdateInput: {
        type: "object",
        minProperties: 1,
        properties: {
          employeeCode: { type: "string", maxLength: 40 },
          firstName: { type: "string", maxLength: 80 },
          lastName: { type: "string", maxLength: 80 },
          email: { type: "string", format: "email" },
          departmentId: { type: "string" },
          designation: { type: "string", maxLength: 120 },
          country: { type: "string", maxLength: 100 },
          employmentStatus: { type: "string", enum: ["ACTIVE", "INACTIVE", "TERMINATED"] },
          joiningDate: { type: "string", format: "date" },
        },
      },
      SalaryRevisionInput: {
        type: "object",
        required: ["amount", "currency", "effectiveFrom", "reason"],
        properties: {
          amount: { type: "string", pattern: "^(?:0|[1-9][0-9]{0,15})(?:\\.[0-9]{1,2})?$" },
          currency: { type: "string", pattern: "^[A-Z]{3}$", description: "Supported ISO 4217 currency code." },
          effectiveFrom: { type: "string", format: "date" },
          reason: { type: "string", minLength: 1, maxLength: 1000 },
        },
      },
      SalaryOverviewRow: {
        type: "object",
        required: ["employeeRecordId", "employeeId", "employeeName", "email", "department", "designation", "country", "salary", "lastUpdatedAt"],
        properties: {
          employeeId: { type: "string" },
          employeeRecordId: { type: "string", description: "Employee database ID for employee-specific routes." },
          employeeName: { type: "string" },
          email: { type: "string", format: "email" },
          department: { type: "string" },
          designation: { type: "string" },
          country: { type: "string" },
          salary: {
            nullable: true,
            type: "object",
            properties: {
              id: { type: "string" },
              amount: { type: "string", description: "Decimal amount; never a floating-point JSON number." },
              currency: { type: "string" },
              effectiveFrom: { type: "string", format: "date" },
              effectiveTo: { type: "string", format: "date", nullable: true },
            },
          },
          lastUpdatedAt: { type: "string", format: "date-time", nullable: true },
        },
      },
      SalaryOverviewResponse: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/SalaryOverviewRow" } },
          pagination: { $ref: "#/components/schemas/Pagination" },
        },
        required: ["data", "pagination"],
      },
    },
  },
  paths: {
    "/auth/login": {
      post: {
        summary: "Authenticate an HR Manager",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", required: ["email", "password"], properties: { email: { type: "string", format: "email" }, password: { type: "string" } } } } },
        },
        responses: {
          "200": { description: "Authenticated user; JWT is set in an HTTP-only cookie." },
          "400": { description: "Invalid request." },
          "401": { description: "Invalid credentials." },
        },
      },
    },
    "/auth/logout": { post: { summary: "Clear the authentication cookie", responses: { "204": { description: "Logged out." } } } },
    "/auth/refresh": {
      post: {
        summary: "Rotate the refresh token and issue a new access token",
        description: "Requires the HTTP-only refresh cookie set by login. Refresh tokens are single-use and rotated on success.",
        parameters: [],
        responses: {
          "200": { description: "Authenticated user; new access and refresh cookies are set." },
          "401": { description: "Refresh token is missing, expired, revoked, or already used." },
        },
      },
    },
    "/auth/me": { get: { security: [{ sessionCookie: [] }], summary: "Get the authenticated user", responses: { "200": { description: "Current user." }, "401": { description: "Not authenticated." } } } },
    "/employees": {
      get: { security: [{ sessionCookie: [] }], summary: "Search and paginate employees", parameters: listParameters, responses: { "200": { description: "Employee page, with department relation and pagination metadata." }, "400": { description: "Invalid query parameters." }, "401": { description: "Not authenticated." } } },
      post: {
        security: [{ sessionCookie: [] }],
        summary: "Create an employee",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/EmployeeInput" } } },
        },
        responses: { "201": { description: "Created employee." }, "400": { description: "Invalid request or unknown department." }, "409": { description: "Employee code or email already exists." } },
      },
    },
    "/employees/{id}": {
      get: { security: [{ sessionCookie: [] }], summary: "Get an employee and salary records", parameters: [pathId], responses: { "200": { description: "Employee detail." }, "404": { description: "Employee not found." } } },
      put: {
        security: [{ sessionCookie: [] }],
        summary: "Update an employee",
        parameters: [pathId],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/EmployeeUpdateInput" } } },
        },
        responses: { "200": { description: "Updated employee." }, "400": { description: "Invalid request." }, "404": { description: "Employee not found." } },
      },
    },
    "/employees/{id}/salaries": {
      get: { security: [{ sessionCookie: [] }], summary: "Get salary history", parameters: [pathId, ...paginationParameters], responses: { "200": { description: "Salary history page." } } },
      post: {
        security: [{ sessionCookie: [] }],
        summary: "Assign or revise salary",
        parameters: [pathId],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/SalaryRevisionInput" } } },
        },
        responses: { "201": { description: "Salary and audit record created atomically." }, "400": { description: "Invalid salary or currency." }, "404": { description: "Employee not found." }, "409": { description: "Salary periods overlap." } },
      },
    },
    "/salaries": {
      get: { security: [{ sessionCookie: [] }], summary: "Get one applicable salary row per employee", parameters: salaryParameters, responses: { "200": { description: "Filtered salary page, including employees without applicable salaries.", content: { "application/json": { schema: { $ref: "#/components/schemas/SalaryOverviewResponse" } } } }, "400": { description: "Invalid filters or sorting parameters." } } },
    },
    "/salaries/{id}": {
      get: { security: [{ sessionCookie: [] }], summary: "Get salary record and audit history", parameters: [pathId], responses: { "200": { description: "Salary detail." }, "404": { description: "Salary not found." } } },
    },
    "/audit-logs": { get: { security: [{ sessionCookie: [] }], summary: "List immutable salary audit records", parameters: paginationParameters, responses: { "200": { description: "Audit log page." } } } },
    "/employees/{employeeId}/audit-logs": { get: { security: [{ sessionCookie: [] }], summary: "List an employee's salary audit history", parameters: [employeeIdPath, ...paginationParameters], responses: { "200": { description: "Employee audit history." } } } },
    "/departments": { get: { security: [{ sessionCookie: [] }], summary: "List departments for employee forms", responses: { "200": { description: "Department IDs, names, and employee counts." } } } },
    "/dashboard/summary": { get: { security: [{ sessionCookie: [] }], summary: "Get employee and currency-separated payroll summary", responses: { "200": { description: "Dashboard summary." } } } },
    "/dashboard/department-distribution": { get: { security: [{ sessionCookie: [] }], summary: "Get employee counts by department", responses: { "200": { description: "Department distribution." } } } },
    "/dashboard/country-distribution": { get: { security: [{ sessionCookie: [] }], summary: "Get employee counts by country", responses: { "200": { description: "Country distribution." } } } },
    "/dashboard/salary-distribution": { get: { security: [{ sessionCookie: [] }], summary: "Get salary metrics by department, designation, and currency", responses: { "200": { description: "Currency-specific salary distribution." } } } },
    "/reports/employees/export": { get: { security: [{ sessionCookie: [] }], summary: "Stream filtered employees as CSV", parameters: listParameters, responses: { "200": { description: "CSV file." } } } },
    "/reports/salaries/export": { get: { security: [{ sessionCookie: [] }], summary: "Stream filtered applicable salaries as CSV", parameters: salaryParameters, responses: { "200": { description: "CSV file." } } } },
  },
};
