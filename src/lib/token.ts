/**
 * In-memory access-token store. The token is held in a module-level variable
 * and deliberately NOT persisted to localStorage — it must not survive a hard
 * refresh. Re-authentication after a reload is handled by the httpOnly
 * refresh-token cookie via the silent-refresh path in `api.ts`.
 *
 * This module has no imports, which keeps it free of the circular dependency
 * between `api.ts` and `auth.ts`.
 */

let accessToken: string | null = null;

/** Returns the current access token, or null if the user is not logged in. */
export function getAccessToken(): string | null {
  return accessToken;
}

/** Stores the access token for authenticated requests. */
export function setAccessToken(token: string): void {
  accessToken = token;
}

/** Clears the stored access token. */
export function clearAccessToken(): void {
  accessToken = null;
}
