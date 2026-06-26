export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  children?: Category[];
}

export interface ProductVariant {
  id: string;
  name: string;
  size?: string;
  color?: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  category: string;
  brand?: string;
  rating: number;
  stock: number;
  variants?: ProductVariant[];
}

export interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  product?: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface OrderQuote {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  quoteId?: string;
}

export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  product?: Product;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  orderId: string;
  date: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  address: Address;
  paymentMethod: string;
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface ReturnItem {
  orderItemId: string;
  productId: string;
  quantity: number;
  reason: 'defective' | 'wrong_item' | 'not_needed' | 'other';
}

export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'completed';

export interface ReturnRequest {
  id: string;
  returnId: string;
  orderId: string;
  items: ReturnItem[];
  reason: string;
  description: string;
  resolution: 'refund' | 'replacement';
  status: ReturnStatus;
  createdAt: string;
}
