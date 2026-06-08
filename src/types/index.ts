export type ProductCategory =
  | "Men"
  | "Women"
  | "Menswear"
  | "Womenswear"
  | "Oversized"
  | "Hoodies"
  | "Streetwear"
  | "Thobes"
  | "Panjabi"
  | "Sherwani";

export type PaymentMethod = "stripe" | "sslcommerz";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "unpaid" | "paid" | "failed" | "refunded";

export type UserRole = "customer" | "admin";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  story: string;
  price: number;
  compareAtPrice?: number;
  category: ProductCategory;
  collection: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  bestSeller: boolean;
  rating: number;
  materials: string[];
  seoDescription: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  size: string;
  color: string;
  quantity: number;
}

export interface Address {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  paymentStatus: PaymentStatus;
  shippingAddress: Address;
  createdAt: string;
  items: OrderItem[];
}

export interface CategoryHighlight {
  name: ProductCategory;
  image: string;
  description: string;
}

export interface EditorialFeature {
  title: string;
  body: string;
}

export interface SocialImage {
  id: string;
  image: string;
  title: string;
}

export interface DashboardMetric {
  label: string;
  value: string;
  change: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface CheckoutPayload {
  items: CartItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
}

export interface ProductFilters {
  category: string;
  size: string;
  color: string;
  sort: "latest" | "popular" | "price-asc" | "price-desc";
  search: string;
  maxPrice: number;
}
