import { Product } from './product.model';

export interface CartItem {
  id: string; // unique key combining product.id, size, color
  product: Product;
  selectedSize: number;
  selectedColor: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Coupon {
  code: string;
  discountPercentage?: number;
  discountAmount?: number;
  minSpend?: number;
  description: string;
}

export interface CartSummary {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  discount: number;
  coupon?: Coupon;
  shippingFee: number;
  tax: number;
  grandTotal: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
}

export interface Order {
  id: string;
  orderDate: Date;
  items: CartItem[];
  summary: CartSummary;
  shippingAddress: ShippingAddress;
  paymentMethod: 'cod' | 'upi' | 'card' | 'netbanking';
  status: 'confirmed' | 'processing' | 'shipped' | 'delivered';
}
