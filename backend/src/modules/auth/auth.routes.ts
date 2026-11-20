import { Router } from "express";
import type { Response } from "express";
import bcrypt from "bcrypt";
import { createHash, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import {
  authCookieName,
  cookieOptions,
  jwtLifetimeSeconds,
  jwtSecret,
  refreshCookieName,
  refreshCookieOptions,
  refreshTokenLifetimeSeconds,
} from "../../lib/config";
import { HttpError } from "../../lib/errors";
import { requireAuth } from "../../middleware/auth";
import { parseBody } from "../../middleware/validate";
import { loginSchema } from "./auth.schema";

export const authRouter = Router();

function hashRefreshToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createAccessToken(user: { id: string; role: string }) {
  return jwt.sign(
    { role: user.role },
    jwtSecret(),
    { subject: user.id, expiresIn: jwtLifetimeSeconds() },
  );
}

function newRefreshToken() {
  return randomBytes(32).toString("base64url");
}

function refreshTokenExpiry() {
  return new Date(Date.now() + refreshTokenLifetimeSeconds() * 1000);
}

function setAuthCookies(response: Response, accessToken: string, refreshToken: string) {
  response.cookie(authCookieName, accessToken, cookieOptions());
  response.cookie(refreshCookieName, refreshToken, refreshCookieOptions());
}

authRouter.post("/login", async (request, response) => {
  const credentials = parseBody(loginSchema, request);
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
    select: { id: true, email: true, role: true, passwordHash: true },
  });
  if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
    throw new HttpError(401, "Invalid email or password");
  }

  const refreshToken = newRefreshToken();
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: refreshTokenExpiry(),
    },
  });
  setAuthCookies(response, createAccessToken(user), refreshToken);
  response.json({
    user: { id: user.id, email: user.email, role: user.role },
  });
});

authRouter.post("/refresh", async (request, response) => {
  const currentToken = request.cookies?.[refreshCookieName];
  if (typeof currentToken !== "string") {
    throw new HttpError(401, "Refresh token required");
  }

  const tokenHash = hashRefreshToken(currentToken);
  const now = new Date();
  const rotatedToken = newRefreshToken();
  const refreshed = await prisma.$transaction(async (transaction) => {
    const storedToken = await transaction.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt <= now) {
      return null;
    }

    const rotation = await transaction.refreshToken.updateMany({
      where: { id: storedToken.id, revokedAt: null, expiresAt: { gt: now } },
      data: { revokedAt: now },
    });
    if (rotation.count !== 1 || storedToken.user.role !== "HR_MANAGER") {
      return null;
    }

    await transaction.refreshToken.create({
      data: {
        userId: storedToken.userId,
        tokenHash: hashRefreshToken(rotatedToken),
        expiresAt: refreshTokenExpiry(),
      },
    });
    return storedToken.user;
  });

  if (!refreshed) {
    const { maxAge: _maxAge, ...clearOptions } = refreshCookieOptions();
    response.clearCookie(refreshCookieName, clearOptions);
    throw new HttpError(401, "Refresh token is invalid, expired, or already used");
  }

  setAuthCookies(response, createAccessToken(refreshed), rotatedToken);
  response.json({
    user: { id: refreshed.id, email: refreshed.email, role: refreshed.role },
  });
});

authRouter.post("/logout", async (request, response) => {
  const currentToken = request.cookies?.[refreshCookieName];
  if (typeof currentToken === "string") {
    await prisma.refreshToken.updateMany({
      where: {
        tokenHash: hashRefreshToken(currentToken),
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
  }
  const { maxAge: _maxAge, ...clearOptions } = cookieOptions();
  response.clearCookie(authCookieName, clearOptions);
  const { maxAge: _refreshMaxAge, ...clearRefreshOptions } = refreshCookieOptions();
  response.clearCookie(refreshCookieName, clearRefreshOptions);
  response.status(204).end();
});

authRouter.get("/me", requireAuth, async (request, response) => {
  const user = await prisma.user.findUnique({
    where: { id: request.auth!.userId },
    select: { id: true, email: true, role: true },
  });
  if (!user) {
    throw new HttpError(401, "Authentication account no longer exists");
  }
  response.json({ user });
});
