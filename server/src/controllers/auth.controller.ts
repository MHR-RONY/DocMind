import { Response } from 'express';
import { config } from '../config/env';
import { catchAsync } from '../utils/catchAsync';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import * as authService from '../services/auth.service';

/**
 * Auth HTTP layer. Every action delegates to a single auth-service call and
 * renders the standard response envelope. The refresh token is conveyed ONLY
 * via an httpOnly cookie — never in a response body — to mitigate XSS token
 * theft.
 */

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_PATH = '/api/auth';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Sets the rotating refresh-token cookie (httpOnly, scoped to /api/auth). */
const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
    path: REFRESH_COOKIE_PATH,
  });
};

/** Clears the refresh-token cookie on logout. */
const clearRefreshCookie = (res: Response): void => {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'strict',
    path: REFRESH_COOKIE_PATH,
  });
};

export const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.register(
    name,
    email,
    password,
  );
  setRefreshCookie(res, refreshToken);
  ApiResponse.success(res, 201, 'Registered', { user, accessToken });
});

export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, accessToken, refreshToken } = await authService.login(
    email,
    password,
  );
  setRefreshCookie(res, refreshToken);
  ApiResponse.success(res, 200, 'Logged in', { user, accessToken });
});

export const googleLogin = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  const { user, accessToken, refreshToken } = await authService.oauthLogin(
    'google',
    idToken,
  );
  setRefreshCookie(res, refreshToken);
  ApiResponse.success(res, 200, 'Logged in', { user, accessToken });
});

export const appleLogin = catchAsync(async (req, res) => {
  const { idToken } = req.body;
  const { user, accessToken, refreshToken } = await authService.oauthLogin(
    'apple',
    idToken,
  );
  setRefreshCookie(res, refreshToken);
  ApiResponse.success(res, 200, 'Logged in', { user, accessToken });
});

export const refresh = catchAsync(async (req, res) => {
  const token: unknown = req.cookies?.[REFRESH_COOKIE_NAME];
  if (typeof token !== 'string' || token.length === 0) {
    throw ApiError.unauthorized('Missing refresh token');
  }
  const { accessToken, refreshToken } = await authService.refresh(token);
  setRefreshCookie(res, refreshToken);
  ApiResponse.success(res, 200, 'Token refreshed', { accessToken });
});

export const logout = catchAsync(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }
  await authService.logout(req.user.id);
  clearRefreshCookie(res);
  ApiResponse.success(res, 200, 'Logged out', {});
});

export const me = catchAsync(async (req, res) => {
  if (!req.user) {
    throw ApiError.unauthorized('Not authenticated');
  }
  const user = await authService.getMe(req.user.id);
  ApiResponse.success(res, 200, 'Current user', { user });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  // Always 200 regardless of account existence (no enumeration).
  ApiResponse.success(res, 200, 'If the account exists, a reset link has been sent', {});
});

export const resetPassword = catchAsync(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);
  ApiResponse.success(res, 200, 'Password reset', {});
});
