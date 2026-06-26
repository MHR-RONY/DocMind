import type { ApiFieldError } from "@/lib/types";
import {
  getAccessToken,
  setAccessToken,
  clearAccessToken,
} from "@/lib/token";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:4000";

/** Auth endpoints that must never trigger the silent-refresh retry path. */
const PUBLIC_AUTH_PATHS = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/google",
  "/api/auth/apple",
  "/api/auth/refresh",
];

interface ApiSuccessEnvelope<T> {
  success: true;
  message: string;
  data: T;
}

interface ApiErrorEnvelope {
  success: false;
  message: string;
  errors?: ApiFieldError[];
}

interface RefreshResponse {
  accessToken: string;
}

/** Error thrown for any non-2xx API response, carrying the server message. */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly fieldErrors?: ApiFieldError[];

  constructor(status: number, message: string, fieldErrors?: ApiFieldError[]) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

/**
 * Tracks an in-flight refresh so concurrent 401s share a single refresh call
 * instead of stampeding the server. Reset once the refresh settles.
 */
let refreshPromise: Promise<string> | null = null;

/** Calls the refresh endpoint once, de-duplicating concurrent callers. */
async function refreshAccessToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      let body:
        | ApiSuccessEnvelope<RefreshResponse>
        | ApiErrorEnvelope
        | null = null;
      try {
        body = (await response.json()) as
          | ApiSuccessEnvelope<RefreshResponse>
          | ApiErrorEnvelope;
      } catch {
        body = null;
      }

      if (!response.ok || !body || body.success === false) {
        throw new ApiRequestError(response.status, "Session expired");
      }

      return body.data.accessToken;
    })();
  }

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

/** Builds request init with the bearer token applied when present. */
function buildInit(options: RequestInit): RequestInit {
  const token = getAccessToken();
  // FormData bodies must not carry an explicit Content-Type: the browser sets
  // it (including the multipart boundary) itself. For every other body we keep
  // the JSON default.
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  return {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };
}

/**
 * Issues a request to the API and unwraps the standard `{ success, data }`
 * envelope. Always sends credentials so the httpOnly refresh-token cookie is
 * included, and attaches the in-memory access token as a bearer header.
 *
 * On a 401 for a protected endpoint, performs a single silent refresh (shared
 * across concurrent callers) and retries the original request exactly once.
 * The refresh call and the retry never trigger another refresh, so loops are
 * impossible. Throws {@link ApiRequestError} on a failed request or non-success
 * envelope.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return requestWithRefresh<T>(path, options, false);
}

async function requestWithRefresh<T>(
  path: string,
  options: RequestInit,
  isRetry: boolean,
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, buildInit(options));
  } catch {
    throw new ApiRequestError(
      0,
      "Unable to reach the server. Please try again.",
    );
  }

  let body: ApiSuccessEnvelope<T> | ApiErrorEnvelope | null = null;
  try {
    body = (await response.json()) as ApiSuccessEnvelope<T> | ApiErrorEnvelope;
  } catch {
    body = null;
  }

  if (!response.ok || !body || body.success === false) {
    const message =
      (body && "message" in body && body.message) || "Request failed";
    const fieldErrors =
      body && body.success === false ? body.errors : undefined;
    const error = new ApiRequestError(response.status, message, fieldErrors);

    const canRefresh =
      response.status === 401 &&
      !isRetry &&
      !PUBLIC_AUTH_PATHS.includes(path);

    if (canRefresh) {
      try {
        const token = await refreshAccessToken();
        setAccessToken(token);
      } catch {
        clearAccessToken();
        if (typeof window !== "undefined") {
          // Navigation is the app layer's concern: notify the auth context so
          // it can clear session state and let the route guards redirect only
          // protected pages (public pages must stay reachable when logged out).
          window.dispatchEvent(new Event("auth:logout"));
        }
        throw error;
      }
      return requestWithRefresh<T>(path, options, true);
    }

    throw error;
  }

  return body.data;
}
