import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Product } from '../../../shared/models/product.model';
import { ProductService } from '../services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { DialogService } from '../../../shared/services/dialog.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
})
export class ProductListComponent implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly dialogService = inject(DialogService);
  private readonly destroy$ = new Subject<void>();

  protected products = signal<Product[]>([]);
  protected loading = signal(true);
  protected error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load products from API
   */
  private loadProducts(): void {
    this.loading.set(true);
    this.error.set(null);

    this.productService
      .getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products) => {
          this.products.set(products);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err.message || 'Error al cargar productos');
          this.loading.set(false);
          console.error('Error loading products:', err);

          // Fallback to mock data if API fails
          this.products.set(this.productService.getMockProducts());
        },
      });
  }

  /**
   * Retry loading products
   */
  protected retryLoad(): void {
    this.loadProducts();
  }

  /**
   * Add product to cart
   */
  protected addToCart(product: Product): void {
    if (product.stock > 0) {
      this.cartService.addToCart(product, 1).subscribe({
        next: () => {
          this.dialogService.toast(`${product.name} agregado al carrito`, 'success');
        },
        error: (err) => {
          console.error('Error adding to cart:', err);
          this.dialogService.toast(`Error al agregar al carrito: ${err.message}`, 'error');
        },
      });
    } else {
      this.dialogService.toast('Producto sin stock disponible', 'warning');
    }
  }
}
