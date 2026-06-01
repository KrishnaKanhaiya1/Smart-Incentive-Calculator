import { SignJWT, jwtVerify } from 'jose';
import { JWTPayload } from './types';

const JWT_SECRET_KEY = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return new TextEncoder().encode(secret);
};

const COOKIE_NAME = 'nt_token';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Creates a signed JWT token with user claims.
 * Uses jose (Edge-runtime compatible, unlike jsonwebtoken).
 */
export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(JWT_SECRET_KEY());
}

/**
 * Verifies a JWT token and returns the decoded payload.
 * Returns null if the token is invalid or expired.
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Extracts the JWT from the request's cookies and verifies it.
 * Returns the user payload or null if not authenticated.
 */
export async function getUserFromRequest(request: Request): Promise<JWTPayload | null> {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [key, ...rest] = c.trim().split('=');
      return [key, rest.join('=')];
    })
  );
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Builds the Set-Cookie header string to persist the JWT.
 * httpOnly prevents XSS, Secure flag set in production.
 */
export function createAuthCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=${token}; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Lax; Path=/; Max-Age=${MAX_AGE}`;
}

/**
 * Builds the Set-Cookie header string to clear the auth cookie.
 */
export function clearAuthCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}
