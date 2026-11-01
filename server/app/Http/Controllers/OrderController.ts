import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { INITIAL_COUPONS } from '../../../src/data/initialData';
import { OrderStatus, Product, CartItem, ShippingAddress } from '../../../../src/types';
import {
  decodeFirestoreFields, firestoreDocumentPath, firestoreFields, firestoreRequest,
  getProjectDatabasePath, requireAdmin, requireAuth, optionalAuth, firestoreValue,
} from '../../Services/FirebaseAdminService';
import { Controller } from './Controller';

const validStatuses: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const productIdPattern = /^[a-zA-Z0-9_-]{1,128}$/;
const asDocument = (doc: any) => ({ id: doc.name.split('/').pop(), ...decodeFirestoreFields(doc.fields) });

function validateAddress(value: any): value is ShippingAddress {
  const fields = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'country'];
  return Boolean(value && typeof value === 'object' &&
    fields.every((field) => typeof value[field] === 'string' && value[field].trim() && value[field].length <= 300) &&
    /^\S+@\S+\.\S+$/.test(value.email));
}

export class OrderController extends Controller {
  /** Checkout totals and stock are calculated against live Firestore data on the server. */
  public store = [
    optionalAuth,
    async (req: Request, res: Response) => {
      try {
        const items = req.body?.items as Array<{ productId: string; quantity: number; selectedColor?: string; selectedSize?: string }>;
        const address = req.body?.shippingAddress;
        const shippingMethod = req.body?.shippingMethod;
        const paymentMethod = req.body?.paymentMethod;
        const couponCode = typeof req.body?.couponCode === 'string' ? req.body.couponCode.trim() : '';

        if (!Array.isArray(items) || items.length < 1 || items.length > 20) return this.error(res, 'Your cart must contain between 1 and 20 items.', undefined, 422);
        if (!validateAddress(address)) return this.error(res, 'Enter a complete and valid shipping address.', undefined, 422);
        if (!['standard', 'express', 'overnight'].includes(shippingMethod)) return this.error(res, 'Select a valid shipping method.', undefined, 422);
        if (!['card', 'paypal'].includes(paymentMethod)) return this.error(res, 'Select a valid payment method.', undefined, 422);
        if (items.some((item) => !item || !productIdPattern.test(item.productId) || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99)) {
          return this.error(res, 'One or more cart items are invalid.', undefined, 422);
        }

        const quantities = new Map<string, number>();
        for (const item of items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
        const ids = [...quantities.keys()];
        const snapshots = await Promise.all(ids.map(async (id) => {
          try { return await firestoreRequest<any>(firestoreDocumentPath('products', id), 'GET'); }
          catch (error: any) { if (error?.response?.status === 404) return null; throw error; }
        }));

        const products = new Map<string, { product: Product; updateTime: string }>();
        for (let i = 0; i < snapshots.length; i++) {
          const snapshot = snapshots[i];
          if (!snapshot) return this.error(res, 'A product in your cart is no longer available.', undefined, 409);
          const product = asDocument(snapshot) as Product;
          const requested = quantities.get(ids[i])!;
          if (!Number.isFinite(product.price) || product.price < 0 ||
              !Number.isSafeInteger(product.stock) || product.stock < requested) {
            return this.error(res, product.stock < requested ? `Only ${product.stock} of “${product.name}” are currently available.` : 'A product in your cart has invalid store data.', undefined, 409);
          }
          products.set(ids[i], { product, updateTime: snapshot.updateTime });
        }

        let subtotal = 0;
        const validatedItems: CartItem[] = items.map((item) => {
          const live = products.get(item.productId)!.product;
          subtotal += live.price * item.quantity;
          return {
            product: { ...live, stock: live.stock - quantities.get(item.productId)! },
            quantity: item.quantity,
            ...(typeof item.selectedColor === 'string' ? { selectedColor: item.selectedColor.slice(0, 80) } : {}),
            ...(typeof item.selectedSize === 'string' ? { selectedSize: item.selectedSize.slice(0, 80) } : {}),
          };
        });
        subtotal = Math.round(subtotal * 100) / 100;

        let discount = 0;
        let freeShipping = false;
        if (couponCode) {
          const coupon = INITIAL_COUPONS.find((item) => item.code.toUpperCase() === couponCode.toUpperCase());
          if (!coupon) return this.error(res, 'This coupon code is invalid.', undefined, 422);
          if (coupon.minSpend && subtotal < coupon.minSpend) return this.error(res, `This coupon requires a minimum subtotal of $${coupon.minSpend.toFixed(2)}.`, undefined, 422);
          if (coupon.discountPercent) discount = subtotal * coupon.discountPercent / 100;
          else if (coupon.discountAmount) discount = coupon.discountAmount;
          discount = Math.round(Math.min(subtotal, discount) * 100) / 100;
          freeShipping = Boolean(coupon.freeShipping);
        }

        const baseShipping = subtotal >= 100 || freeShipping ? 0 : 9.99;
        const shipping = Math.round((baseShipping + (shippingMethod === 'overnight' ? 19.99 : shippingMethod === 'express' ? 9.99 : 0)) * 100) / 100;
        const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
        const total = Math.max(0, Math.round((subtotal - discount + shipping + tax) * 100) / 100);
        const id = `ord-${randomUUID()}`;
        const orderNumber = `NM-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
        const trackingNumber = `TRK-${randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()}`;
        const estimatedDelivery = new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const order = {
          id, orderNumber, userId: req.storeIdentity?.uid || 'guest', date: new Date().toISOString(),
          items: validatedItems, subtotal, discount, shipping, tax, total, status: 'Pending' as OrderStatus,
          shippingAddress: address, paymentMethod: paymentMethod === 'paypal' ? 'PayPal (demo)' : 'Card (demo)',
          estimatedDelivery, trackingNumber, carrier: shippingMethod === 'overnight' ? 'FedEx Priority' : 'DHL Standard',
        };

        const writes: any[] = [];
        for (const [productId, quantity] of quantities) {
          const current = products.get(productId)!;
          writes.push({
            update: { name: firestoreDocumentPath('products', productId), fields: firestoreFields({ stock: current.product.stock - quantity }) },
            updateMask: { fieldPaths: ['stock'] },
            currentDocument: { updateTime: current.updateTime },
          });
        }
        writes.push({
          update: { name: firestoreDocumentPath('orders', id), fields: firestoreFields(order) },
          currentDocument: { exists: false },
        });

        try {
          await firestoreRequest(`${getProjectDatabasePath()}:commit`, 'POST', { writes });
        } catch (error: any) {
          if ([400, 409].includes(error?.response?.status)) {
            return this.error(res, 'Stock or pricing changed during checkout. Refresh your cart and try again.', undefined, 409);
          }
          throw error;
        }
        return this.success(res, order, 'Order placed successfully.', 201);
      } catch (err: any) {
        console.error('Checkout failed:', err?.response?.data || err);
        return this.error(res, 'Checkout could not be completed. Please try again.', undefined, 500);
      }
    },
  ];

  public show = [
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const doc = await firestoreRequest<any>(firestoreDocumentPath('orders', String(req.params.id)), 'GET');
        const order = asDocument(doc);
        if (req.storeIdentity?.role !== 'admin' && order.userId !== req.storeIdentity?.uid) return this.notFound(res, 'Order not found.');
        return this.success(res, order, 'Order retrieved successfully.');
      } catch (err: any) {
        if (err?.response?.status === 404) return this.notFound(res, 'Order not found.');
        return this.error(res, 'Failed to retrieve order.', undefined, 500);
      }
    },
  ];

  public updateStatus = [
    requireAuth,
    requireAdmin,
    async (req: Request, res: Response) => {
      try {
        const status = req.body?.status as OrderStatus;
        if (!validStatuses.includes(status)) return this.error(res, 'Invalid order status.', undefined, 422);
        const path = firestoreDocumentPath('orders', String(req.params.id));
        const current = await firestoreRequest<any>(path, 'GET');
        await firestoreRequest(`${getProjectDatabasePath()}:commit`, 'POST', {
          writes: [{
            update: { name: path, fields: { status: firestoreValue(status) } },
            updateMask: { fieldPaths: ['status'] },
            currentDocument: { updateTime: current.updateTime },
          }],
        });
        return this.success(res, { id: req.params.id, status }, 'Order status updated.');
      } catch (err: any) {
        if (err?.response?.status === 404) return this.notFound(res, 'Order not found.');
        return this.error(res, 'Failed to update order status.', undefined, 500);
      }
    },
  ];
}
