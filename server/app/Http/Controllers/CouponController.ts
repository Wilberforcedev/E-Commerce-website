import { Request, Response } from 'express';
import { Controller } from './Controller';
import { CouponService } from '../../Services/CouponService';

export class CouponController extends Controller {
  /**
   * List available public promotion codes (GET /api/coupons)
   */
  public index = async (_req: Request, res: Response) => {
    try {
      const coupons = CouponService.all();
      return this.success(res, coupons, 'Available coupons retrieved.');
    } catch (err: any) {
      return this.error(res, 'Failed to retrieve coupons.', err.message, 500);
    }
  };

  /**
   * Verify and calculate discount for a coupon code (POST /api/coupons/verify)
   */
  public verify = async (req: Request, res: Response) => {
    try {
      const { code, subtotal } = req.body;
      const numSubtotal = parseFloat(subtotal) || 0;

      const result = CouponService.verify(code, numSubtotal);

      if (!result.valid) {
        return this.error(res, result.message, { code: [result.message] }, 422);
      }

      return this.success(
        res,
        {
          coupon: result.coupon,
          discountAmount: result.discountAmount,
        },
        result.message
      );
    } catch (err: any) {
      return this.error(res, 'Failed to verify coupon code.', err.message, 500);
    }
  };
}
