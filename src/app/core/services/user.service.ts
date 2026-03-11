import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environments';
import {
  User,
  UpdateUserRequest,
  UpdateUserResponse,
  SaveAddressRequest,
  Address,
} from '../../shared/models';

/**
 * UserService - Manages user profile and address operations
 *
 * Features:
 * - Get user profile
 * - Update user profile (name, phone)
 * - Add/Update shipping address
 * - Delete shipping address
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.userServiceUrl}/users`;

  /**
   * Get current user profile
   * Uses /auth/me endpoint which returns current authenticated user
   */
  getCurrentUserProfile(): Observable<User> {
    return this.http.get<User>(`${environment.userServiceUrl}/auth/me`);
  }

  /**
   * Update user profile (firstName, lastName, phone)
   * Requires authentication
   */
  updateProfile(userId: string, data: UpdateUserRequest): Observable<UpdateUserResponse> {
    return this.http.put<UpdateUserResponse>(`${this.API_URL}/${userId}/profile`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Add or update shipping address for user
   * If user has no address, creates new one
   * If user has address, updates existing one
   */
  saveAddress(userId: string, address: SaveAddressRequest): Observable<{ address: Address }> {
    return this.http.post<{ address: Address }>(`${this.API_URL}/${userId}/address`, address, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get user's shipping address
   */
  getAddress(userId: string): Observable<Address | null> {
    return this.http.get<Address | null>(`${this.API_URL}/${userId}/address`);
  }

  /**
   * Delete user's shipping address
   */
  deleteAddress(userId: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${userId}/address`);
  }
}
