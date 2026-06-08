import type {
  Database,
  Enums,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/lib/supabase/database.types";

export type UserRole = Enums<"app_role">;
export type ProductStatus = Enums<"product_status">;
export type ProductGender = Enums<"product_gender">;
export type OrderStatus = Enums<"order_status">;
export type PaymentStatus = Enums<"payment_status">;
export type PaymentMethod = Enums<"payment_method">;

export type DbUser = Tables<"users">;
export type DbCategory = Tables<"categories">;
export type DbProduct = Tables<"products">;
export type DbProductImage = Tables<"product_images">;
export type DbProductVariant = Tables<"product_variants">;
export type DbCartItem = Tables<"cart_items">;
export type DbOrder = Tables<"orders">;
export type DbOrderItem = Tables<"order_items">;
export type DbReview = Tables<"reviews">;
export type DbWishlist = Tables<"wishlist">;

export type NewCategory = TablesInsert<"categories">;
export type UpdateCategory = TablesUpdate<"categories">;
export type NewProduct = TablesInsert<"products">;
export type UpdateProduct = TablesUpdate<"products">;
export type NewVariant = TablesInsert<"product_variants">;
export type NewImage = TablesInsert<"product_images">;
export type UpdateOrder = TablesUpdate<"orders">;

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ProductSearchParams {
  query?: string;
  category?: string;
  featured?: boolean;
  gender?: ProductGender;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  sort?: "latest" | "price-asc" | "price-desc" | "featured";
  page?: number;
  pageSize?: number;
}

export interface ProductVariantSummary {
  id: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice: number | null;
  stock: number;
  gender: ProductGender | null;
  featured: boolean;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string | null;
    name: string | null;
    slug: string | null;
  };
  images: string[];
  primaryImage: string | null;
  availableSizes: string[];
  availableColors: string[];
  variants: ProductVariantSummary[];
  averageRating: number | null;
  reviewCount: number;
}

export interface CartLineItem {
  id: string;
  quantity: number;
  createdAt: string;
  variant: ProductVariantSummary & {
    product: Pick<
      CatalogProduct,
      | "id"
      | "name"
      | "slug"
      | "price"
      | "discountPrice"
      | "stock"
      | "images"
      | "primaryImage"
    >;
  };
}

export interface CheckoutItemInput {
  productVariantId: string;
  quantity: number;
}

export interface CheckoutAddressInput {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
  notes?: string;
}

export interface CheckoutRequest {
  items: CheckoutItemInput[];
  shippingAddress: CheckoutAddressInput;
  paymentMethod: PaymentMethod;
  paymentReference?: string;
}

export interface SalesAnalyticsSnapshot {
  revenue: number;
  conversionOrders: number;
  averageOrderValue: number;
}

export type SearchProductsRpcRow =
  Database["public"]["Functions"]["search_products"]["Returns"][number];

export interface OrderCreateRpcInput {
  p_items: Json;
  p_payment_method: PaymentMethod;
  p_payment_reference?: string | null;
  p_payment_status?: PaymentStatus;
  p_phone: string;
  p_shipping_address: Json;
}
