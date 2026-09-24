import { INITIAL_COUPONS } from '../../../src/data/initialData';
import { Coupon } from '../../../src/types';

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  message: string;
}

export class CouponService {
  private static coupons: Coupon[] = [...INITIAL_COUPONS];

  /**
   * Get all active coupons
   */
  public static all(): Coupon[] {
    return [...this.coupons];
  }

  /**
   * Verify and calculate coupon discount
   */
  public static verify(code: string, subtotal: number): CouponValidationResult {
    const coupon = this.coupons.find(
      (c) => c.code.trim().toUpperCase() === code.trim().toUpperCase()
    );

    if (!coupon) {
      return {
        valid: false,
        message: 'Invalid promo code. Please check and try again.',
      };
    }

    if (coupon.minSpend && subtotal < coupon.minSpend) {
      return {
        valid: false,
        coupon,
        message: `This coupon requires a minimum subtotal of $${coupon.minSpend.toFixed(2)}.`,
      };
    }

    let discountAmount = 0;
    if (coupon.discountPercent) {
      discountAmount = Math.round((subtotal * (coupon.discountPercent / 100)) * 100) / 100;
    } else if (coupon.discountAmount) {
      discountAmount = Math.min(coupon.discountAmount, subtotal);
    }

    return {
      valid: true,
      coupon,
      discountAmount,
      message: `Coupon applied: ${coupon.description}`,
    };
  }
}
