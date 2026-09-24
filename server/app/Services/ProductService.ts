import { INITIAL_PRODUCTS } from '../../../src/data/initialData';
import { Product } from '../../../src/types';

export interface ProductFilterCriteria {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  sortBy?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  page?: number;
  perPage?: number;
}

export class ProductService {
  private static products: Product[] = [...INITIAL_PRODUCTS];

  /**
   * List and filter products with pagination and sorting
   */
  public static paginate(criteria: ProductFilterCriteria) {
    let result = [...this.products];

    // Filter by Category
    if (criteria.category && criteria.category !== 'All') {
      result = result.filter(
        (p) => p.category.toLowerCase() === criteria.category!.toLowerCase()
      );
    }

    // Search query across name, tagline, description, features
    if (criteria.search && criteria.search.trim()) {
      const q = criteria.search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.tagline && p.tagline.toLowerCase().includes(q)) ||
          p.features.some((f) => f.toLowerCase().includes(q))
      );
    }

    // Price range
    if (criteria.minPrice !== undefined) {
      result = result.filter((p) => p.price >= criteria.minPrice!);
    }
    if (criteria.maxPrice !== undefined) {
      result = result.filter((p) => p.price <= criteria.maxPrice!);
    }

    // Min rating
    if (criteria.minRating !== undefined) {
      result = result.filter((p) => p.rating >= criteria.minRating!);
    }

    // In stock
    if (criteria.inStockOnly) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sorting
    switch (criteria.sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
        break;
    }

    const total = result.length;
    const page = Math.max(1, criteria.page || 1);
    const perPage = Math.max(1, Math.min(100, criteria.perPage || 12));
    const offset = (page - 1) * perPage;
    const items = result.slice(offset, offset + perPage);

    return {
      items,
      total,
      page,
      perPage,
    };
  }

  /**
   * Find product by ID
   */
  public static find(id: string): Product | null {
    return this.products.find((p) => p.id === id) || null;
  }

  /**
   * Create a new product (Admin)
   */
  public static create(data: Omit<Product, 'id'> & { id?: string }): Product {
    const newProduct: Product = {
      ...data,
      id: data.id || `prod-${Date.now()}`,
      rating: data.rating ?? 5.0,
      reviewCount: data.reviewCount ?? 0,
      images: data.images?.length ? data.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'],
      features: data.features || [],
    };
    this.products.unshift(newProduct);
    return newProduct;
  }

  /**
   * Update existing product
   */
  public static update(id: string, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    this.products[index] = {
      ...this.products[index],
      ...updates,
      id, // Preserve id
    };
    return this.products[index];
  }

  /**
   * Delete product
   */
  public static delete(id: string): boolean {
    const initialLen = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    return this.products.length < initialLen;
  }

  /**
   * Decrement stock when order is placed
   */
  public static decrementStock(productId: string, quantity: number): boolean {
    const product = this.find(productId);
    if (!product || product.stock < quantity) {
      return false;
    }
    product.stock -= quantity;
    return true;
  }
}
