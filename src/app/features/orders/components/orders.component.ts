import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../../core/services/order.service';
import { OrderGroup } from '../../../shared/models/order.model';
import { DialogService } from '../../../shared/services/dialog.service';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly dialogService = inject(DialogService);

  protected orders = signal<OrderGroup[]>([]);
  protected loading = signal<boolean>(false);
  protected errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  protected loadOrders(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.orderService.getUserOrders().subscribe({
      next: (orders: OrderGroup[]) => {
        this.orders.set(orders);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar pedidos:', error);
        this.errorMessage.set('No se pudieron cargar los pedidos. Por favor, intenta nuevamente.');
        this.loading.set(false);
      },
    });
  }

  protected formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  protected calculateTotal(): string {
    const total = this.orders().reduce((sum, order) => sum + order.total, 0);
    return total.toFixed(2);
  }

  /**
   * Delete a specific order
   */
  protected async deleteOrder(orderNumber: number): Promise<void> {
    const confirmed = await this.dialogService.confirm({
      title: `Eliminar Pedido #${orderNumber}`,
      message:
        '¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      type: 'danger',
    });
    if (!confirmed) return;

    this.loading.set(true);

    this.orderService.deleteOrder(orderNumber).subscribe({
      next: () => {
        const updatedOrders = this.orders().filter((order) => order.orderNumber !== orderNumber);
        this.orders.set(updatedOrders);
        this.loading.set(false);
        this.dialogService.toast(`Pedido #${orderNumber} eliminado exitosamente`, 'success');
      },
      error: (error) => {
        console.error('Error al eliminar pedido:', error);
        this.loading.set(false);
        this.dialogService.toast(error.message || 'Error al eliminar el pedido', 'error');
      },
    });
  }

  /**
   * Delete all orders for the current user
   */
  protected async deleteAllOrders(): Promise<void> {
    const ordersCount = this.orders().length;

    if (ordersCount === 0) {
      this.dialogService.toast('No hay pedidos para eliminar', 'warning');
      return;
    }

    const confirmed = await this.dialogService.confirm({
      title: 'Eliminar todos los pedidos',
      message: `Estás a punto de eliminar ${ordersCount} pedido(s). Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar todos',
      cancelText: 'Cancelar',
      type: 'danger',
    });
    if (!confirmed) return;

    this.loading.set(true);

    this.orderService.deleteAllOrders().subscribe({
      next: (response) => {
        this.orders.set([]);
        this.loading.set(false);
        this.dialogService.toast(response.message, 'success');
      },
      error: (error) => {
        console.error('Error al eliminar pedidos:', error);
        this.loading.set(false);
        this.dialogService.toast(error.message || 'Error al eliminar los pedidos', 'error');
      },
    });
  }
}
