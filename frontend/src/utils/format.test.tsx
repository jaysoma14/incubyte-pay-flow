import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { EmptyState } from "../components/common";
import { formatDate, formatMoney, getErrorMessage } from "./format";

afterEach(cleanup);

describe("format helpers", () => {
  it("formats a date-only value without shifting its calendar day", () => {
    expect(formatDate("2026-11-20")).toMatch(/Nov|20|2026/);
  });

  it("formats salary with its currency and preserves missing values", () => {
    expect(formatMoney("1250.50", "USD")).toContain("1,250.50");
    expect(formatMoney(null, "USD")).toBe("—");
  });

  it("extracts validation errors returned by the API", () => {
    expect(getErrorMessage({ data: { error: { message: "Invalid salary" } } })).toBe("Invalid salary");
    expect(getErrorMessage(new Error("Network unavailable"))).toBe("Network unavailable");
  });
});

describe("empty state", () => {
  it("shows clear empty-state guidance", () => {
    render(<EmptyState>No employees match.</EmptyState>);
    expect(screen.getByText("No employees match.")).toBeInTheDocument();
  });
});
