import { INITIAL_ORDERS } from '../../../src/data/initialData';
import { Order, OrderStatus, CartItem, ShippingAddress } from '../../../src/types';
import { ProductService } from './ProductService';

export interface CreateOrderDTO {
  userId?: string;
  items: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  couponCode?: string;
}

export class OrderService {
  private static orders: Order[] = [...INITIAL_ORDERS];

  /**
   * List all orders or orders for a specific user
   */
  public static all(userId?: string): Order[] {
    if (userId) {
      return this.orders.filter((o) => o.userId === userId);
    }
    return [...this.orders];
  }

  /**
   * Find order by internal ID or human-readable order number
   */
  public static find(idOrOrderNumber: string): Order | null {
    return (
      this.orders.find(
        (o) =>
          o.id.toLowerCase() === idOrOrderNumber.toLowerCase() ||
          o.orderNumber.toLowerCase() === idOrOrderNumber.toLowerCase() ||
          (o.trackingNumber && o.trackingNumber.toLowerCase() === idOrOrderNumber.toLowerCase())
      ) || null
    );
  }

  /**
   * Create and calculate order, validating inventory and computing taxes/shipping
   */
  public static create(dto: CreateOrderDTO): { order?: Order; error?: string } {
    if (!dto.items || dto.items.length === 0) {
      return { error: 'Your cart contains no items.' };
    }

    // Verify stock availability
    for (const item of dto.items) {
      const prod = ProductService.find(item.product.id);
      if (!prod) {
        return { error: `Product "${item.product.name}" could not be found.` };
      }
      if (prod.stock < item.quantity) {
        return { error: `Insufficient stock for "${prod.name}". Only ${prod.stock} available.` };
      }
    }

    // Decrement stock
    for (const item of dto.items) {
      ProductService.decrementStock(item.product.id, item.quantity);
    }

    // Calculate subtotal
    const subtotal = dto.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    // Shipping: Free if over $100, otherwise $9.99
    const shipping = subtotal >= 100 ? 0 : 9.99;

    // Discount (placeholder or handled via coupon service)
    const discount = 0;

    // Standard sales tax ~8%
    const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
    const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const trackingCode = `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 4);
    const estDeliveryFormatted = deliveryDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `NM-2026-${randomSuffix}`,
      userId: dto.userId || 'guest-session',
      date: new Date().toISOString(),
      items: dto.items,
      subtotal: Math.round(subtotal * 100) / 100,
      discount,
      shipping,
      tax,
      total,
      status: 'Processing',
      shippingAddress: dto.shippingAddress,
      paymentMethod: dto.paymentMethod,
      estimatedDelivery: estDeliveryFormatted,
      trackingNumber: trackingCode,
      carrier: 'FedEx Express',
    };

    this.orders.unshift(newOrder);
    return { order: newOrder };
  }

  /**
   * Update status of an existing order (Admin)
   */
  public static updateStatus(id: string, status: OrderStatus): Order | null {
    const order = this.find(id);
    if (!order) return null;

    order.status = status;
    return order;
  }
}
