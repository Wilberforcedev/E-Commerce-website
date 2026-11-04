import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { OrderController } from '../app/Http/Controllers/OrderController';
import { TranscriptionController } from '../app/Http/Controllers/TranscriptionController';
import { HealthController } from '../app/Http/Controllers/HealthController';
import { validateRequest } from '../app/Http/Requests/FormRequest';

const router = Router();
const orderController = new OrderController();
const transcriptionController = new TranscriptionController();
const healthController = new HealthController();

export const checkoutThrottle = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many checkout attempts. Please wait and try again.' },
});

export const transcribeThrottle = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many transcription attempts. Please try again in 15 minutes.' },
});

// Broad backstop so order lookups, status updates, and health checks can't be brute-forced.
const apiThrottle = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down and try again.' },
});

router.use(apiThrottle);

// Read-only operational endpoints.
router.get('/', healthController.routes);
router.get('/health', healthController.check);

// Checkout writes through the server after it verifies identity, prices, coupon, shipping, and stock.
router.post('/orders', checkoutThrottle, ...(orderController.store as any[]));
router.get('/orders/:id', ...(orderController.show as any[]));
router.patch(
  '/orders/:id/status',
  ...(orderController.updateStatus as any[]),
);

// This route is throttled before JSON parsing in server.ts.
router.post(
  '/transcribe',
  validateRequest({ audioBase64: ['required', 'string'] }),
  transcriptionController.transcribe,
);

export const apiRouter = router;
