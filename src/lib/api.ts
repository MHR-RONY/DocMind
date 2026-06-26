import type { ApiFieldError } from "@/lib/types";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ??
  "http://localhost:4000";

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
 * Issues a request to the API and unwraps the standard `{ success, data }`
 * envelope. Always sends credentials so the httpOnly refresh-token cookie is
 * included. Throws {@link ApiRequestError} on a failed request or non-success
 * envelope.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch {
    throw new ApiRequestError(0, "Unable to reach the server. Please try again.");
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
    throw new ApiRequestError(response.status, message, fieldErrors);
  }

  return body.data;
}
