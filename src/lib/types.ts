/** A single field-level validation error returned by the API. */
export interface ApiFieldError {
  field: string;
  message: string;
}

/** Roles a user account can hold. */
export type UserRole = "user" | "admin";

/** API-safe user profile. Never contains password or refresh token. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
}
