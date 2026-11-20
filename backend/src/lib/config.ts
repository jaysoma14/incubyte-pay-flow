export function jwtLifetimeSeconds() {
  const configuredLifetime = process.env.JWT_EXPIRES_IN ?? "1d";
  const match = /^(\d+)(s|m|h|d)$/.exec(configuredLifetime);
  if (!match) {
    throw new Error("JWT_EXPIRES_IN must be an integer followed by s, m, h, or d");
  }

  const value = Number(match[1]);
  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[match[2] as "s" | "m" | "h" | "d"];
  const seconds = value * multiplier;
  if (!Number.isSafeInteger(seconds) || seconds < 1) {
    throw new Error("JWT_EXPIRES_IN is outside the supported range");
  }
  return seconds;
}

export function jwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters");
  }
  return secret;
}

export function cookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? ("none" as const) : ("lax" as const),
    path: "/",
    maxAge: jwtLifetimeSeconds() * 1000,
  };
}

export function refreshCookieOptions() {
  const secure = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: secure ? ("none" as const) : ("lax" as const),
    path: "/api/auth",
    maxAge: refreshTokenLifetimeSeconds() * 1000,
  };
}

export function refreshTokenLifetimeSeconds() {
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 30);
  if (!Number.isSafeInteger(days) || days < 1 || days > 365) {
    throw new Error("REFRESH_TOKEN_EXPIRES_DAYS must be an integer between 1 and 365");
  }
  return days * 86_400;
}

export function frontendOrigins() {
  return (process.env.FRONTEND_ORIGINS ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export const authCookieName = "payflow_token";
export const refreshCookieName = "payflow_refresh_token";
