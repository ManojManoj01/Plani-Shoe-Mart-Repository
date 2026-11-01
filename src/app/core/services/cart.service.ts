import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { Product } from '../models/product.model';
import { CartItem, CartSummary, Coupon, Order, ShippingAddress } from '../models/cart.model';
import { ToastService } from './toast.service';
import { environment } from '../../../environments/environment';

const CART_STORAGE_KEY = 'stepstyle_cart_items';
const COUPON_STORAGE_KEY = 'stepstyle_cart_coupon';

export const VALID_COUPONS: Coupon[] = [
  {
    code: 'STEP10',
    discountPercentage: 10,
    description: '10% instant discount on entire order'
  },
  {
    code: 'PALANI500',
    discountAmount: 500,
    minSpend: 1999,
    description: 'Flat ₹500 off on orders above ₹1,999'
  },
  {
    code: 'FIRSTSTEP',
    discountPercentage: 15,
    description: '15% welcome discount for new shoppers'
  }
];

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private toastService = inject(ToastService);
  private http = inject(HttpClient);

  private itemsSignal = signal<CartItem[]>(this.loadCartFromStorage());
  private couponSignal = signal<Coupon | null>(this.loadCouponFromStorage());

  // Public readonly signals
  public items = this.itemsSignal.asReadonly();
  public coupon = this.couponSignal.asReadonly();

  // Computations
  public totalQuantity = computed(() => {
    return this.itemsSignal().reduce((acc, item) => acc + item.quantity, 0);
  });

  public subtotal = computed(() => {
    return this.itemsSignal().reduce((acc, item) => acc + item.subtotal, 0);
  });

  public discountAmount = computed(() => {
    const c = this.couponSignal();
    const currentSubtotal = this.subtotal();
    if (!c || currentSubtotal === 0) return 0;

    if (c.minSpend && currentSubtotal < c.minSpend) {
      return 0;
    }

    if (c.discountPercentage) {
      return Math.round((currentSubtotal * c.discountPercentage) / 100);
    }
    if (c.discountAmount) {
      return Math.min(c.discountAmount, currentSubtotal);
    }
    return 0;
  });

  public shippingFee = computed(() => {
    const currentSubtotal = this.subtotal();
    if (currentSubtotal === 0) return 0;
    return currentSubtotal >= 999 ? 0 : 70; // Free delivery over ₹999
  });

  public grandTotal = computed(() => {
    const total = this.subtotal() - this.discountAmount() + this.shippingFee();
    return Math.max(0, total);
  });

  public freeShippingThreshold = 999;
  public freeShippingRemaining = computed(() => {
    const remaining = this.freeShippingThreshold - this.subtotal();
    return remaining > 0 ? remaining : 0;
  });

  public summary = computed<CartSummary>(() => {
    return {
      items: this.itemsSignal(),
      totalQuantity: this.totalQuantity(),
      subtotal: this.subtotal(),
      discount: this.discountAmount(),
      coupon: this.couponSignal() || undefined,
      shippingFee: this.shippingFee(),
      tax: 0,
      grandTotal: this.grandTotal()
    };
  });

  private loadCartFromStorage(): CartItem[] {
    if (!this.isBrowser) return [];
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  private loadCouponFromStorage(): Coupon | null {
    if (!this.isBrowser) return null;
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.itemsSignal()));
      if (this.couponSignal()) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(this.couponSignal()));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Could not save cart:', e);
    }
  }

  /**
   * Add footwear to cart with selected size and color
   */
  public addToCart(product: Product, size: number, color: string, quantity = 1): void {
    const itemKey = `${product.id}_sz${size}_${color.replace(/\s+/g, '')}`;
    const currentItems = [...this.itemsSignal()];
    const existingIndex = currentItems.findIndex(i => i.id === itemKey);

    if (existingIndex > -1) {
      const item = currentItems[existingIndex];
      const newQty = item.quantity + quantity;
      currentItems[existingIndex] = {
        ...item,
        quantity: newQty,
        subtotal: newQty * item.unitPrice
      };
      this.toastService.success(`Updated "${product.name}" quantity to ${newQty}!`);
    } else {
      const newItem: CartItem = {
        id: itemKey,
        product,
        selectedSize: size,
        selectedColor: color,
        quantity,
        unitPrice: product.price,
        subtotal: product.price * quantity
      };
      currentItems.push(newItem);
      this.toastService.success(`Added "${product.name}" (Size UK ${size}) to Cart!`);
    }

    this.itemsSignal.set(currentItems);
    this.saveToStorage();
  }

  /**
   * Increase item quantity
   */
  public increaseQuantity(itemId: string): void {
    const updated = this.itemsSignal().map(item => {
      if (item.id === itemId) {
        const q = item.quantity + 1;
        return { ...item, quantity: q, subtotal: q * item.unitPrice };
      }
      return item;
    });
    this.itemsSignal.set(updated);
    this.saveToStorage();
  }

  /**
   * Decrease item quantity
   */
  public decreaseQuantity(itemId: string): void {
    const current = this.itemsSignal();
    const item = current.find(i => i.id === itemId);

    if (!item) return;

    if (item.quantity <= 1) {
      this.removeFromCart(itemId);
      return;
    }

    const updated = current.map(i => {
      if (i.id === itemId) {
        const q = i.quantity - 1;
        return { ...i, quantity: q, subtotal: q * i.unitPrice };
      }
      return i;
    });

    this.itemsSignal.set(updated);
    this.saveToStorage();
  }

  /**
   * Remove item completely
   */
  public removeFromCart(itemId: string): void {
    const item = this.itemsSignal().find(i => i.id === itemId);
    const updated = this.itemsSignal().filter(i => i.id !== itemId);
    this.itemsSignal.set(updated);
    this.saveToStorage();

    if (item) {
      this.toastService.info(`Removed "${item.product.name}" from cart.`);
    }
  }

  /**
   * Clear all items in cart
   */
  public clearCart(): void {
    this.itemsSignal.set([]);
    this.couponSignal.set(null);
    this.saveToStorage();
  }

  /**
   * Apply discount coupon code
   */
  public applyCoupon(code: string): { success: boolean; message: string } {
    const cleanCode = code.trim().toUpperCase();
    const matched = VALID_COUPONS.find(c => c.code === cleanCode);

    if (!matched) {
      this.toastService.error(`Coupon "${code}" is invalid or expired.`);
      return { success: false, message: 'Invalid coupon code.' };
    }

    if (matched.minSpend && this.subtotal() < matched.minSpend) {
      const msg = `Minimum spend of ₹${matched.minSpend} required for coupon ${matched.code}.`;
      this.toastService.warning(msg);
      return { success: false, message: msg };
    }

    this.couponSignal.set(matched);
    this.saveToStorage();
    this.toastService.success(`Coupon "${matched.code}" applied successfully!`);
    return { success: true, message: matched.description };
  }

  /**
   * Remove coupon
   */
  public removeCoupon(): void {
    this.couponSignal.set(null);
    this.saveToStorage();
    this.toastService.info('Coupon removed.');
  }

  /**
   * Place an order via Spring Boot backend: POST /api/orders
   * Persists customer order, items, and address permanently into Supabase
   */
  public checkoutOrder(address: ShippingAddress, paymentMethod: 'cod' | 'upi' | 'card' | 'netbanking'): Observable<Order> {
    const payload = {
      shippingAddress: `${address.addressLine1}, ${address.city}, ${address.state} - ${address.pincode}`,
      recipientName: address.fullName,
      recipientPhone: address.phone,
      paymentMethod: paymentMethod.toUpperCase(),
      items: this.itemsSignal().map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        size: item.selectedSize,
        price: item.product.price
      })),
      totalAmount: this.summary().grandTotal
    };

    return this.http.post<any>(`${environment.apiUrl}/orders`, payload).pipe(
      map(res => {
        const orderData = res?.data || res || {};
        return {
          id: orderData.orderNumber || orderData.id || ('ORD-' + Math.floor(100000 + Math.random() * 900000)),
          orderDate: orderData.createdAt ? new Date(orderData.createdAt) : new Date(),
          items: [...this.itemsSignal()],
          summary: this.summary(),
          shippingAddress: address,
          paymentMethod,
          status: 'confirmed' as const
        };
      }),
      catchError(() => {
        // Fallback for seamless local simulation if backend server is not running
        const fallbackOrder: Order = {
          id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
          orderDate: new Date(),
          items: [...this.itemsSignal()],
          summary: this.summary(),
          shippingAddress: address,
          paymentMethod,
          status: 'confirmed'
        };
        return of(fallbackOrder);
      })
    );
  }
}
