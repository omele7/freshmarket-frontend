import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { Cart, CartItem, CreateOrderDto } from '../../shared/models';

/**
 * CartComponent - Shopping cart view with modern UI
 *
 * Features:
 * - Display all cart items
 * - Show price breakdown (subtotal, tax, total)
 * - Remove items functionality
 * - Update quantity
 * - Clear cart
 * - Checkout button
 * - Empty state
 */
@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page-wrapper">
      <div class="page-header">
        <h1 class="page-title">🛒 Mi Carrito</h1>
        <p class="page-subtitle">
          @if (cart().totalItems > 0) {
            Tienes {{ cart().totalItems }}
            {{ cart().totalItems === 1 ? 'producto' : 'productos' }} en tu carrito
          } @else {
            Tu carrito está vacío
          }
        </p>
      </div>

      @if (cart().items.length === 0) {
        <!-- Empty State -->
        <div class="empty-state">
          <div class="empty-icon">🛒</div>
          <h2 class="empty-title">Tu carrito está vacío</h2>
          <p class="empty-text">
            ¡Agrega productos frescos a tu carrito y disfruta de la mejor calidad!
          </p>
          <a routerLink="/products" class="cta-button"> Ir a Productos </a>
        </div>
      } @else {
        <!-- Cart Content -->
        <div class="cart-layout">
          <!-- Cart Items Section -->
          <div class="cart-items-section">
            <div class="section-header">
              <h2 class="section-title">Productos en tu carrito</h2>
              <button class="clear-button" (click)="onClearCart()">🗑️ Vaciar carrito</button>
            </div>

            <div class="cart-items">
              @for (item of cart().items; track item.product.id) {
                <div class="cart-item">
                  <div class="item-image">
                    <img [src]="item.product.imageUrl" [alt]="item.product.name" />
                  </div>

                  <div class="item-details">
                    <h3 class="item-name">{{ item.product.name }}</h3>
                    <p class="item-category">{{ item.product.category }}</p>
                    <p class="item-price">S/ {{ item.product.price }} c/u</p>
                  </div>

                  <div class="item-actions">
                    <div class="quantity-control">
                      <button
                        class="quantity-btn"
                        (click)="onDecreaseQuantity(item)"
                        [disabled]="item.quantity <= 1"
                      >
                        −
                      </button>
                      <span class="quantity-value">{{ item.quantity }}</span>
                      <button
                        class="quantity-btn"
                        (click)="onIncreaseQuantity(item)"
                        [disabled]="item.quantity >= item.product.stock"
                      >
                        +
                      </button>
                    </div>

                    <div class="item-subtotal">
                      <span class="subtotal-label">Subtotal:</span>
                      <span class="subtotal-value"
                        >S/ {{ (item.product.price * item.quantity).toFixed(2) }}</span
                      >
                    </div>

                    <button class="remove-button" (click)="onRemoveItem(item.product.id)">
                      🗑️
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Summary Section -->
          <div class="cart-summary">
            <h2 class="summary-title">Resumen del pedido</h2>

            <div class="summary-details">
              <div class="summary-row">
                <span class="summary-label">Subtotal:</span>
                <span class="summary-value">S/ {{ cart().subtotal.toFixed(2) }}</span>
              </div>

              <div class="summary-row">
                <span class="summary-label">IGV (18%):</span>
                <span class="summary-value">S/ {{ cart().tax.toFixed(2) }}</span>
              </div>

              <div class="summary-divider"></div>

              <div class="summary-row summary-total">
                <span class="summary-label">Total:</span>
                <span class="summary-value">S/ {{ cart().total.toFixed(2) }}</span>
              </div>
            </div>

            <button class="checkout-button" (click)="onCheckout()" [disabled]="checkoutLoading()">
              @if (checkoutLoading()) {
                <span class="spinner"></span>
                <span>Procesando pedido...</span>
              } @else {
                <span>Proceder al Pago</span>
              }
            </button>

            <a routerLink="/products" class="continue-shopping"> ← Seguir comprando </a>
          </div>
        </div>
      }

      <!-- Success Message -->
      @if (showSuccessMessage()) {
        <div class="success-overlay" (click)="closeSuccessMessage()">
          <div class="success-modal" (click)="$event.stopPropagation()">
            <div class="success-icon">✅</div>
            <h2 class="success-title">¡Pedido realizado con éxito!</h2>
            <p class="success-text">Tu pedido ha sido confirmado y lo recibirás pronto.</p>
            <p class="success-order-id">
              Número de pedido: <strong>{{ lastOrderId() }}</strong>
            </p>
            <div class="success-actions">
              <button class="success-button" (click)="goToOrders()">Ver mis pedidos</button>
              <button class="success-button-secondary" (click)="closeSuccessMessage()">
                Seguir comprando
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page-wrapper {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem;
        min-height: calc(100vh - 200px);
      }

      .page-header {
        text-align: center;
        margin-bottom: 3rem;
      }

      .page-title {
        font-size: 2.5rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 0.5rem;
      }

      .page-subtitle {
        font-size: 1.125rem;
        color: #6b7280;
      }

      /* Empty State */
      .empty-state {
        text-align: center;
        padding: 4rem 2rem;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .empty-icon {
        font-size: 6rem;
        margin-bottom: 1.5rem;
        opacity: 0.5;
      }

      .empty-title {
        font-size: 1.75rem;
        font-weight: 600;
        color: #374151;
        margin-bottom: 1rem;
      }

      .empty-text {
        color: #6b7280;
        margin-bottom: 2rem;
        max-width: 500px;
        margin-left: auto;
        margin-right: auto;
      }

      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        padding: 1rem 3rem;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        font-size: 1.125rem;
        box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
        transition: all 0.3s ease;
      }

      .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
      }

      /* Cart Layout */
      .cart-layout {
        display: grid;
        grid-template-columns: 1fr 400px;
        gap: 2rem;
        align-items: start;
      }

      /* Cart Items Section */
      .cart-items-section {
        background: white;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #f3f4f6;
      }

      .section-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #111827;
      }

      .clear-button {
        background: #fef2f2;
        color: #dc2626;
        border: none;
        padding: 0.625rem 1.25rem;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .clear-button:hover {
        background: #fee2e2;
        transform: scale(1.05);
      }

      /* Cart Items */
      .cart-items {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .cart-item {
        display: flex;
        gap: 1.5rem;
        padding: 1.5rem;
        background: #f9fafb;
        border-radius: 12px;
        transition: all 0.2s ease;
      }

      .cart-item:hover {
        background: #f3f4f6;
      }

      .item-image {
        width: 100px;
        height: 100px;
        flex-shrink: 0;
        border-radius: 12px;
        overflow: hidden;
        background: white;
      }

      .item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .item-details {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .item-name {
        font-size: 1.125rem;
        font-weight: 600;
        color: #111827;
        margin-bottom: 0.25rem;
      }

      .item-category {
        font-size: 0.875rem;
        color: #16a34a;
        text-transform: capitalize;
        margin-bottom: 0.5rem;
      }

      .item-price {
        font-size: 0.875rem;
        color: #6b7280;
      }

      /* Item Actions */
      .item-actions {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 0.75rem;
      }

      .quantity-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        background: white;
        border-radius: 8px;
        padding: 0.25rem;
        border: 1px solid #e5e7eb;
      }

      .quantity-btn {
        width: 32px;
        height: 32px;
        border: none;
        background: #f3f4f6;
        color: #374151;
        border-radius: 6px;
        font-size: 1.25rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .quantity-btn:hover:not(:disabled) {
        background: #22c55e;
        color: white;
      }

      .quantity-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .quantity-value {
        min-width: 40px;
        text-align: center;
        font-weight: 600;
        color: #111827;
      }

      .item-subtotal {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .subtotal-label {
        font-size: 0.75rem;
        color: #6b7280;
      }

      .subtotal-value {
        font-size: 1.125rem;
        font-weight: 700;
        color: #16a34a;
      }

      .remove-button {
        width: 36px;
        height: 36px;
        border: none;
        background: #fef2f2;
        color: #dc2626;
        border-radius: 8px;
        font-size: 1.125rem;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .remove-button:hover {
        background: #fee2e2;
        transform: scale(1.1);
      }

      /* Cart Summary */
      .cart-summary {
        background: white;
        border-radius: 16px;
        padding: 2rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        position: sticky;
        top: 2rem;
      }

      .summary-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: #111827;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #f3f4f6;
      }

      .summary-details {
        margin-bottom: 2rem;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
      }

      .summary-label {
        color: #6b7280;
        font-size: 1rem;
      }

      .summary-value {
        font-weight: 600;
        color: #111827;
        font-size: 1rem;
      }

      .summary-divider {
        height: 1px;
        background: #e5e7eb;
        margin: 1rem 0;
      }

      .summary-total {
        padding: 1rem 0;
        border-top: 2px solid #f3f4f6;
      }

      .summary-total .summary-label {
        font-size: 1.25rem;
        font-weight: 600;
        color: #111827;
      }

      .summary-total .summary-value {
        font-size: 1.75rem;
        font-weight: 700;
        color: #16a34a;
      }

      .checkout-button {
        width: 100%;
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        padding: 1rem;
        border: none;
        border-radius: 12px;
        font-weight: 600;
        font-size: 1.125rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
        margin-bottom: 1rem;
      }

      .checkout-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
      }

      .continue-shopping {
        display: block;
        text-align: center;
        color: #6b7280;
        text-decoration: none;
        padding: 0.75rem;
        transition: color 0.2s ease;
      }

      .continue-shopping:hover {
        color: #16a34a;
      }

      .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* Success Modal */
      .success-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .success-modal {
        background: white;
        border-radius: 24px;
        padding: 3rem;
        max-width: 500px;
        width: 90%;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        animation: slideUp 0.3s ease;
      }

      @keyframes slideUp {
        from {
          transform: translateY(50px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .success-icon {
        font-size: 5rem;
        margin-bottom: 1.5rem;
        animation: bounce 0.6s ease;
      }

      @keyframes bounce {
        0%,
        100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.2);
        }
      }

      .success-title {
        font-size: 1.75rem;
        font-weight: 700;
        color: #16a34a;
        margin-bottom: 1rem;
      }

      .success-text {
        color: #6b7280;
        margin-bottom: 1rem;
        line-height: 1.6;
      }

      .success-order-id {
        color: #374151;
        font-size: 0.875rem;
        margin-bottom: 2rem;
        padding: 1rem;
        background: #f0fdf4;
        border-radius: 12px;
      }

      .success-order-id strong {
        color: #16a34a;
        font-weight: 600;
      }

      .success-actions {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .success-button {
        width: 100%;
        padding: 1rem;
        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
        color: white;
        border: none;
        border-radius: 12px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 16px rgba(34, 197, 94, 0.3);
      }

      .success-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4);
      }

      .success-button-secondary {
        width: 100%;
        padding: 1rem;
        background: white;
        color: #16a34a;
        border: 2px solid #16a34a;
        border-radius: 12px;
        font-weight: 600;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .success-button-secondary:hover {
        background: #f0fdf4;
      }

      /* Responsive */
      @media (max-width: 1024px) {
        .cart-layout {
          grid-template-columns: 1fr;
        }

        .cart-summary {
          position: static;
        }
      }

      @media (max-width: 640px) {
        .page-wrapper {
          padding: 1.5rem 1rem;
        }

        .page-title {
          font-size: 2rem;
        }

        .cart-item {
          flex-direction: column;
          align-items: flex-start;
        }

        .item-actions {
          width: 100%;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }

        .item-image {
          width: 100%;
          height: 200px;
        }

        .section-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .clear-button {
          width: 100%;
        }

        .success-modal {
          padding: 2rem 1.5rem;
        }

        .success-icon {
          font-size: 4rem;
        }
      }
    `,
  ],
})
export class CartComponent implements OnInit, OnDestroy {
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();

  protected cart = signal<Cart>({
    items: [],
    totalItems: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  protected checkoutLoading = signal(false);
  protected showSuccessMessage = signal(false);
  protected lastOrderId = signal<string>('');

  ngOnInit(): void {
    // Subscribe to cart state
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe((cart) => {
      this.cart.set(cart);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Remove item from cart
   */
  protected onRemoveItem(productId: number): void {
    this.cartService.removeFromCart(productId).subscribe({
      error: (err) => {
        console.error('Error al eliminar:', err);
        alert('❌ Error al eliminar el producto');
      },
    });
  }

  /**
   * Increase item quantity
   */
  protected onIncreaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.product.id, item.quantity + 1).subscribe({
      error: (err) => {
        console.error('Error al actualizar:', err);
        alert('❌ Error al actualizar la cantidad');
      },
    });
  }

  /**
   * Decrease item quantity
   */
  protected onDecreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.product.id, item.quantity - 1).subscribe({
        error: (err) => {
          console.error('Error al actualizar:', err);
          alert('❌ Error al actualizar la cantidad');
        },
      });
    }
  }

  /**
   * Clear all items from cart
   */
  protected onClearCart(): void {
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
      this.cartService.clearCart().subscribe({
        error: (err) => {
          console.error('Error al vaciar:', err);
          alert('❌ Error al vaciar el carrito');
        },
      });
    }
  }

  /**
   * Proceed to checkout
   */
  protected onCheckout(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      if (confirm('Debes iniciar sesión para realizar un pedido. ¿Deseas ir al login?')) {
        this.router.navigate(['/login']);
      }
      return;
    }

    // Check if cart is empty
    if (this.cart().items.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    this.checkoutLoading.set(true);

    // Create order DTO
    const orderData: CreateOrderDto = {
      items: this.cart().items,
      subtotal: this.cart().subtotal,
      tax: this.cart().tax,
      deliveryFee: 0, // Free delivery
      total: this.cart().total,
      shippingAddress: {
        street: 'Calle Demo 123',
        city: 'Lima',
        state: 'Lima',
        zipCode: '15001',
        country: 'Perú',
      },
      paymentMethod: 'credit-card',
    };

    // Send order to backend
    this.orderService
      .createOrder(orderData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.checkoutLoading.set(false);
          this.lastOrderId.set(response.order.id);
          this.showSuccessMessage.set(true);

          // Clear cart on success
          this.cartService.clearCart().subscribe();
        },
        error: (error: Error) => {
          this.checkoutLoading.set(false);
          alert(`Error al procesar el pedido: ${error.message}`);
          console.error('Checkout failed:', error);
        },
      });
  }

  /**
   * Close success message modal
   */
  protected closeSuccessMessage(): void {
    this.showSuccessMessage.set(false);
  }

  /**
   * Navigate to orders page
   */
  protected goToOrders(): void {
    this.showSuccessMessage.set(false);
    this.router.navigate(['/orders']);
  }
}
