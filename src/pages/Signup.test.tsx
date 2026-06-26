import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Signup from "./Signup";
import { useAuth } from "@/context/AuthContext";
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

const signUp = vi.fn();
const signInWithOAuth = vi.fn();

vi.mock("@/context/AuthContext", () => ({ useAuth: vi.fn() }));

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

const renderSignup = () =>
  render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>,
  );

const fillForm = (name: string, email: string, password: string) => {
  fireEvent.change(screen.getByPlaceholderText("Full name"), {
    target: { value: name },
  });
  fireEvent.change(screen.getByPlaceholderText("Email address"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText("Password (min. 8 characters)"), {
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

describe("Signup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      signIn: vi.fn(),
      signUp,
      signInWithOAuth,
      signOut: vi.fn(),
    });
  });

  it("blocks submission and shows an error when fields are empty", () => {
    renderSignup();
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(toast.error).toHaveBeenCalledWith("Please fill in all fields");
    expect(signUp).not.toHaveBeenCalled();
  });

  it("blocks submission when the password is shorter than 8 characters", () => {
    renderSignup();
    fillForm("Test User", "test@example.com", "short");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    expect(toast.error).toHaveBeenCalledWith(
      "Password must be at least 8 characters",
    );
    expect(signUp).not.toHaveBeenCalled();
  });

  it("registers a regular user and navigates home", async () => {
    signUp.mockResolvedValue(makeUser("user"));
    renderSignup();
    fillForm("Test User", "test@example.com", "secret123");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(
        "Test User",
        "test@example.com",
        "secret123",
      );
    });
    expect(toast.success).toHaveBeenCalledWith("Account created successfully!");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("navigates admins to the admin area", async () => {
    signUp.mockResolvedValue(makeUser("admin"));
    renderSignup();
    fillForm("Admin User", "admin@example.com", "secret123");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin");
    });
  });

  it("surfaces the API error message when the email is already registered", async () => {
    signUp.mockRejectedValue(
      new ApiRequestError(409, "Email is already registered"),
    );
    renderSignup();
    fillForm("Test User", "taken@example.com", "secret123");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Email is already registered");
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("surfaces a validation error from the backend", async () => {
    signUp.mockRejectedValue(
      new ApiRequestError(400, "Password is too weak"),
    );
    renderSignup();
    fillForm("Test User", "test@example.com", "secret123");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Password is too weak");
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows a generic message for non-API errors", async () => {
    signUp.mockRejectedValue(new Error("boom"));
    renderSignup();
    fillForm("Test User", "test@example.com", "secret123");
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong. Please try again.",
      );
    });
  });

  it("completes Google sign-up: token -> oauthLogin -> navigate", async () => {
    vi.mocked(getGoogleIdToken).mockResolvedValue("google-id-token");
    signInWithOAuth.mockResolvedValue(makeUser("user"));
    renderSignup();
    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Google/i }),
    );

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledWith("google", "google-id-token");
    });
    expect(toast.success).toHaveBeenCalledWith("Account created successfully!");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("completes Apple sign-up: token -> oauthLogin -> navigate", async () => {
    vi.mocked(getAppleIdToken).mockResolvedValue("apple-id-token");
    signInWithOAuth.mockResolvedValue(makeUser("admin"));
    renderSignup();
    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Apple/i }),
    );

    await waitFor(() => {
      expect(signInWithOAuth).toHaveBeenCalledWith("apple", "apple-id-token");
    });
    expect(mockNavigate).toHaveBeenCalledWith("/admin");
  });

  it("surfaces an OAuthUnavailableError without calling the backend", async () => {
    vi.mocked(getGoogleIdToken).mockRejectedValue(
      new OAuthUnavailableError("Google sign-in is not configured for this app"),
    );
    renderSignup();
    fireEvent.click(
      screen.getByRole("button", { name: /Continue with Google/i }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Google sign-in is not configured for this app",
      );
    });
    expect(signInWithOAuth).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
