/** Shared TypeScript interfaces used across frontend and backend */

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SALES';
}

export interface JWTPayload {
  userId: string;
  role: 'ADMIN' | 'SALES';
  email: string;
  name: string;
}
