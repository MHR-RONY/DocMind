import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import { login, oauthLogin } from "@/lib/auth";
import { ApiRequestError } from "@/lib/api";
import {
  getGoogleIdToken,
  getAppleIdToken,
  OAuthUnavailableError,
} from "@/lib/oauth";
import { toast } from "sonner";
import type { AuthUser } from "@/lib/types";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock("@/lib/auth", () => ({ login: vi.fn(), oauthLogin: vi.fn() }));

vi.mock("@/lib/oauth", async () => {
  const actual = await vi.importActual<typeof import("@/lib/oauth")>(
    "@/lib/oauth",
  );
  return {
    ...actual,
    getGoogleIdToken: vi.fn(),
    getAppleIdToken: vi.fn(),
  };
});

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

const renderLogin = () =>
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );

const fillForm = (email: string, password: string) => {
  fireEvent.change(screen.getByPlaceholderText("Email address"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: password },
  });
};

const makeUser = (role: AuthUser["role"]): AuthUser => ({
  id: "u1",
  name: "Test User",
  email: "test@example.com",
  role,
  isBlocked: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
});

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks submission and shows an error when fields are empty", () => {
    renderLogin();
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    expect(toast.error).toHaveBeenCalledWith("Please fill in all fields");
    expect(login).not.toHaveBeenCalled();
  });

  it("logs in a regular user and navigates home", async () => {
    vi.mocked(login).mockResolvedValue(makeUser("user"));
    renderLogin();
    fillForm("test@example.com", "secret123");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith("test@example.com", "secret123");
    });
    expect(toast.success).toHaveBeenCalledWith("Logged in successfully!");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("navigates admins to the admin area", async () => {
    vi.mocked(login).mockResolvedValue(makeUser("admin"));
    renderLogin();
    fillForm("admin@example.com", "secret123");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });

  it("surfaces the API error message on failed login", async () => {
    vi.mocked(login).mockRejectedValue(
      new ApiRequestError(401, "Invalid credentials"),
    );
    renderLogin();
    fillForm("test@example.com", "wrongpass");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials");
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows a generic message for non-API errors", async () => {
    vi.mocked(login).mockRejectedValue(new Error("boom"));
    renderLogin();
    fillForm("test@example.com", "secret123");
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
  });

  it("completes Google sign-in: token -> oauthLogin -> navigate", async () => {
    vi.mocked(getGoogleIdToken).mockResolvedValue("google-id-token");
    vi.mocked(oauthLogin).mockResolvedValue(makeUser("user"));
    renderLogin();
    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Google/i }),
    );

    await waitFor(() => {
      expect(oauthLogin).toHaveBeenCalledWith("google", "google-id-token");
    });
    expect(toast.success).toHaveBeenCalledWith("Logged in successfully!");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("completes Apple sign-in: token -> oauthLogin -> navigate", async () => {
    vi.mocked(getAppleIdToken).mockResolvedValue("apple-id-token");
    vi.mocked(oauthLogin).mockResolvedValue(makeUser("admin"));
    renderLogin();
    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Apple/i }),
    );

    await waitFor(() => {
      expect(oauthLogin).toHaveBeenCalledWith("apple", "apple-id-token");
    });
    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  it("surfaces an OAuthUnavailableError without calling the backend", async () => {
    vi.mocked(getGoogleIdToken).mockRejectedValue(
      new OAuthUnavailableError("Google sign-in is not configured for this app"),
    );
    renderLogin();
    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Google/i }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Google sign-in is not configured for this app",
      );
    });
    expect(oauthLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("surfaces a backend rejection of the provider token", async () => {
    vi.mocked(getGoogleIdToken).mockResolvedValue("google-id-token");
    vi.mocked(oauthLogin).mockRejectedValue(
      new ApiRequestError(401, "Invalid Google credential"),
    );
    renderLogin();
    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Google/i }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid Google credential");
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
