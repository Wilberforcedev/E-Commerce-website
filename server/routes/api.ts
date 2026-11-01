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

export const transcribeThrottle = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many transcription attempts. Please try again in 15 minutes.' },
});

// Read-only operational endpoints.
router.get('/', healthController.routes);
router.get('/health', healthController.check);

// Checkout writes through the server after it verifies identity, prices, coupon, shipping, and stock.
router.post('/orders', ...(orderController.store as any[]));
router.get('/orders/:id', ...(orderController.show as any[]));
router.patch(
  '/orders/:id/status',
  validateRequest({ status: ['required', 'string', 'in:Pending,Processing,Shipped,Delivered,Cancelled'] }),
  ...(orderController.updateStatus as any[]),
);

// This route is throttled before JSON parsing in server.ts.
router.post(
  '/transcribe',
  validateRequest({ audioBase64: ['required', 'string'] }),
  transcriptionController.transcribe,
);

export const apiRouter = router;
