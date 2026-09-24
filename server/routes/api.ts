import { Router, Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import express from 'express';
import { ProductController } from '../app/Http/Controllers/ProductController';
import { OrderController } from '../app/Http/Controllers/OrderController';
import { CouponController } from '../app/Http/Controllers/CouponController';
import { TranscriptionController } from '../app/Http/Controllers/TranscriptionController';
import { HealthController } from '../app/Http/Controllers/HealthController';
import { validateRequest } from '../app/Http/Requests/FormRequest';

// Controller instances
const productController = new ProductController();
const orderController = new OrderController();
const couponController = new CouponController();
const transcriptionController = new TranscriptionController();
const healthController = new HealthController();

// Rate limiter for audio transcription (Laravel Throttle equivalent)
const transcribeThrottle = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many transcription attempts. Please try again in 15 minutes.',
    errors: {
      audio: ['Too many requests.'],
    },
  },
});

/**
 * Laravel-style Route helper class
 */
export class Route {
  private static router: Router = Router();

  public static get(path: string, handler: (req: Request, res: Response, next?: NextFunction) => any, ...middleware: any[]) {
    this.router.get(path, ...middleware, handler);
  }

  public static post(path: string, handler: (req: Request, res: Response, next?: NextFunction) => any, ...middleware: any[]) {
    this.router.post(path, ...middleware, handler);
  }

  public static put(path: string, handler: (req: Request, res: Response, next?: NextFunction) => any, ...middleware: any[]) {
    this.router.put(path, ...middleware, handler);
  }

  public static patch(path: string, handler: (req: Request, res: Response, next?: NextFunction) => any, ...middleware: any[]) {
    this.router.patch(path, ...middleware, handler);
  }

  public static delete(path: string, handler: (req: Request, res: Response, next?: NextFunction) => any, ...middleware: any[]) {
    this.router.delete(path, ...middleware, handler);
  }

  public static getRouter(): Router {
    return this.router;
  }
}

/* =========================================================================
 * Laravel-Style API Routes (routes/api.php equivalent)
 * ========================================================================= */

// API Manifest & Health
Route.get('/', healthController.routes);
Route.get('/health', healthController.check);

// Products Catalog API
Route.get('/products', productController.index);
Route.get('/products/:id', productController.show);
Route.post(
  '/products',
  productController.store,
  validateRequest({
    name: ['required', 'string'],
    price: ['required', 'numeric', 'min:0.01'],
    category: ['required', 'string'],
    stock: ['required', 'numeric', 'min:0'],
  })
);
Route.put('/products/:id', productController.update);
Route.delete('/products/:id', productController.destroy);

// Orders & Checkout API
Route.get('/orders', orderController.index);
Route.get('/orders/:id', orderController.show);
Route.post(
  '/orders',
  orderController.store,
  validateRequest({
    items: ['required', 'array', 'min:1'],
    shippingAddress: ['required'],
    'shippingAddress.fullName': ['required', 'string'],
    'shippingAddress.address': ['required', 'string'],
    'shippingAddress.city': ['required', 'string'],
    'shippingAddress.postalCode': ['required', 'string'],
  })
);
Route.patch(
  '/orders/:id/status',
  orderController.updateStatus,
  validateRequest({
    status: ['required', 'string', 'in:Pending,Processing,Shipped,Delivered,Cancelled'],
  })
);
Route.post(
  '/orders/track',
  orderController.track,
  validateRequest({
    query: ['required', 'string'],
  })
);

// Coupons & Promotions API
Route.get('/coupons', couponController.index);
Route.post(
  '/coupons/verify',
  couponController.verify,
  validateRequest({
    code: ['required', 'string'],
  })
);

// Voice AI Search & Transcription
Route.post(
  '/transcribe',
  transcriptionController.transcribe,
  transcribeThrottle,
  express.json({ limit: '25mb' }),
  validateRequest({
    audioBase64: ['required', 'string'],
  })
);

export const apiRouter = Route.getRouter();
