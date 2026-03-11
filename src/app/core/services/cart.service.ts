import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import {
  Cart,
  CartItem,
  Product,
  CartSummaryDto,
  CartItemDto,
  AddToCartDto,
  UpdateCartItemDto,
} from '../../shared/models';
import { CheckoutResponse } from '../../shared/models/order.model';
import { environment } from '../../../environments/environments';
import { AuthService } from './auth.service';

/**
 * CartService - Manages shopping cart state with backend persistence
 *
 * Features:
 * - Backend cart storage (database)
 * - Reactive state management with BehaviorSubject
 * - Automatic sync with backend
 * - JWT authentication required
 */
@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly API_URL = `${environment.cartServiceUrl}/cart`;

  private readonly INITIAL_CART: Cart = {
    items: [],
    totalItems: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
  };

  // BehaviorSubject to manage cart state reactively
  private cartSubject = new BehaviorSubject<Cart>(this.INITIAL_CART);

  // Public observable for components to subscribe
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    // Auto-load cart only if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.loadCart().subscribe();
    }
  }

  /**
   * Load cart from backend
   */
  private loadCart(): Observable<Cart> {
    return this.http.get<CartSummaryDto>(this.API_URL).pipe(
      map((dto) => this.mapCartSummaryToCart(dto)),
      tap((cart) => {
        this.cartSubject.next(cart);
      }),
      catchError((error) => {
        if (error.status === 401) {
          this.cartSubject.next(this.INITIAL_CART);
          return of(this.INITIAL_CART);
        }
        console.error('Error al cargar carrito:', error);
        return of(this.INITIAL_CART);
      }),
    );
  }

  /**
   * Get current cart as observable
   */
  getCart(): Observable<Cart> {
    return this.cart$;
  }

  /**
   * Refresh cart from backend
   */
  refreshCart(): Observable<Cart> {
    return this.loadCart();
  }

  /**
   * Get cart items as observable
   */
  getItems(): Observable<CartItem[]> {
    return this.cart$.pipe(map((cart) => cart.items));
  }

  /**
   * Get total price as observable
   */
  getTotal(): Observable<number> {
    return this.cart$.pipe(map((cart) => cart.total));
  }

  /**
   * Get current cart snapshot (non-reactive)
   */
  getCartSnapshot(): Cart {
    return this.cartSubject.value;
  }

  /**
   * Add product to cart (calls backend)
   */
  addToCart(product: Product, quantity: number = 1): Observable<void> {
    const dto: AddToCartDto = {
      productId: product.id,
      quantity: quantity,
    };

    return this.http.post<CartItemDto>(`${this.API_URL}/items`, dto).pipe(
      switchMap(() => this.loadCart()),
      map(() => void 0),
      catchError(this.handleError),
    );
  }

  /**
   * Remove product from cart by ID
   */
  removeFromCart(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/items/${productId}`).pipe(
      switchMap(() => this.loadCart()),
      map(() => void 0),
      catchError(this.handleError),
    );
  }

  /**
   * Update quantity of a specific product
   */
  updateQuantity(productId: number, quantity: number): Observable<void> {
    if (quantity <= 0) {
      return this.removeFromCart(productId);
    }

    const dto: UpdateCartItemDto = { quantity };

    return this.http.put<CartItemDto>(`${this.API_URL}/items/${productId}`, dto).pipe(
      switchMap(() => this.loadCart()),
      map(() => void 0),
      catchError(this.handleError),
    );
  }

  /**
   * Clear all items from cart
   */
  clearCart(): Observable<void> {
    return this.http.delete<void>(this.API_URL).pipe(
      tap(() => {
        this.cartSubject.next(this.INITIAL_CART);
      }),
      catchError(this.handleError),
    );
  }

  /**
   * Get total number of items in cart (snapshot)
   */
  getTotalItems(): number {
    return this.cartSubject.value.totalItems;
  }

  /**
   * Check if cart is empty
   */
  isEmpty(): boolean {
    return this.cartSubject.value.items.length === 0;
  }

  /**
   * Checkout - Finalize purchase (convert cart to orders)
   * Calls the backend checkout endpoint which:
   * 1. Converts all cart items to orders
   * 2. Validates stock
   * 3. Clears the cart automatically
   * 4. Returns summary of created orders
   */
  checkout(): Observable<CheckoutResponse> {
    return this.http.post<any>(`${this.API_URL}/checkout`, {}).pipe(
      map((dto) => this.mapCheckoutResponseToModel(dto)),
      tap((response) => {
        // Update local cart to empty since backend cleared it
        this.cartSubject.next(this.INITIAL_CART);
      }),
      catchError(this.handleError),
    );
  }

  /**
   * Map backend CheckoutResponse (PascalCase) to frontend model (camelCase)
   */
  private mapCheckoutResponseToModel(dto: any): CheckoutResponse {
    return {
      orderNumber: dto.OrderNumber ?? dto.orderNumber ?? 0,
      orders: (dto.Orders || dto.orders || []).map((order: any) => ({
        id: order.Id ?? order.id,
        orderNumber: order.OrderNumber ?? order.orderNumber ?? 0,
        userId: order.UserId ?? order.userId,
        productId: order.ProductId ?? order.productId,
        productName: order.ProductName ?? order.productName,
        quantity: order.Quantity ?? order.quantity,
        unitPrice: order.UnitPrice ?? order.unitPrice,
        totalPrice: order.TotalPrice ?? order.totalPrice,
        createdAt: order.CreatedAt ?? order.createdAt,
      })),
      totalItems: dto.TotalItems ?? dto.totalItems ?? 0,
      subtotal: dto.Subtotal ?? dto.subtotal ?? 0,
      tax: dto.Tax ?? dto.tax ?? 0,
      total: dto.Total ?? dto.total ?? 0,
      message: dto.Message ?? dto.message ?? '',
    };
  }

  /**
   * Map backend CartSummaryDto to frontend Cart model
   */
  private mapCartSummaryToCart(dto: any): Cart {
    // Validate dto
    if (!dto) {
      return this.INITIAL_CART;
    }

    // Backend returns PascalCase (Items with capital I), so we need to handle both cases
    const items = dto.items || dto.Items || [];
    const totalItems = dto.totalItems ?? dto.TotalItems ?? 0;
    const subtotal = dto.subtotal ?? dto.Subtotal ?? 0;
    const tax = dto.tax ?? dto.Tax ?? 0;
    const total = dto.total ?? dto.Total ?? 0;

    if (!Array.isArray(items)) {
      return {
        items: [],
        totalItems,
        subtotal,
        tax,
        total,
      };
    }

    const cartItems: CartItem[] = items.map((item: any) => ({
      id: item.id || item.Id,
      product: {
        id: item.productId || item.ProductId,
        name: item.productName || item.ProductName,
        price: item.productPrice || item.ProductPrice,
        imageUrl: item.productImageUrl || item.ProductImageUrl,
        category: item.productCategory || item.ProductCategory || '',
        stock: item.productStock ?? item.ProductStock ?? 0,
        description: '',
        createdAt: new Date().toISOString(),
      },
      quantity: item.quantity || item.Quantity,
      subtotal: item.subtotal ?? item.Subtotal ?? 0,
      createdAt: item.createdAt || item.CreatedAt,
      updatedAt: item.updatedAt || item.UpdatedAt,
    }));

    return {
      items: cartItems,
      totalItems,
      subtotal,
      tax,
      total,
    };
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error en el carrito';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = 'Datos inválidos.';
          break;
        case 401:
          errorMessage = 'Debes iniciar sesión.';
          break;
        case 404:
          errorMessage = 'Producto no encontrado.';
          break;
        case 422:
          errorMessage = 'Stock insuficiente.';
          break;
        case 500:
          errorMessage = 'Error del servidor.';
          break;
        case 0:
          errorMessage = 'No se pudo conectar al servidor.';
          break;
        default:
          errorMessage = error.error?.message || `Error: ${error.status}`;
      }
    }

    console.error('Error en CartService:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
