import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { authCookieName, frontendOrigins, jwtSecret } from "../lib/config";
import { HttpError } from "../lib/errors";

export const requireAuth: RequestHandler = (request, _response, next) => {
  const token = request.cookies?.[authCookieName];
  if (typeof token !== "string") {
    next(new HttpError(401, "Authentication required"));
    return;
  }

  const secret = jwtSecret();
  let payload: string | jwt.JwtPayload;
  try {
    payload = jwt.verify(token, secret);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new HttpError(401, "Invalid or expired authentication token"));
      return;
    }
    next(error);
    return;
  }
  if (
    typeof payload === "string" ||
    typeof payload.sub !== "string" ||
    payload.role !== "HR_MANAGER"
  ) {
    next(new HttpError(401, "Invalid authentication token"));
    return;
  }
  request.auth = { userId: payload.sub, role: "HR_MANAGER" };
  next();
};

export const requireHrManager: RequestHandler = (request, _response, next) => {
  if (request.auth?.role !== "HR_MANAGER") {
    next(new HttpError(403, "HR Manager access required"));
    return;
  }
  next();
};

export const requireTrustedOrigin: RequestHandler = (request, _response, next) => {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(request.method)) {
    next();
    return;
  }
  const origin = request.get("origin");
  if (origin && !frontendOrigins().includes(origin)) {
    next(new HttpError(403, "Origin is not allowed to modify resources"));
    return;
  }
  next();
};
