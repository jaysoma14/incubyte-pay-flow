import type { ErrorRequestHandler } from "express";
import { Prisma } from "../generated/prisma/client";
import { ZodError } from "zod";
import { HttpError } from "../lib/errors";

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({
      error: { message: error.message, ...(error.details ? { details: error.details } : {}) },
    });
    return;
  }

  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        message: "Request validation failed",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  ) {
    response.status(400).json({ error: { message: "Request body must contain valid JSON" } });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      response.status(409).json({ error: { message: "A record with these values already exists" } });
      return;
    }
    if (error.code === "P2025") {
      response.status(404).json({ error: { message: "Record not found" } });
      return;
    }
  }

  console.error("Unhandled API error:", error);
  response.status(500).json({ error: { message: "An unexpected error occurred" } });
};
