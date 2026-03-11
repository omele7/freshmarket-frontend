import { Component, inject, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../products/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../shared/models/product.model';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly cartService = inject(CartService);
  private readonly cdr = inject(ChangeDetectorRef);

  protected features = [
    {
      icon: '🚚',
      title: 'Entrega Rápida',
      description: 'Entrega en 24 horas a toda Lima',
    },
    {
      icon: '🌱',
      title: '100% Orgánico',
      description: 'Productos certificados y frescos',
    },
    {
      icon: '💰',
      title: 'Mejor Precio',
      description: 'Garantizamos los mejores precios',
    },
    {
      icon: '🔒',
      title: 'Pago Seguro',
      description: 'Compra con total confianza',
    },
  ];

  protected featuredProducts: Product[] = [];
  protected isLoading = true;
  protected error: string | null = null;

  ngOnInit(): void {
    this.loadFeaturedProducts();
  }

  /**
   * Carga 4 productos aleatorios del backend sin repetir
   */
  protected loadFeaturedProducts(): void {
    this.isLoading = true;
    this.error = null;

    this.productService.getProducts().subscribe({
      next: (products) => {
        if (products && products.length > 0) {
          this.featuredProducts = this.getRandomProducts(products, 4);
        } else {
          this.featuredProducts = [];
        }

        this.isLoading = false;
        this.error = null;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error al cargar productos destacados:', error);

        this.featuredProducts = [];
        this.isLoading = false;
        this.error = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión.';
        this.cdr.markForCheck();
      },
    });
  }

  /**
   * Obtiene productos aleatorios sin repetir
   * @param products Array de productos
   * @param count Cantidad de productos a obtener
   * @returns Array de productos aleatorios
   */
  private getRandomProducts(products: Product[], count: number): Product[] {
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, products.length));
  }

  /**
   * Agregar producto al carrito
   */
  protected addToCart(product: Product): void {
    this.cartService.addToCart(product, 1).subscribe({
      next: () => {
        alert(`${product.name} agregado al carrito`);
      },
      error: (err) => {
        console.error('Error al agregar al carrito:', err);
        alert(`Error al agregar al carrito: ${err.message}`);
      },
    });
  }
}
