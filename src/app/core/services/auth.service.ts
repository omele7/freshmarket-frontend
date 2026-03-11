import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '../../shared/models';
import { environment } from '../../../environments/environments';

/**
 * AuthService - Manages user authentication
 *
 * Features:
 * - Login with JWT
 * - Register new users
 * - Store JWT in localStorage
 * - Auto-login from stored token
 * - Logout
 * - Authentication state management
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly API_URL = `${environment.userServiceUrl}/auth`;
  private readonly TOKEN_KEY = 'freshmarket_token';
  private readonly USER_KEY = 'freshmarket_user';

  // BehaviorSubject for reactive authentication state
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasValidToken());

  // Public observables
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  // Signals for component usage
  private currentUser = signal<User | null>(this.getUserFromStorage());
  private isAuthenticatedSignal = signal<boolean>(this.hasValidToken());

  constructor() {
    // Auto-login if token exists
    if (this.hasValidToken()) {
      this.loadUserFromStorage();
    }
  }

  /**
   * Get current user signal (readonly)
   */
  getCurrentUser() {
    return this.currentUser.asReadonly();
  }

  /**
   * Check if user is logged in (signal)
   */
  isLoggedIn() {
    return this.isAuthenticatedSignal.asReadonly();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/login`, credentials, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .pipe(
        tap((response) => {
          this.handleAuthSuccess(response);
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Register new user
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.API_URL}/register`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .pipe(
        tap((response) => {
          this.handleAuthSuccess(response);
        }),
        catchError((error) => this.handleError(error)),
      );
  }

  /**
   * Logout user
   */
  logout(): void {
    this.clearAllAuthData();

    // Navigate to login
    this.router.navigate(['/login']);
  }

  /**
   * Clear all authentication data from storage
   * Use this method when:
   * - User logs out
   * - Backend database is reset
   * - Token is invalid
   * - Need to clean all auth state
   */
  clearAllAuthData(): void {
    // Clear localStorage
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem('token'); // Legacy key
    localStorage.removeItem('currentUser'); // Legacy key
    localStorage.removeItem('refreshToken'); // If exists

    // Clear sessionStorage
    sessionStorage.clear();

    // Reset state
    this.currentUser.set(null);
    this.isAuthenticatedSignal.set(false);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Refresh user data from server
   */
  refreshUser(): Observable<User> {
    const token = this.getToken();

    if (!token) {
      console.error('Cannot refresh user: No token available');
      this.logout();
      return throwError(() => new Error('No authentication token'));
    }

    return this.http.get<User>(`${this.API_URL}/me`).pipe(
      tap((user) => {
        this.setUser(user);
      }),
      catchError((error) => {
        console.error('Failed to refresh user data:', error);
        return throwError(() => error);
      }),
    );
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse): void {
    // Store token and user
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));

    // Update state
    this.setUser(response.user);
    this.isAuthenticatedSignal.set(true);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Set current user
   */
  private setUser(user: User): void {
    this.currentUser.set(user);
    this.currentUserSubject.next(user);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get user from localStorage
   */
  private getUserFromStorage(): User | null {
    const userJson = localStorage.getItem(this.USER_KEY);
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Load user from localStorage on init
   */
  private loadUserFromStorage(): void {
    const user = this.getUserFromStorage();
    if (user) {
      this.currentUser.set(user);
      this.currentUserSubject.next(user);
      this.isAuthenticatedSignal.set(true);
      this.isAuthenticatedSubject.next(true);
    }
  }

  /**
   * Check if token exists and is valid
   */
  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    // Check if token is expired (optional - depends on JWT structure)
    try {
      const payload = this.decodeToken(token);
      if (payload.exp) {
        const isExpired = Date.now() >= payload.exp * 1000;
        return !isExpired;
      }
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Decode JWT token (basic implementation)
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return {};
    }
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error de autenticación';

    console.error('HTTP Error:', {
      status: error.status,
      statusText: error.statusText,
      url: error.url,
      error: error.error,
    });

    if (error.error instanceof ErrorEvent) {
      // Client-side or network error
      errorMessage = `Error de red: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 0:
          // Network error - no se pudo conectar al servidor
          errorMessage =
            'No se pudo conectar al servidor. Verifica que el backend esté corriendo en https://localhost:5001';
          console.error('CORS or Network Error - Backend no accesible');
          break;

        case 400:
          // Bad Request
          errorMessage = error.error?.message || 'Datos inválidos. Verifica tu información.';
          break;

        case 401:
          // Unauthorized
          errorMessage = error.error?.message || 'Email o contraseña incorrectos.';
          break;

        case 403:
          // Forbidden
          errorMessage = error.error?.message || 'No tienes permisos para esta acción.';
          break;

        case 409:
          // Conflict - Email ya registrado
          errorMessage = error.error?.message || 'El email ya está registrado.';
          break;

        case 422:
          // Unprocessable Entity - Datos inválidos con errores específicos
          if (error.error?.errors) {
            // Si el backend devuelve un objeto de errores, formatearlos
            const errors = error.error.errors;
            const errorMessages = Object.values(errors).flat();
            errorMessage = errorMessages.join(', ');
          } else {
            errorMessage = error.error?.message || 'Los datos enviados no son válidos.';
          }
          break;

        case 500:
          // Internal Server Error
          errorMessage = error.error?.message || 'Error del servidor. Intenta más tarde.';
          break;

        default:
          errorMessage = error.error?.message || `Error del servidor: ${error.status}`;
      }
    }

    console.error('Auth error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
