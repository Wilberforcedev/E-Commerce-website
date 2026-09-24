import { Request, Response } from 'express';
import { Controller } from './Controller';
import { OrderService } from '../../Services/OrderService';
import { OrderStatus } from '../../../../src/types';

export class OrderController extends Controller {
  /**
   * Display a listing of orders (GET /api/orders)
   */
  public index = async (req: Request, res: Response) => {
    try {
      const userId = req.query.userId as string | undefined;
      const orders = OrderService.all(userId);
      return this.success(res, orders, 'Orders retrieved successfully.');
    } catch (err: any) {
      return this.error(res, 'Failed to retrieve orders.', err.message, 500);
    }
  };

  /**
   * Display the specified order (GET /api/orders/:id)
   */
  public show = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const order = OrderService.find(id);
      if (!order) {
        return this.notFound(res, `Order '${id}' was not found.`);
      }
      return this.success(res, order, 'Order retrieved successfully.');
    } catch (err: any) {
      return this.error(res, 'Failed to retrieve order.', err.message, 500);
    }
  };

  /**
   * Store a newly created order (POST /api/orders)
   */
  public store = async (req: Request, res: Response) => {
    try {
      const { items, shippingAddress, paymentMethod, userId } = req.body;
      const result = OrderService.create({
        items,
        shippingAddress,
        paymentMethod: paymentMethod || 'Credit Card',
        userId,
      });

      if (result.error) {
        return this.error(res, result.error, undefined, 422);
      }

      return this.success(res, result.order, 'Order placed successfully.', 201);
    } catch (err: any) {
      return this.error(res, 'Failed to place order.', err.message, 500);
    }
  };

  /**
   * Update order fulfillment status (PATCH /api/orders/:id/status)
   */
  public updateStatus = async (req: Request, res: Response) => {
    try {
      const id = String(req.params.id);
      const { status } = req.body;
      const validStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

      if (!status || !validStatuses.includes(status)) {
        return this.error(
          res,
          'Invalid status value.',
          { status: [`Status must be one of: ${validStatuses.join(', ')}`] },
          422
        );
      }

      const updated = OrderService.updateStatus(id, status);
      if (!updated) {
        return this.notFound(res, `Order '${id}' was not found.`);
      }

      return this.success(res, updated, `Order status updated to '${status}'.`);
    } catch (err: any) {
      return this.error(res, 'Failed to update order status.', err.message, 500);
    }
  };

  /**
   * Track an order by order number or tracking number (POST /api/orders/track)
   */
  public track = async (req: Request, res: Response) => {
    try {
      const { query } = req.body;
      if (!query || !query.trim()) {
        return this.error(res, 'Tracking query is required.', { query: ['The query field is required.'] }, 422);
      }

      const order = OrderService.find(query.trim());
      if (!order) {
        return this.notFound(res, `No shipment found matching '${query}'. Please check your order or tracking number.`);
      }

      return this.success(res, order, 'Shipment status located.');
    } catch (err: any) {
      return this.error(res, 'Failed to track order.', err.message, 500);
    }
  };
}
