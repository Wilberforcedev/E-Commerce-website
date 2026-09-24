import { Request, Response } from 'express';
import { Controller } from './Controller';
import { ProductService, ProductFilterCriteria } from '../../Services/ProductService';

export class ProductController extends Controller {
  /**
   * Display a listing of the resource (GET /api/products)
   */
  public index = async (req: Request, res: Response) => {
    try {
      const criteria: ProductFilterCriteria = {
        category: req.query.category as string,
        search: req.query.search as string,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        minRating: req.query.minRating ? parseFloat(req.query.minRating as string) : undefined,
        inStockOnly: req.query.inStockOnly === 'true' || req.query.inStockOnly === '1',
        sortBy: req.query.sortBy as any,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        perPage: req.query.perPage ? parseInt(req.query.perPage as string, 10) : 12,
      };

      const result = ProductService.paginate(criteria);
      return this.paginated(
        res,
        result.items,
        result.total,
        result.page,
        result.perPage,
        'Products retrieved successfully.'
      );
    } catch (err: any) {
      return this.error(res, 'Failed to retrieve products.', err.message, 500);
    }
  };

  /**
   * Display the specified resource (GET /api/products/:id)
   */
  public show = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const product = ProductService.find(id);
      if (!product) {
        return this.notFound(res, `Product with ID '${id}' was not found.`);
      }
      return this.success(res, product, 'Product details retrieved successfully.');
    } catch (err: any) {
      return this.error(res, 'Failed to retrieve product details.', err.message, 500);
    }
  };

  /**
   * Store a newly created resource in storage (POST /api/products)
   */
  public store = async (req: Request, res: Response) => {
    try {
      const newProduct = ProductService.create(req.body);
      return this.success(res, newProduct, 'Product created successfully.', 201);
    } catch (err: any) {
      return this.error(res, 'Failed to create product.', err.message, 500);
    }
  };

  /**
   * Update the specified resource in storage (PUT /api/products/:id)
   */
  public update = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const updated = ProductService.update(id, req.body);
      if (!updated) {
        return this.notFound(res, `Product with ID '${id}' was not found.`);
      }
      return this.success(res, updated, 'Product updated successfully.');
    } catch (err: any) {
      return this.error(res, 'Failed to update product.', err.message, 500);
    }
  };

  /**
   * Remove the specified resource from storage (DELETE /api/products/:id)
   */
  public destroy = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const deleted = ProductService.delete(id);
      if (!deleted) {
        return this.notFound(res, `Product with ID '${id}' was not found.`);
      }
      return this.success(res, { id }, 'Product deleted successfully.');
    } catch (err: any) {
      return this.error(res, 'Failed to delete product.', err.message, 500);
    }
  };
}
