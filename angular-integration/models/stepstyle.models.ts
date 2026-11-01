// ==============================================================================
// StepStyle Footwear Store - TypeScript Interfaces Matching Backend DTOs
// ==============================================================================

export type Role = 'ROLE_USER' | 'ROLE_ADMIN';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export type ProductCategory =
  | "Men's Shoes"
  | "Women's Shoes"
  | "Kids' Shoes"
  | "Sports Shoes"
  | "Formal Shoes"
  | "Casual Shoes"
  | "Chappals"
  | "Slippers";

// Standard API Response Envelope
export interface ApiResponse<T = void> {
  success: boolean;
  message: string;
  timestamp: string;
  data: T;
}

// Standard Error Response
export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  fieldErrors?: Record<string, string>;
}

// Authentication & User Models
export interface UserSummaryDto {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface RegisterRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number; // in seconds
  user: UserSummaryDto;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken?: string;
}

// Product Models
export interface ProductResponseDto {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice: number;
  category: ProductCategory | string;
  availableSizes: string[];
  availableColors: string[];
  stockQuantity: number;
  imageUrl?: string;
  discountPercentage: number;
  rating: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductRequestDto {
  name: string;
  brand: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  availableSizes: string[];
  availableColors: string[];
  stockQuantity: number;
  imageUrl?: string;
  discountPercentage?: number;
  rating?: number;
  active: boolean;
}

export interface ProductPageResponse {
  content: ProductResponseDto[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Shopping Cart Models
export interface CartItemResponseDto {
  id: number;
  productId: number;
  productName: string;
  productBrand: string;
  productImageUrl?: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  inStock: boolean;
  availableStock: number;
}

export interface CartResponseDto {
  id: number;
  items: CartItemResponseDto[];
  totalItems: number;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
}

export interface AddToCartRequest {
  productId: number;
  size: string;
  color: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
  size?: string;
  color?: string;
}

// Order Models
export interface CreateOrderRequest {
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  paymentMethod: 'COD' | 'CARD' | 'UPI' | string;
}

export interface OrderItemResponseDto {
  id: number;
  productId: number;
  productName: string;
  productBrand: string;
  productImageUrl?: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponseDto {
  id: number;
  orderNumber: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  items: OrderItemResponseDto[];
}

// Shop Location Model
export interface ShopLocationDto {
  shopName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phoneNumber: string;
  openingHours: string;
  latitude: number;
  longitude: number;
}

// Contact Enquiry Models
export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  resolved: boolean;
  createdAt: string;
}
