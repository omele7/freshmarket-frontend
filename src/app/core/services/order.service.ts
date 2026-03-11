import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import {
  Order,
  CreateOrderDto,
  CreateOrderResponse,
  CreateOrderItemDto,
  OrderGroup,
} from '../../shared/models/order.model';
import { environment } from '../../../environments/environments';

/**
 * OrderService - Manages order operations
 *
 * Features:
 * - Create new orders
 * - Get user orders history
 * - Get order by ID
 * - Error handling
 */
@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = `${environment.orderServiceUrl}/orders`;

  /**
   * Create a new order
   * @param orderData Order information
   * @returns Observable with created order
   */
  createOrder(orderData: CreateOrderDto): Observable<CreateOrderResponse> {
    return this.http
      .post<CreateOrderResponse>(this.API_URL, orderData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new order item (Backend API format)
   * @param orderData Order item information
   * @returns Observable with created order item
   */
  createOrderItem(orderData: CreateOrderItemDto): Observable<CreateOrderResponse> {
    return this.http
      .post<CreateOrderResponse>(this.API_URL, orderData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get all orders for the current user (grouped by checkout)
   * @returns Observable with array of grouped orders
   */
  getUserOrders(): Observable<OrderGroup[]> {
    return this.http.get<any[]>(`${this.API_URL}/user`).pipe(
      map((orders) => this.mapOrderGroupsFromBackend(orders)),
      catchError(this.handleError),
    );
  }

  /**
   * Map order groups from backend (PascalCase) to frontend model (camelCase)
   * Backend already returns data grouped by OrderNumber
   */
  private mapOrderGroupsFromBackend(orderGroups: any[]): OrderGroup[] {
    if (!Array.isArray(orderGroups) || orderGroups.length === 0) {
      return [];
    }

    return orderGroups.map((group) => ({
      orderNumber: group.OrderNumber ?? group.orderNumber ?? 0,
      items: (group.Items ?? group.items ?? []).map((item: any) => ({
        productId: item.ProductId ?? item.productId ?? 0,
        productName: item.ProductName ?? item.productName ?? '',
        quantity: item.Quantity ?? item.quantity ?? 0,
        unitPrice: item.UnitPrice ?? item.unitPrice ?? 0,
        subtotal: item.Subtotal ?? item.subtotal ?? 0,
      })),
      totalItems: group.TotalItems ?? group.totalItems ?? 0,
      subtotal: group.Subtotal ?? group.subtotal ?? 0,
      tax: group.Tax ?? group.tax ?? 0,
      total: group.Total ?? group.total ?? 0,
      createdAt: group.CreatedAt ?? group.createdAt ?? new Date().toISOString(),
    }));
  }

  /**
   * Get a specific order by ID
   * @param orderId Order ID
   * @returns Observable with order details
   */
  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.API_URL}/${orderId}`).pipe(catchError(this.handleError));
  }

  /**
   * Cancel an order
   * @param orderId Order ID
   * @returns Observable with update confirmation
   */
  cancelOrder(orderId: string): Observable<Order> {
    return this.http
      .patch<Order>(`${this.API_URL}/${orderId}/cancel`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a specific order by order number
   * @param orderNumber Order number to delete
   * @returns Observable with void (204 No Content)
   */
  deleteOrder(orderNumber: number): Observable<void> {
    return this.http
      .delete<void>(`${this.API_URL}/order/${orderNumber}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete all orders for the current user
   * @returns Observable with deletion confirmation
   */
  deleteAllOrders(): Observable<{ message: string; deletedCount: number }> {
    return this.http.delete<any>(`${this.API_URL}/user/all`).pipe(
      map((response) => ({
        message: response.Message ?? response.message ?? 'Pedidos eliminados',
        deletedCount: response.DeletedCount ?? response.deletedCount ?? 0,
      })),
      catchError(this.handleError),
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Error en el pedido';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = 'Datos del pedido inválidos.';
          break;
        case 401:
          errorMessage = 'Debes iniciar sesión para realizar pedidos.';
          break;
        case 404:
          errorMessage = 'Pedido no encontrado.';
          break;
        case 422:
          errorMessage = 'No hay suficiente stock para completar el pedido.';
          break;
        case 500:
          errorMessage = 'Error del servidor. Intenta más tarde.';
          break;
        case 0:
          errorMessage = 'No se pudo conectar al servidor de pedidos.';
          break;
        default:
          errorMessage = error.error?.message || `Error: ${error.status}`;
      }
    }

    console.error('Order service error:', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
