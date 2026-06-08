import type { CatalogProduct, OrderStatus, ProductStatus } from "@/types/backend";

export interface AdminRevenueSummary {
  dailyRevenue: number;
  monthlyRevenue: number;
  totalSales: number;
  weeklyRevenue: number;
}

export interface AdminOrdersSummary {
  cancelled: number;
  confirmed: number;
  delivered: number;
  pending: number;
  processing: number;
  shipped: number;
  total: number;
}

export interface AdminCustomerSummary {
  newCustomers: number;
  returningCustomers: number;
  totalCustomers: number;
}

export interface AdminProductSummary {
  activeProducts: number;
  archivedProducts: number;
  bestSellingProducts: number;
  lowStockProducts: number;
  totalProducts: number;
}

export interface AdminRevenuePoint {
  dateKey: string;
  label: string;
  orders: number;
  revenue: number;
}

export interface AdminProductPerformancePoint {
  id: string;
  name: string;
  revenue: number;
  status: ProductStatus;
  stock: number;
  unitsSold: number;
}

export interface AdminActivityItem {
  description: string;
  id: string;
  timestamp: string;
  title: string;
  tone: "neutral" | "success" | "warning";
  type: "catalog" | "customer" | "inventory" | "order";
}

export interface AdminOrderRecord {
  createdAt: string;
  customerEmail: string;
  customerId: string;
  customerName: string;
  id: string;
  itemCount: number;
  paymentStatus: string;
  status: OrderStatus;
  total: number;
}

export interface AdminCustomerRecord {
  createdAt: string;
  email: string;
  id: string;
  lastOrderAt: string | null;
  name: string;
  orderCount: number;
  phone: string | null;
  role: "admin" | "customer";
  spending: number;
  status: "new" | "returning" | "vip";
}

export interface AdminCollectionRecord {
  createdAt: string;
  id: string;
  name: string;
  productCount: number;
  slug: string;
}

export interface AdminDashboardData {
  activityFeed: AdminActivityItem[];
  collections: AdminCollectionRecord[];
  customerSummary: AdminCustomerSummary;
  customers: AdminCustomerRecord[];
  orderSummary: AdminOrdersSummary;
  orders: AdminOrderRecord[];
  productPerformance: AdminProductPerformancePoint[];
  productSummary: AdminProductSummary;
  products: CatalogProduct[];
  revenueSeries: AdminRevenuePoint[];
  revenueSummary: AdminRevenueSummary;
}
