import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter, transcribeThrottle } from './server/routes/api';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Local runs read .env; hosting platforms inject real environment variables.
// Node ignores this call when no file exists, and never overrides existing vars.
try {
  (process as any).loadEnvFile?.('.env');
} catch {
  // No .env file present.
}

const isProduction = process.env.NODE_ENV === 'production';

function validateProductionConfig() {
  if (!isProduction) return;

  const missing = ['FIREBASE_PROJECT_ID', 'FIREBASE_SERVICE_ACCOUNT_JSON']
    .filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  try {
    const credentials = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON!);
    if (!credentials.client_email || !credentials.private_key) {
      throw new Error('client_email and private_key are required.');
    }
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not a valid service account JSON document.');
  }

  const origins = (process.env.ALLOWED_ORIGIN || process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  for (const origin of origins) {
    try {
      new URL(origin);
    } catch {
      throw new Error(`ALLOWED_ORIGIN contains an invalid origin: ${origin}`);
    }
  }
  if (origins.length === 0) {
    console.warn('[NovaMart Server] ALLOWED_ORIGIN is unset; cross-origin API access is blocked.');
  }
  if (!process.env.GEMINI_API_KEY) {
    console.warn('[NovaMart Server] GEMINI_API_KEY is unset; voice transcription will be unavailable.');
  }
}

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' https://apis.google.com https://www.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob:",
  "connect-src 'self' https://*.googleapis.com https://*.google.com https://*.firebaseio.com wss://*.firebaseio.com",
  "frame-src 'self' https://*.firebaseapp.com https://accounts.google.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  validateProductionConfig();

  app.disable('x-powered-by');

  // Behind Render/Railway the socket peer is the proxy. Without this the
  // per-IP rate limits would bucket every visitor together.
  const trustProxy = process.env.TRUST_PROXY?.trim();
  if (trustProxy) {
    app.set('trust proxy', /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy);
  }

  // 1. Security headers applied to every response, including static assets.
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=(self)');
    if (isProduction) {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
    }
    next();
  });

  // 2. CORS Configuration: Locked down in production with environment variable support
  const allowedOriginsEnv = process.env.ALLOWED_ORIGIN || process.env.CORS_ORIGIN;
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];

  if (isProduction && allowedOrigins.includes('*')) {
    throw new Error('Wildcard ALLOWED_ORIGIN is not supported in production.');
  }

  const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
      if (!origin || !isProduction) return callback(null, true);
      // With no allow-list, emit no CORS permission. Same-origin requests continue normally.
      return callback(null, allowedOrigins.includes(origin));
    },
    credentials: false,
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'Accept'],
  };

  app.use(cors(corsOptions));

  // 3. Request Logging Middleware (Structured API logging for production monitoring)
  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    if (req.path.startsWith('/api')) {
      // API responses carry order and identity data; never let a proxy or browser cache them.
      res.setHeader('Cache-Control', 'no-store');
    }
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

  // 4. JSON body parsing with reasonable default limits (transcribe route has dedicated 25mb limit)
  app.use('/api/transcribe', transcribeThrottle, express.json({ limit: '25mb' }));
  app.use(express.json({ limit: '1mb' }));

  // 5. Mount Laravel-Style API Routes under /api
  app.use('/api', apiRouter);
  // Unknown API paths must return JSON, never the SPA shell.
  app.use('/api', (_req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'API route not found.' });
  });

  // 6. Static Assets & SPA Fallback for Production
  if (isProduction) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath, {
      index: false,
      setHeaders: (res, filePath) => {
        // Vite fingerprints files under assets/, so they can be cached forever.
        res.setHeader(
          'Cache-Control',
          filePath.includes(`${path.sep}assets${path.sep}`)
            ? 'public, max-age=31536000, immutable'
            : 'no-cache'
        );
      },
    }));
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' && req.method !== 'HEAD') return next();
      // Missing files should 404 instead of returning index.html with a 200.
      if (path.extname(req.path)) return res.status(404).type('text/plain').send('Not found');
      res.setHeader('Cache-Control', 'no-cache');
      return res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // 7. Global Error-Handling Middleware (Ensures JSON responses & prevents process crashes)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(`[Global Error Handler]`, err);
    const statusCode = typeof err.status === 'number' ? err.status : 500;
    res.status(statusCode).json({
      success: false,
      // Internal exception text can name file paths, hosts, or credentials.
      message: statusCode >= 500 && isProduction
        ? 'An internal server error occurred.'
        : err.message || 'An internal server error occurred.',
      ...(!isProduction && { stack: err.stack }),
    });
  });

  // 8. Start listening on 0.0.0.0
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NovaMart Server] Running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`[NovaMart Server] Listening on http://0.0.0.0:${PORT}`);
    console.log(`[NovaMart Server] API endpoints ready at http://0.0.0.0:${PORT}/api`);
  });

  // Keep-alive must outlive the load balancer's idle timeout to avoid 502s.
  server.keepAliveTimeout = 65_000;
  server.headersTimeout = 66_000;

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
