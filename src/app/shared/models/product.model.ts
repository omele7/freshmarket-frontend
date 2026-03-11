/**
 * Product category - accepts any string from backend (e.g., "Frutas", "Verduras")
 */
export type ProductCategory = string;

/**
 * Product model interface for fruits and vegetables ecommerce
 * @interface Product
 */
export interface Product {
  /**
   * Unique identifier for the product
   */
  readonly id: number;

  /**
   * Product name
   */
  name: string;

  /**
   * Detailed description of the product
   */
  description: string;

  /**
   * Price in local currency (e.g., PEN, USD)
   */
  price: number;

  /**
   * Product category (e.g., "Frutas", "Verduras")
   */
  category: ProductCategory;

  /**
   * URL to the product image
   */
  imageUrl: string;

  /**
   * Available stock quantity
   * @default 0
   */
  stock: number;

  /**
   * Creation timestamp in ISO 8601 format
   */
  createdAt: string;
}

/**
 * Type guard to check if a category is valid
 * @param category - Category to validate
 * @returns True if category is 'fruit' or 'vegetable'
 */
export function isValidCategory(category: string): category is ProductCategory {
  return category === 'fruit' || category === 'vegetable';
}

/**
 * Check if product is in stock
 * @param product - Product to check
 * @returns True if stock is greater than 0
 */
export function isInStock(product: Product): boolean {
  return product.stock > 0;
}

export interface ProductFilter {
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  searchTerm?: string;
  inStock?: boolean;
}
