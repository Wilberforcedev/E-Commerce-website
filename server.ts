import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './server/routes/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // 1. CORS Configuration: Locked down in production with environment variable support
  const allowedOriginsEnv = process.env.ALLOWED_ORIGIN || process.env.CORS_ORIGIN;
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map((o) => o.trim()).filter(Boolean)
    : [];

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. same-origin SPA navigation, mobile apps, curl)
      if (!origin) {
        return callback(null, true);
      }

      // Allow all in development or when explicitly set to wildcard / unconfigured
      if (
        process.env.NODE_ENV !== 'production' ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes('*')
      ) {
        return callback(null, true);
      }

      // Check against configured production origins
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin ${origin} is not allowed by CORS policy.`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  };

  app.use(cors(corsOptions));

  // 2. Request Logging Middleware (Structured API logging for production monitoring)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (req.path.startsWith('/api')) {
        console.log(
          `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`
        );
      }
    });
    next();
  });

  // 3. JSON body parsing with reasonable default limits (transcribe route has dedicated 25mb limit)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // 4. Mount Laravel-Style API Routes under /api
  app.use('/api', apiRouter);

  // 5. Static Assets & SPA Fallback for Production
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, { maxAge: '1d', index: false }));
    app.use((_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // 6. Global Error-Handling Middleware (Ensures JSON responses & prevents process crashes)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(`[Global Error Handler]`, err);
    const statusCode = typeof err.status === 'number' ? err.status : 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || 'An internal server error occurred.',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    });
  });

  // 7. Start listening on 0.0.0.0
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NovaMart Server] Running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`[NovaMart Server] Listening on http://0.0.0.0:${PORT}`);
    console.log(`[NovaMart Server] API endpoints ready at http://0.0.0.0:${PORT}/api`);
  });

  // 8. Graceful Shutdown handlers for container orchestrators (SIGTERM / SIGINT)
  const shutdown = (signal: string) => {
    console.log(`[NovaMart Server] Received ${signal}. Starting graceful shutdown...`);
    server.close(() => {
      console.log(`[NovaMart Server] HTTP server closed.`);
      process.exit(0);
    });

    // Force close after 10s if connections remain stuck
    setTimeout(() => {
      console.error(`[NovaMart Server] Forcing shutdown after timeout.`);
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
