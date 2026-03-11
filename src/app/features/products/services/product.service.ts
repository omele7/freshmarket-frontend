import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError, tap, map } from 'rxjs';
import { Product } from '../../../shared/models';
import { environment } from '../../../../environments/environments';

/**
 * DTO for creating a new product
 */
export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  stock: number;
}

/**
 * DTO for updating an existing product
 */
export interface UpdateProductDto extends Partial<CreateProductDto> {}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * ProductService - Handles all product-related HTTP operations
 *
 * @description Service for managing products in the FreshMarket ecommerce.
 * Provides full CRUD operations with strongly typed responses.
 *
 * @example
 * constructor(private productService: ProductService) {}
 *
 * // Get all products
 * this.productService.getProducts().subscribe(products => {
 *   console.log(products);
 * });
 */
@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.productServiceUrl}/products`;

  /**
   * Map backend response (PascalCase) to frontend model (camelCase)
   * @private
   */
  private mapProduct(data: any): Product {
    return {
      id: data.Id,
      name: data.Name,
      description: data.Description,
      price: data.Price,
      category: data.Category,
      imageUrl: data.ImageUrl,
      stock: data.Stock,
      createdAt: data.CreatedAt,
    };
  }

  /**
   * Get all products from the API
   * @returns Observable<Product[]> - Array of all products
   */
  getProducts(): Observable<Product[]> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map((products) => products.map((p) => this.mapProduct(p))),
      catchError(this.handleError),
    );
  }

  /**
   * Get a single product by ID
   * @param id - Product ID
   * @returns Observable<Product> - Single product
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map((data) => this.mapProduct(data)),
      catchError(this.handleError),
    );
  }

  /**
   * Create a new product
   * @param product - Product data to create
   * @returns Observable<Product> - Created product with generated ID
   */
  createProduct(product: CreateProductDto): Observable<Product> {
    return this.http.post<any>(this.baseUrl, product).pipe(
      map((data) => this.mapProduct(data)),
      catchError(this.handleError),
    );
  }

  /**
   * Update an existing product
   * @param id - Product ID to update
   * @param product - Partial product data to update
   * @returns Observable<Product> - Updated product
   */
  updateProduct(id: number, product: UpdateProductDto): Observable<Product> {
    return this.http.put<any>(`${this.baseUrl}/${id}`, product).pipe(
      map((data) => this.mapProduct(data)),
      catchError(this.handleError),
    );
  }

  /**
   * Delete a product by ID
   * @param id - Product ID to delete
   * @returns Observable<void> - Empty response on success
   */
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(catchError(this.handleError));
  }

  /**
   * Get products by category
   * @param category - Product category (e.g., 'Frutas', 'Verduras')
   * @returns Observable<Product[]> - Filtered products
   */
  getProductsByCategory(category: string): Observable<Product[]> {
    return this.http.get<any[]>(`${this.baseUrl}/category/${category}`).pipe(
      map((products) => products.map((p) => this.mapProduct(p))),
      catchError(this.handleError),
    );
  }

  /**
   * Search products by name or description
   * @param query - Search query string
   * @returns Observable<Product[]> - Matching products
   */
  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<any[]>(`${this.baseUrl}/search?q=${encodeURIComponent(query)}`).pipe(
      map((products) => products.map((p) => this.mapProduct(p))),
      catchError(this.handleError),
    );
  }

  /**
   * Check if a product is in stock
   * @param productId - Product ID to check
   * @returns Observable<boolean> - True if in stock
   */
  checkStock(productId: number): Observable<boolean> {
    return this.getProductById(productId).pipe(
      map((product) => product.stock > 0),
      catchError(this.handleError),
    );
  }

  /**
   * Handle HTTP errors
   * @private
   * @param error - HTTP error response
   * @returns Observable<never> - Error observable
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;

      // Specific error handling
      switch (error.status) {
        case 404:
          errorMessage = 'Product not found';
          break;
        case 400:
          errorMessage = 'Invalid product data';
          break;
        case 409:
          errorMessage = 'Product already exists';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later';
          break;
        case 0:
          errorMessage = 'Unable to connect to server. Please check your connection';
          break;
      }
    }

    console.error('ProductService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Get mock products for development/testing
   * @deprecated Use getProducts() instead
   * @returns Product[] - Array of mock products
   */
  getMockProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'Manzanas Rojas',
        description: 'Manzanas frescas y crujientes de la sierra',
        price: 4.5,
        imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
        category: 'Frutas',
        stock: 50,
        createdAt: '2026-02-25T10:00:00Z',
      },
      {
        id: 2,
        name: 'Plátanos',
        description: 'Plátanos de seda orgánicos',
        price: 2.8,
        imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=400',
        category: 'Frutas',
        stock: 100,
        createdAt: '2026-02-25T10:05:00Z',
      },
      {
        id: 3,
        name: 'Tomates',
        description: 'Tomates frescos para ensaladas',
        price: 3.2,
        imageUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400',
        category: 'Verduras',
        stock: 75,
        createdAt: '2026-02-25T10:10:00Z',
      },
      {
        id: 4,
        name: 'Lechugas',
        description: 'Lechugas orgánicas recién cosechadas',
        price: 2.5,
        imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400',
        category: 'Verduras',
        stock: 30,
        createdAt: '2026-02-25T10:15:00Z',
      },
      {
        id: 5,
        name: 'Naranjas',
        description: 'Naranjas jugosas para jugos',
        price: 3.8,
        imageUrl: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400',
        category: 'Frutas',
        stock: 60,
        createdAt: '2026-02-25T10:20:00Z',
      },
      {
        id: 6,
        name: 'Zanahorias',
        description: 'Zanahorias orgánicas premium',
        price: 2.9,
        imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400',
        category: 'Verduras',
        stock: 45,
        createdAt: '2026-02-25T10:25:00Z',
      },
      {
        id: 7,
        name: 'Fresas',
        description: 'Fresas frescas de temporada',
        price: 12.0,
        imageUrl: 'https://images.unsplash.com/photo-1518635017498-87f514b751ba?w=400',
        category: 'Frutas',
        stock: 0,
        createdAt: '2026-02-25T10:30:00Z',
      },
      {
        id: 8,
        name: 'Espinacas',
        description: 'Espinacas orgánicas ricas en hierro',
        price: 3.5,
        imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400',
        category: 'Verduras',
        stock: 8,
        createdAt: '2026-02-25T10:35:00Z',
      },
    ];
  }
}
