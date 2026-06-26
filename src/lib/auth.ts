import { apiRequest } from "@/lib/api";
import { setAccessToken, clearAccessToken } from "@/lib/token";
import type { AuthUser } from "@/lib/types";

// Re-exported so existing importers of `@/lib/auth` keep working after the
// token store moved into its own dependency-free module.
export { getAccessToken, setAccessToken, clearAccessToken } from "@/lib/token";

interface LoginResponse {
  user: AuthUser;
  accessToken: string;
}

interface CurrentUserResponse {
  user: AuthUser;
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
 * Registers a new account, then stores the issued access token and returns the
 * safe user profile. The refresh token is set by the server as an httpOnly
 * cookie and never handled here.
 *
 * @throws ApiRequestError on a duplicate email (409), validation failure (400),
 *   or network failure.
 */
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  const { user, accessToken } = await apiRequest<LoginResponse>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    },
  );
  setAccessToken(accessToken);
  return user;
}

/**
 * Ends the current session. Clears the in-memory access token first so the
 * local session is gone even if the network call fails, then makes a
 * best-effort call to the backend to clear the refresh-token cookie.
 *
 * Navigation is intentionally NOT handled here — redirecting after logout is
 * the caller's concern (e.g. the AuthContext).
 */
export async function logout(): Promise<void> {
  clearAccessToken();
  try {
    await apiRequest<null>("/api/auth/logout", { method: "POST" });
  } catch {
    // Best-effort: the local session is already cleared above.
  }
}

/**
 * Fetches the authenticated user's profile. Used to hydrate the session on app
 * load (the access token is restored via the silent-refresh path).
 *
 * @throws ApiRequestError if the session is invalid or the request fails.
 */
export async function fetchCurrentUser(): Promise<AuthUser> {
  const { user } = await apiRequest<CurrentUserResponse>("/api/auth/me");
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
