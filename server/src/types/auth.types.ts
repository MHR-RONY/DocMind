import { UserRole } from './enums';

/**
 * Payload encoded into the short-lived JWT access token.
 */
export interface JwtAccessPayload {
  userId: string;
  role: UserRole;
}

/**
 * Payload encoded into the long-lived JWT refresh token.
 */
export interface JwtRefreshPayload {
  userId: string;
}
