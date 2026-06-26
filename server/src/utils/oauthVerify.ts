import { OAuth2Client, TokenPayload } from 'google-auth-library';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient, { JwksClient } from 'jwks-rsa';
import { config } from '../config/env';
import { ApiError } from './ApiError';

/**
 * Verifies third-party OAuth identity tokens (Google, Apple) and extracts a
 * normalized identity. All network/crypto verification happens here so the
 * auth service stays focused on user persistence and token issuance.
 *
 * Each verifier throws:
 *  - ApiError.notImplemented (503) if its provider is not configured, so the
 *    server boots without social-login credentials.
 *  - ApiError.unauthorized (401) for any invalid/forged/expired token.
 */

export interface OAuthIdentity {
  /** Stable provider-specific subject id. */
  providerId: string;
  email: string;
  /** Display name when the provider supplies one; falls back to the email local-part. */
  name: string;
  emailVerified: boolean;
}

const googleClient = new OAuth2Client();

/** Verifies a Google ID token (the credential from Google Identity Services). */
export const verifyGoogleIdToken = async (
  idToken: string,
): Promise<OAuthIdentity> => {
  const clientId = config.oauth.googleClientId;
  if (!clientId) {
    throw ApiError.notImplemented('Google sign-in is not configured');
  }

  let payload: TokenPayload | undefined;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: clientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw ApiError.unauthorized('Invalid Google credential');
  }

  if (!payload || typeof payload.sub !== 'string' || !payload.email) {
    throw ApiError.unauthorized('Invalid Google credential');
  }

  return {
    providerId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name?.trim() || payload.email.split('@')[0],
    emailVerified: payload.email_verified === true,
  };
};

const APPLE_ISSUER = 'https://appleid.apple.com';
let appleJwks: JwksClient | null = null;

const getAppleSigningKey = async (kid: string): Promise<string> => {
  if (!appleJwks) {
    appleJwks = jwksClient({
      jwksUri: `${APPLE_ISSUER}/auth/keys`,
      cache: true,
      rateLimit: true,
    });
  }
  const key = await appleJwks.getSigningKey(kid);
  return key.getPublicKey();
};

const isJwtPayload = (value: unknown): value is JwtPayload =>
  typeof value === 'object' && value !== null;

/** Verifies an Apple ID token against Apple's published JWKS. */
export const verifyAppleIdToken = async (
  idToken: string,
): Promise<OAuthIdentity> => {
  const clientId = config.oauth.appleClientId;
  if (!clientId) {
    throw ApiError.notImplemented('Apple sign-in is not configured');
  }

  const decodedHeader = jwt.decode(idToken, { complete: true });
  if (
    !decodedHeader ||
    typeof decodedHeader === 'string' ||
    typeof decodedHeader.header.kid !== 'string'
  ) {
    throw ApiError.unauthorized('Invalid Apple credential');
  }

  let publicKey: string;
  try {
    publicKey = await getAppleSigningKey(decodedHeader.header.kid);
  } catch {
    throw ApiError.unauthorized('Unable to verify Apple credential');
  }

  let payload: string | JwtPayload;
  try {
    payload = jwt.verify(idToken, publicKey, {
      algorithms: ['RS256'],
      issuer: APPLE_ISSUER,
      audience: clientId,
    });
  } catch {
    throw ApiError.unauthorized('Invalid Apple credential');
  }

  if (
    !isJwtPayload(payload) ||
    typeof payload.sub !== 'string' ||
    typeof payload.email !== 'string'
  ) {
    throw ApiError.unauthorized('Invalid Apple credential');
  }

  return {
    providerId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.email.split('@')[0],
    emailVerified: payload.email_verified === true || payload.email_verified === 'true',
  };
};
