import { UserRole } from './enums';

/**
 * Mongoose document shape for a User.
 * NOTE: `password` and `refreshToken` are sensitive and must never be
 * returned in any API response (use SafeUser instead).
 * `password` is optional: OAuth-only accounts (Google/Apple) have no local
 * password and authenticate solely via their provider identity.
 */
export interface IUser {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  appleId?: string;
  role: UserRole;
  isBlocked: boolean;
  refreshToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Minimal authenticated principal attached to `req.user` by the
 * authentication middleware.
 */
export interface AuthUser {
  id: string;
  role: UserRole;
}

/**
 * API-safe representation of a User. Contains no secrets
 * (no `password`, no `refreshToken`).
 */
export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBlocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}
