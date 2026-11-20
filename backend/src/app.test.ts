import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "./app";

const app = createApp();

describe("API foundation", () => {
  it("reports health without touching the database", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("protects HR endpoints with the authentication cookie", async () => {
    const response = await request(app).get("/api/employees");
    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe("Authentication required");
  });

  it("rejects cross-origin requests from unconfigured origins", async () => {
    const response = await request(app)
      .get("/api/employees")
      .set("Origin", "https://untrusted.example");
    expect(response.status).toBe(403);
  });

  it("validates login input before querying the database", async () => {
    const response = await request(app).post("/api/auth/login").send({ email: "not-an-email" });
    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe("Request validation failed");
  });

  it("requires a refresh cookie before refreshing a session", async () => {
    const response = await request(app).post("/api/auth/refresh");
    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe("Refresh token required");
  });

  it("publishes the API contract", async () => {
    const response = await request(app).get("/api-docs.json");
    expect(response.status).toBe(200);
    expect(response.body.openapi).toBe("3.0.3");
    expect(response.body.paths["/employees/{id}/salaries"].post).toBeDefined();
    expect(response.body.paths["/auth/refresh"].post).toBeDefined();
  });

  it("serves the interactive API documentation", async () => {
    const response = await request(app).get("/api-docs").redirects(1);
    expect(response.status).toBe(200);
    expect(response.text).toContain("swagger-ui");
  });

  it("returns a client error for malformed JSON", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send('{"email":');
    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe("Request body must contain valid JSON");
  });
});
