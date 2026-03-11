import { User } from './user.model';

/**
 * Login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request payload
 */
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Authentication response from server
 */
export interface AuthResponse {
  token: string;
  user: User;
  expiresIn?: number; // Token expiration in seconds
}

/**
 * JWT Token payload (decoded)
 */
export interface JwtPayload {
  sub: string; // User ID
  email: string;
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
}
