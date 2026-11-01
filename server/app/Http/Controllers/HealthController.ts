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
        { method: 'GET', uri: '/api/health', access: 'public' },
        { method: 'POST', uri: '/api/orders', access: 'guest checkout or verified Firebase user' },
        { method: 'GET', uri: '/api/orders/:id', access: 'verified owner or admin' },
        { method: 'PATCH', uri: '/api/orders/:id/status', access: 'verified admin' },
        { method: 'POST', uri: '/api/transcribe', access: 'public, rate limited' },
      ],
    });
  };
}
