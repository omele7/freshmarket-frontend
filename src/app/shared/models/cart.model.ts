import { Product } from './product.model';

export interface CartItem {
  id?: number; // ID del item en el carrito (backend)
  product: Product;
  quantity: number;
  subtotal?: number; // Calculado por el backend
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Backend DTO for cart item
 */
export interface CartItemDto {
  id: number;
  userId: number;
  productId: number;
  productName: string;
  productPrice: number;
  productImageUrl: string;
  productCategory?: string;
  productStock?: number;
  quantity: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Backend DTO for cart summary
 */
export interface CartSummaryDto {
  items: CartItemDto[];
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * DTO for adding item to cart
 */
export interface AddToCartDto {
  productId: number;
  quantity: number;
}

/**
 * DTO for updating cart item quantity
 */
export interface UpdateCartItemDto {
  quantity: number;
}
