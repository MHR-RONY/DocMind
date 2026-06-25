import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { config } from '../config/env';
import { User, IUserDocument } from '../models/User.model';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/tokenUtils';
import { ApiError } from '../utils/ApiError';
import { SafeUser } from '../types/user.types';

/**
 * Authentication service.
 *
 * Owns all auth business logic: registration, login, refresh-token rotation,
 * logout, and password reset. Passwords are hashed by the User model's
 * pre-save hook — this service never hashes directly. The refresh token is
 * returned to the controller (which sets it as an httpOnly cookie); it must
 * never be placed in a response body, which is the controller's concern.
 */

/** Short-lived signed token used to authorize a password reset. */
const RESET_TOKEN_EXPIRY: SignOptions['expiresIn'] = '15m';
const RESET_TOKEN_PURPOSE = 'password-reset';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult extends AuthTokens {
  user: SafeUser;
}

/**
 * Maps a User document to its API-safe representation, omitting all secrets
 * (password, refreshToken) and normalizing `_id` → `id`.
 */
const toSafeUser = (user: IUserDocument): SafeUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isBlocked: user.isBlocked,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/** Issues a fresh access + refresh token pair for a user. */
const issueTokens = (user: IUserDocument): AuthTokens => ({
  accessToken: generateAccessToken({ userId: user.id, role: user.role }),
  refreshToken: generateRefreshToken({ userId: user.id }),
});

/**
 * Registers a new user. Tokens are issued and the refresh token is persisted
 * for later rotation/reuse detection.
 *
 * @throws ApiError.conflict if the email is already registered.
 */
export const register = async (
  name: string,
  email: string,
  password: string,
): Promise<AuthResult> => {
  const existing = await User.findOne({ email }).exec();
  if (existing !== null) {
    throw ApiError.conflict('Email is already registered');
  }

  const user = await User.create({ name, email, password });

  const tokens = issueTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { user: toSafeUser(user), ...tokens };
};

/**
 * Authenticates a user by email + password and rotates the stored refresh
 * token.
 *
 * @throws ApiError.unauthorized on unknown email or bad password.
 * @throws ApiError.forbidden if the account is blocked.
 */
export const login = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  const user = await User.findOne({ email })
    .select('+password +refreshToken')
    .exec();

  if (user === null) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  if (user.isBlocked) {
    throw ApiError.forbidden('Account is blocked');
  }

  const tokens = issueTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return { user: toSafeUser(user), ...tokens };
};

/**
 * Validates a refresh token and rotates it. Detects token reuse: if the
 * presented token does not match the one stored for the user, the request is
 * rejected.
 *
 * @throws ApiError.unauthorized on invalid/expired/reused tokens.
 */
export const refresh = async (token: string): Promise<AuthTokens> => {
  const { userId } = verifyRefreshToken(token);

  const user = await User.findById(userId).select('+refreshToken').exec();
  if (user === null || user.refreshToken !== token) {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const tokens = issueTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save();

  return tokens;
};

/**
 * Logs a user out by clearing their stored refresh token, invalidating any
 * outstanding refresh token.
 */
export const logout = async (userId: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, { refreshToken: null }).exec();
};

/**
 * Initiates a password reset. To avoid account enumeration this always
 * resolves regardless of whether the email exists. When the user exists a
 * short-lived reset token is generated; email delivery is out of scope here.
 */
export const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email }).exec();
  if (user === null) {
    // Intentionally do not reveal that the email is unknown.
    return;
  }

  const options: SignOptions = { expiresIn: RESET_TOKEN_EXPIRY };
  const resetToken = jwt.sign(
    { userId: user.id, purpose: RESET_TOKEN_PURPOSE },
    config.jwt.accessSecret,
    options,
  );

  // Email delivery integration point. The token is intentionally not logged
  // to avoid leaking a credential into server logs.
  void resetToken;
  // eslint-disable-next-line no-console
  console.info(`Password reset requested for user ${user.id}.`);
};

const isResetPayload = (value: unknown): value is JwtPayload =>
  value !== null && typeof value === 'object';

/**
 * Completes a password reset: verifies the reset token, sets the new password
 * (hashed by the pre-save hook), and invalidates any active refresh token.
 *
 * @throws ApiError.unauthorized on invalid/expired tokens.
 * @throws ApiError.notFound if the referenced user no longer exists.
 */
export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<void> => {
  let decoded: string | JwtPayload;
  try {
    decoded = jwt.verify(token, config.jwt.accessSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired reset token');
  }

  if (
    !isResetPayload(decoded) ||
    typeof decoded.userId !== 'string' ||
    decoded.purpose !== RESET_TOKEN_PURPOSE
  ) {
    throw ApiError.unauthorized('Invalid reset token');
  }

  const user = await User.findById(decoded.userId).select('+refreshToken').exec();
  if (user === null) {
    throw ApiError.notFound('User not found');
  }

  user.password = newPassword;
  user.refreshToken = undefined;
  await user.save();
};

/**
 * Loads the currently-authenticated user's API-safe profile. Secrets are
 * stripped at the query layer as defense in depth.
 *
 * @throws ApiError.notFound if the user no longer exists.
 * @throws ApiError.forbidden if the account has since been blocked.
 */
export const getMe = async (userId: string): Promise<SafeUser> => {
  const user = await User.findById(userId)
    .select('-password -refreshToken')
    .exec();

  if (user === null) {
    throw ApiError.notFound('User not found');
  }

  if (user.isBlocked) {
    throw ApiError.forbidden('Account is blocked');
  }

  return toSafeUser(user);
};
