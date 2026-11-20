import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

const mockUseGetMeQuery = vi.hoisted(() => vi.fn());

vi.mock("./api/authApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./api/authApi")>();
  return {
    ...actual,
    useGetMeQuery: mockUseGetMeQuery,
    useLoginMutation: () => [vi.fn(), { isLoading: false }],
  };
});

afterEach(cleanup);
beforeEach(() => {
  mockUseGetMeQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true, error: { status: 401 }, refetch: vi.fn() });
});

describe("authentication routes", () => {
  it("redirects an unauthenticated user from protected pages to login", async () => {
    window.history.replaceState({}, "", "/employees");
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Welcome back" })).toBeInTheDocument();
  });

  it("validates the login form before sending credentials", async () => {
    window.history.replaceState({}, "", "/login");
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    expect(await screen.findByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Password is required")).toBeInTheDocument();
  });

  it("shows a retryable error instead of treating network failures as logged-out sessions", () => {
    mockUseGetMeQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true, error: { status: "FETCH_ERROR" }, refetch: vi.fn() });
    window.history.replaceState({}, "", "/employees");
    render(<App />);
    expect(screen.getByText("Something went wrong. Please try again.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
