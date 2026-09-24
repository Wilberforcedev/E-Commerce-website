import { Request, Response } from 'express';
import { Controller } from './Controller';

export class HealthController extends Controller {
  /**
   * Health check endpoint (GET /api/health)
   */
  public check = (_req: Request, res: Response) => {
    return this.success(
      res,
      {
        status: 'ok',
        framework: 'Laravel-Style TypeScript Architecture',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      },
      'Application is healthy.'
    );
  };

  /**
   * API Route Index / Swagger-like Manifest (GET /api)
   */
  public routes = (_req: Request, res: Response) => {
    return res.status(200).json({
      application: 'NovaMart E-Commerce API',
      architecture: 'Laravel-Inspired Pattern (Controllers, Services, FormRequests, Resources)',
      routes: [
        { method: 'GET', uri: '/api/health', action: 'HealthController@check' },
        { method: 'GET', uri: '/api/products', action: 'ProductController@index' },
        { method: 'GET', uri: '/api/products/:id', action: 'ProductController@show' },
        { method: 'POST', uri: '/api/products', action: 'ProductController@store' },
        { method: 'PUT', uri: '/api/products/:id', action: 'ProductController@update' },
        { method: 'DELETE', uri: '/api/products/:id', action: 'ProductController@destroy' },
        { method: 'GET', uri: '/api/orders', action: 'OrderController@index' },
        { method: 'GET', uri: '/api/orders/:id', action: 'OrderController@show' },
        { method: 'POST', uri: '/api/orders', action: 'OrderController@store' },
        { method: 'PATCH', uri: '/api/orders/:id/status', action: 'OrderController@updateStatus' },
        { method: 'POST', uri: '/api/orders/track', action: 'OrderController@track' },
        { method: 'GET', uri: '/api/coupons', action: 'CouponController@index' },
        { method: 'POST', uri: '/api/coupons/verify', action: 'CouponController@verify' },
        { method: 'POST', uri: '/api/transcribe', action: 'TranscriptionController@transcribe' },
      ],
    });
  };
}
