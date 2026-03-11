import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Auth Interceptor - Adds JWT token to HTTP requests
 *
 * Automatically adds Authorization header with Bearer token
 * to all outgoing HTTP requests if user is authenticated
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Public endpoints that don't require authentication
  const isPublicEndpoint =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    (req.url.includes('/products') && req.method === 'GET');

  // Only add token if available and not a public endpoint
  if (token && !isPublicEndpoint) {
    // Extract userId from JWT token
    let userId: string | null = null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub || payload.userId || payload.id;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
    }

    // Clone request and add Authorization header + X-User-Id header
    const headers: { [key: string]: string } = {
      Authorization: `Bearer ${token}`,
    };

    // Add X-User-Id header if userId was extracted successfully
    if (userId) {
      headers['X-User-Id'] = userId;
    }

    req = req.clone({ setHeaders: headers });
  }

  return next(req);
};
