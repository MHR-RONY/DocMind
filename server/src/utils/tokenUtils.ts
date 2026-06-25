import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { config } from '../config/env';
import { JwtAccessPayload, JwtRefreshPayload } from '../types/auth.types';
import { UserRole } from '../types/enums';
import { ApiError } from './ApiError';

type ExpiresIn = SignOptions['expiresIn'];

export const generateAccessToken = (payload: JwtAccessPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiry as ExpiresIn,
  };
  return jwt.sign({ userId: payload.userId, role: payload.role }, config.jwt.accessSecret, options);
};

export const generateRefreshToken = (payload: JwtRefreshPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiry as ExpiresIn,
  };
  return jwt.sign({ userId: payload.userId }, config.jwt.refreshSecret, options);
};

const isRecord = (value: unknown): value is JwtPayload =>
  typeof value === 'object' && value !== null;

const isUserRole = (value: unknown): value is UserRole =>
  value === UserRole.USER || value === UserRole.ADMIN;

export const verifyAccessToken = (token: string): JwtAccessPayload => {
  let decoded: string | JwtPayload;
  try {
    decoded = jwt.verify(token, config.jwt.accessSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }

  if (
    !isRecord(decoded) ||
    typeof decoded.userId !== 'string' ||
    !isUserRole(decoded.role)
  ) {
    throw ApiError.unauthorized('Invalid access token payload');
  }

  return { userId: decoded.userId, role: decoded.role };
};

export const verifyRefreshToken = (token: string): JwtRefreshPayload => {
  let decoded: string | JwtPayload;
  try {
    decoded = jwt.verify(token, config.jwt.refreshSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  if (!isRecord(decoded) || typeof decoded.userId !== 'string') {
    throw ApiError.unauthorized('Invalid refresh token payload');
  }

  return { userId: decoded.userId };
};
