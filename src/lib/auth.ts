import { apiRequest } from "@/lib/api";
import type { AuthUser } from "@/lib/types";

const ACCESS_TOKEN_KEY = "docmind.accessToken";

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

/** Returns the stored access token, or null if the user is not logged in. */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/** Persists the access token for authenticated requests. */
export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

/** Clears the stored access token. */
export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * Authenticates with email + password against the backend. On success the
 * access token is stored and the safe user profile is returned. The refresh
 * token is set by the server as an httpOnly cookie and never handled here.
 *
 * @throws ApiRequestError on invalid credentials, blocked account, or network failure.
 */
export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const { user, accessToken } = await apiRequest<LoginResponse>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  );
  setAccessToken(accessToken);
  return user;
}

/**
 * Exchanges a verified provider ID token for a DocMind session. The backend
 * verifies the token with Google/Apple, finds-or-creates the user, and sets
 * the refresh-token cookie. On success the access token is stored.
 *
 * @throws ApiRequestError if the provider is unconfigured (503), the token is
 *   invalid (401), or the account is blocked (403).
 */
export async function oauthLogin(
  provider: "google" | "apple",
  idToken: string,
): Promise<AuthUser> {
  const { user, accessToken } = await apiRequest<LoginResponse>(
    `/api/auth/${provider}`,
    {
      method: "POST",
      body: JSON.stringify({ idToken }),
    },
  );
  setAccessToken(accessToken);
  return user;
}
