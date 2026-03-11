import { CartItem } from './cart.model';
import { Address } from './user.model';

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery?: Date;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'credit-card' | 'debit-card' | 'paypal' | 'cash';

export interface OrderSummary {
  id: string;
  total: number;
  status: OrderStatus;
  createdAt: Date;
  itemCount: number;
}

/**
 * DTO for creating a new order
 */
export interface CreateOrderDto {
  items: CartItem[];
  subtotal: number;
  tax: number;
  deliveryFee?: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
}

/**
 * Backend DTO for creating a single order item
 * (Used by the OrderService backend API)
 */
export interface CreateOrderItemDto {
  userId: number;
  productId: number;
  quantity: number;
}

/**
 * Backend response for a single order item
 */
export interface OrderItemResponse {
  id: string;
  userId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

/**
 * Response from order creation
 */
export interface CreateOrderResponse {
  order: OrderItemResponse;
  message: string;
}

/**
 * DTO for checkout order (from backend)
 */
export interface CheckoutOrderDto {
  id: number;
  orderNumber: number; // Sequential order number
  userId: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

/**
 * Response from checkout endpoint
 */
export interface CheckoutResponse {
  orderNumber: number; // Sequential order number from backend
  orders: CheckoutOrderDto[];
  totalItems: number;
  subtotal: number;
  tax: number;
  total: number;
  message: string;
}

/**
 * Item within a grouped order
 */
export interface OrderItemDto {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/**
 * Grouped order (represents a single checkout with multiple items)
 */
export interface OrderGroup {
  orderNumber: number; // Number that groups products from the same checkout
  items: OrderItemDto[]; // Products in this order
  totalItems: number; // Total quantity of items
  subtotal: number;
  tax: number;
  total: number;
  createdAt: string;
}
