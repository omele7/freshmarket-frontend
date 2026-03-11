/**
 * ProductService Usage Examples
 *
 * This file demonstrates how to use the ProductService with all CRUD operations.
 * Copy and paste these examples into your components.
 */

import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ProductService, CreateProductDto, UpdateProductDto } from './product.service';
import { Product } from '../../../shared/models';

/**
 * Example Component showing ProductService usage
 */
@Component({
  selector: 'app-product-examples',
  template: '',
})
export class ProductServiceExamples implements OnInit, OnDestroy {
  private readonly productService = inject(ProductService);
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    // Run examples
    this.getAllProductsExample();
    this.getProductByIdExample();
    this.createProductExample();
    this.updateProductExample();
    this.deleteProductExample();
    this.getProductsByCategoryExample();
    this.searchProductsExample();
    this.checkStockExample();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Example 1: Get all products
   */
  getAllProductsExample(): void {
    this.productService
      .getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products: Product[]) => {
          console.log('📦 All products:', products);
          console.log(`Total: ${products.length} products`);
        },
        error: (error) => {
          console.error('❌ Error:', error.message);
        },
      });
  }

  /**
   * Example 2: Get a single product by ID
   */
  getProductByIdExample(): void {
    const productId = 1;

    this.productService
      .getProductById(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product: Product) => {
          console.log('📦 Product details:', product);
          console.log(`Name: ${product.name}`);
          console.log(`Price: S/ ${product.price}`);
          console.log(`Stock: ${product.stock} units`);
        },
        error: (error) => {
          console.error('❌ Product not found:', error.message);
        },
      });
  }

  /**
   * Example 3: Create a new product
   */
  createProductExample(): void {
    const newProduct: CreateProductDto = {
      name: 'Mangos Kent',
      description: 'Mangos frescos de exportación',
      price: 15.5,
      category: 'Frutas',
      imageUrl: 'https://images.unsplash.com/photo-1591073113125-e46713c829ed?w=400',
      stock: 25,
    };

    this.productService
      .createProduct(newProduct)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product: Product) => {
          console.log('✅ Product created successfully!');
          console.log('New product ID:', product.id);
          console.log('Product:', product);
        },
        error: (error) => {
          console.error('❌ Failed to create product:', error.message);
        },
      });
  }

  /**
   * Example 4: Update an existing product
   */
  updateProductExample(): void {
    const productId = 1;

    const updates: UpdateProductDto = {
      price: 5.99,
      stock: 100,
    };

    this.productService
      .updateProduct(productId, updates)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (product: Product) => {
          console.log('✅ Product updated successfully!');
          console.log('Updated product:', product);
        },
        error: (error) => {
          console.error('❌ Failed to update product:', error.message);
        },
      });
  }

  /**
   * Example 5: Delete a product
   */
  deleteProductExample(): void {
    const productId = 7; // Fresas (out of stock)

    if (confirm('¿Estás seguro de eliminar este producto?')) {
      this.productService
        .deleteProduct(productId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            console.log('✅ Product deleted successfully!');
          },
          error: (error) => {
            console.error('❌ Failed to delete product:', error.message);
          },
        });
    }
  }

  /**
   * Example 6: Get products by category
   */
  getProductsByCategoryExample(): void {
    this.productService
      .getProductsByCategory('Frutas')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products: Product[]) => {
          console.log('🍎 Fruits:', products);
          console.log(`Found ${products.length} fruits`);
        },
        error: (error) => {
          console.error('❌ Error:', error.message);
        },
      });

    this.productService
      .getProductsByCategory('Verduras')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products: Product[]) => {
          console.log('🥕 Vegetables:', products);
          console.log(`Found ${products.length} vegetables`);
        },
        error: (error) => {
          console.error('❌ Error:', error.message);
        },
      });
  }

  /**
   * Example 7: Search products
   */
  searchProductsExample(): void {
    const searchQuery = 'manzana';

    this.productService
      .searchProducts(searchQuery)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products: Product[]) => {
          console.log(`🔍 Search results for "${searchQuery}":`, products);
          console.log(`Found ${products.length} matches`);
        },
        error: (error) => {
          console.error('❌ Search failed:', error.message);
        },
      });
  }

  /**
   * Example 8: Check product stock availability
   */
  checkStockExample(): void {
    const productId = 1;

    this.productService
      .checkStock(productId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (inStock: boolean) => {
          if (inStock) {
            console.log('✅ Product is in stock!');
          } else {
            console.log('❌ Product is out of stock');
          }
        },
        error: (error) => {
          console.error('❌ Error checking stock:', error.message);
        },
      });
  }

  /**
   * Example 9: Bulk operations with multiple products
   */
  bulkOperationsExample(): void {
    // Get all products and filter locally
    this.productService
      .getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (products: Product[]) => {
          // Filter products under S/ 5.00
          const cheapProducts = products.filter((p) => p.price < 5);
          console.log('💰 Products under S/ 5.00:', cheapProducts);

          // Filter low stock products (< 10 units)
          const lowStock = products.filter((p) => p.stock < 10 && p.stock > 0);
          console.log('⚠️ Low stock products:', lowStock);

          // Calculate total inventory value
          const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
          console.log(`💵 Total inventory value: S/ ${totalValue.toFixed(2)}`);
        },
        error: (error) => {
          console.error('❌ Error:', error.message);
        },
      });
  }

  /**
   * Example 10: Error handling with retry logic
   */
  errorHandlingExample(): void {
    let retryCount = 0;
    const maxRetries = 3;

    const loadWithRetry = (): void => {
      this.productService
        .getProducts()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (products: Product[]) => {
            console.log('✅ Products loaded:', products.length);
            retryCount = 0; // Reset on success
          },
          error: (error) => {
            console.error(`❌ Attempt ${retryCount + 1} failed:`, error.message);

            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`🔄 Retrying... (${retryCount}/${maxRetries})`);
              setTimeout(() => loadWithRetry(), 2000);
            } else {
              console.error('❌ Max retries reached. Using fallback data.');
              // Use mock data as fallback
              const mockProducts = this.productService.getMockProducts();
              console.log('📦 Using mock data:', mockProducts.length);
            }
          },
        });
    };

    loadWithRetry();
  }
}

/**
 * Quick Reference: Common Patterns
 *
 * 1. Basic GET:
 *    this.productService.getProducts().subscribe(products => {...});
 *
 * 2. GET by ID:
 *    this.productService.getProductById('123').subscribe(product => {...});
 *
 * 3. CREATE:
 *    this.productService.createProduct(data).subscribe(newProduct => {...});
 *
 * 4. UPDATE:
 *    this.productService.updateProduct('123', {price: 10}).subscribe(updated => {...});
 *
 * 5. DELETE:
 *    this.productService.deleteProduct('123').subscribe(() => {...});
 *
 * 6. Filter by Category:
 *    this.productService.getProductsByCategory('fruit').subscribe(fruits => {...});
 *
 * 7. Search:
 *    this.productService.searchProducts('manzana').subscribe(results => {...});
 *
 * 8. Check Stock:
 *    this.productService.checkStock('123').subscribe(inStock => {...});
 */
