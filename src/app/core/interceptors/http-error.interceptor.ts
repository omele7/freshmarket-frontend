import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * HTTP Error Interceptor - Global error handling
 *
 * Features:
 * - Handles 401 Unauthorized errors (auto logout)
 * - Handles 403 Forbidden errors
 * - Handles network errors
 * - Provides user-friendly error messages
 * - Logs errors for debugging
 */
export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ha ocurrido un error';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Error de red: ${error.error.message}`;
        console.error('Client-side error:', error.error.message);
      } else {
        // Server-side error
        switch (error.status) {
          case 0:
            errorMessage =
              'No se pudo conectar al servidor. Verifica que el backend esté corriendo.';
            console.error('Network error: Unable to connect to server');
            break;

          case 401:
            // Unauthorized - Token expired or invalid
            errorMessage = 'Sesión expirada. Por favor, inicia sesión nuevamente.';
            console.error('401 Unauthorized');

            // Skip logout for login/register endpoints
            const isAuthEndpoint =
              req.url.includes('/auth/login') || req.url.includes('/auth/register');

            if (!isAuthEndpoint) {
              // Auto logout and redirect to login
              authService.clearAllAuthData();
              router.navigate(['/login'], {
                queryParams: {
                  returnUrl: router.url,
                  sessionExpired: 'true',
                },
              });
            }
            break;

          case 403:
            errorMessage = 'No tienes permisos para realizar esta acción.';
            console.error('403 Forbidden: Access denied');
            break;

          case 404:
            errorMessage = 'El recurso solicitado no fue encontrado.';
            console.error('404 Not Found:', req.url);
            break;

          case 409:
            errorMessage = 'Conflicto: El recurso ya existe.';
            console.error('409 Conflict');
            break;

          case 422:
            errorMessage = 'Los datos enviados no son válidos.';
            console.error('422 Unprocessable Entity');
            break;

          case 429:
            errorMessage = 'Demasiadas solicitudes. Intenta más tarde.';
            console.error('429 Too Many Requests');
            break;

          case 500:
            errorMessage = 'Error interno del servidor. Intenta más tarde.';
            console.error('500 Internal Server Error');
            break;

          case 502:
            errorMessage = 'El servidor no está disponible temporalmente.';
            console.error('502 Bad Gateway');
            break;

          case 503:
            errorMessage = 'Servicio no disponible. Intenta más tarde.';
            console.error('503 Service Unavailable');
            break;

          default:
            errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
            console.error(`HTTP Error ${error.status}:`, error.message);
        }
      }

      // Return error with user-friendly message
      return throwError(() => ({
        ...error,
        userMessage: errorMessage,
      }));
    }),
  );
};
