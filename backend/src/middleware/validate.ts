import type { Request, RequestHandler } from "express";
import { z } from "zod";

export function parseBody<T extends z.ZodType>(schema: T, request: Request): z.output<T> {
  return schema.parse(request.body);
}

export function parseQuery<T extends z.ZodType>(schema: T, request: Request): z.output<T> {
  return schema.parse(request.query);
}

export function validateBody<T extends z.ZodType>(schema: T): RequestHandler {
  return (request, _response, next) => {
    const result = schema.safeParse(request.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    request.body = result.data;
    next();
  };
}
