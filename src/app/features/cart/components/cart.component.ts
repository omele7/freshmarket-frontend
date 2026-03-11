import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { AuthService } from '../../../core/services/auth.service';
import { Cart } from '../../../shared/models';
import { Subject, takeUntil } from 'rxjs';
import { DialogService } from '../../../shared/services/dialog.service';

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit, OnDestroy {
  private readonly cartService = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly authService = inject(AuthService);
  private readonly dialogService = inject(DialogService);
  private readonly destroy$ = new Subject<void>();

  protected cart = signal<Cart>({
    items: [],
    totalItems: 0,
    subtotal: 0,
    tax: 0,
    total: 0,
  });

  protected isCheckingOut = signal<boolean>(false);
  protected isLoading = signal<boolean>(false);

  ngOnInit(): void {
    this.cartService.cart$.pipe(takeUntil(this.destroy$)).subscribe((cart) => {
      this.cart.set(cart);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected increaseQuantity(productId: number): void {
    const item = this.cart().items.find((i) => i.product.id === productId);
    if (item) {
      this.isLoading.set(true);
      this.cartService.updateQuantity(productId, item.quantity + 1).subscribe({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error al actualizar cantidad:', err);
          this.dialogService.toast('Error al actualizar la cantidad', 'error');
          this.isLoading.set(false);
        },
      });
    }
  }

  protected decreaseQuantity(productId: number): void {
    const item = this.cart().items.find((i) => i.product.id === productId);
    if (item) {
      this.isLoading.set(true);
      this.cartService.updateQuantity(productId, item.quantity - 1).subscribe({
        next: () => {
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error al actualizar cantidad:', err);
          this.dialogService.toast('Error al actualizar la cantidad', 'error');
          this.isLoading.set(false);
        },
      });
    }
  }

  protected async removeItem(productId: number): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Eliminar producto',
      message: '¿Estás seguro de que deseas eliminar este producto del carrito?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
    });
    if (!confirmed) return;

    this.isLoading.set(true);
    this.cartService.removeFromCart(productId).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogService.toast('Producto eliminado del carrito', 'success');
      },
      error: (err) => {
        console.error('Error al eliminar producto:', err);
        this.dialogService.toast('Error al eliminar el producto', 'error');
        this.isLoading.set(false);
      },
    });
  }

  protected async clearCart(): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: 'Vaciar carrito',
      message: '¿Estás seguro de que deseas vaciar todo el carrito?',
      confirmText: 'Vaciar',
      cancelText: 'Cancelar',
      type: 'warning',
    });
    if (!confirmed) return;

    this.isLoading.set(true);
    this.cartService.clearCart().subscribe({
      next: () => {
        this.isLoading.set(false);
        this.dialogService.toast('Carrito vaciado', 'success');
      },
      error: (err) => {
        console.error('Error al vaciar carrito:', err);
        this.dialogService.toast('Error al vaciar el carrito', 'error');
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Process checkout - Finalize purchase using backend checkout endpoint
   */
  protected async checkout(): Promise<void> {
    const currentUser = this.authService.getCurrentUser()();

    if (!currentUser) {
      this.dialogService.toast('Debes iniciar sesión para realizar un pedido', 'error');
      return;
    }

    if (this.cart().items.length === 0) {
      this.dialogService.toast('El carrito está vacío', 'error');
      return;
    }

    const confirmed = await this.dialogService.confirm({
      title: 'Confirmar pedido',
      message: `Total a pagar: S/ ${this.cart().total.toFixed(2)}\n¿Deseas confirmar tu pedido?`,
      confirmText: 'Confirmar pedido',
      cancelText: 'Cancelar',
      type: 'success',
      icon: '🛒',
    });
    if (!confirmed) return;

    this.isCheckingOut.set(true);

    this.cartService.checkout().subscribe({
      next: (response) => {
        this.dialogService.toast(
          `¡Pedido #${response.orderNumber} confirmado! Tus productos están en camino 🚚`,
          'success',
          4000,
        );
        this.isCheckingOut.set(false);
      },
      error: (error) => {
        console.error('Error al procesar pedido:', error);
        this.dialogService.toast(error.message || 'Error al procesar el pedido', 'error');
        this.isCheckingOut.set(false);
      },
    });
  }
}
