import { z } from 'zod';

/**
 * Body schema for POST /api/auth/register.
 */
export const registerSchema = z
  .object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(128),
  })
  .strict();

/**
 * Body schema for POST /api/auth/login.
 */
export const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

/**
 * Body schema for OAuth login (POST /api/auth/google, /api/auth/apple).
 * The client posts the provider-issued ID token (JWT) for server-side
 * verification — never raw profile data, which cannot be trusted.
 */
export const oauthLoginSchema = z
  .object({
    idToken: z.string().min(1),
  })
  .strict();

/**
 * Body schema for a forgot-password request.
 */
export const forgotPasswordSchema = z
  .object({
    email: z.string().email(),
  })
  .strict();

/**
 * Body schema for a reset-password request.
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8).max(128),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type OAuthLoginInput = z.infer<typeof oauthLoginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
