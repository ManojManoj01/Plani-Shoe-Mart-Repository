export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  items: OrderItem[];
  shippingAddress: string;
  createdAt: string;
}
