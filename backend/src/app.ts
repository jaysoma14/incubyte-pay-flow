import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { frontendOrigins } from "./lib/config";
import { errorHandler } from "./middleware/error";
import { requireAuth, requireHrManager, requireTrustedOrigin } from "./middleware/auth";
import { authRouter } from "./modules/auth/auth.routes";
import { employeeRouter } from "./modules/employees/employee.routes";
import { employeeSalaryRouter, salaryRouter } from "./modules/salaries/salary.routes";
import { auditRouter, employeeAuditRouter } from "./modules/audit-logs/audit.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { reportRouter } from "./modules/reports/report.routes";
import { departmentRouter } from "./modules/departments/department.routes";
import { openApiDocument } from "./openapi";
import { HttpError } from "./lib/errors";

export function createApp() {
  const app = express();
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || frontendOrigins().includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new HttpError(403, "Origin is not allowed by CORS"));
    },
    credentials: true,
  }));
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health", (_request, response) => response.json({ status: "ok" }));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get("/api-docs.json", (_request, response) => response.json(openApiDocument));

  app.use("/api/auth", authRouter);
  app.use("/api/departments", requireAuth, requireHrManager, requireTrustedOrigin, departmentRouter);
  app.use("/api/employees/:id/salaries", requireAuth, requireHrManager, requireTrustedOrigin, employeeSalaryRouter);
  app.use("/api/employees/:employeeId/audit-logs", requireAuth, requireHrManager, requireTrustedOrigin, employeeAuditRouter);
  app.use("/api/employees", requireAuth, requireHrManager, requireTrustedOrigin, employeeRouter);
  app.use("/api/salaries", requireAuth, requireHrManager, requireTrustedOrigin, salaryRouter);
  app.use("/api/audit-logs", requireAuth, requireHrManager, requireTrustedOrigin, auditRouter);
  app.use("/api/dashboard", requireAuth, requireHrManager, requireTrustedOrigin, dashboardRouter);
  app.use("/api/reports", requireAuth, requireHrManager, requireTrustedOrigin, reportRouter);

  app.use((_request, response) => {
    response.status(404).json({ error: { message: "Route not found" } });
  });
  app.use(errorHandler);
  return app;
}
