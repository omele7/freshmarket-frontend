export interface User {
  id: string; // Numeric ID as string (e.g., "1", "2")
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  address?: Address | null;
  createdAt: string; // ISO 8601 date string
}

export interface Address {
  id?: string; // Numeric ID as string
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
  createdAt?: string; // ISO 8601 date string
}

export interface UserProfile extends User {
  orderHistory: string[]; // Order IDs
  favoriteProducts: string[]; // Product IDs
}

/**
 * Update user profile request
 */
export interface UpdateUserRequest {
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Create/Update address request
 */
export interface SaveAddressRequest {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

/**
 * Update user response
 */
export interface UpdateUserResponse {
  user: User;
  message: string;
}
