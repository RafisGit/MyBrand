import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/auth";
import { listAdminCollections, listAdminProducts } from "@/services/admin.service";
import { createPaginationMeta } from "@/lib/utils/api";
import { getAllHomepageSectionsForAdmin } from "@/services/cms.service";
import type { CatalogProduct } from "@/types/backend";
import type {
  AdminActivityItem,
  AdminCustomerRecord,
  AdminDashboardData,
  AdminOrderRecord,
  AdminProductPerformancePoint,
  AdminRevenuePoint,
} from "@/types/admin";

type OrderRow = {
  created_at: string;
  id: string;
  payment_status: string;
  status: AdminOrderRecord["status"];
  total: number;
  user_id: string;
  users: {
    email: string;
    full_name: string | null;
  } | null;
  order_items: {
    quantity: number;
  }[] | null;
};

type UserRow = {
  created_at: string;
  email: string;
  full_name: string | null;
  id: string;
  phone: string | null;
  role: "admin" | "customer";
};

type ProductOrderRow = {
  price: number;
  quantity: number;
  product_variants:
    | {
        product_id: string;
        products:
          | {
              id: string;
              name: string;
              status: CatalogProduct["status"];
              stock: number;
            }
          | {
              id: string;
              name: string;
              status: CatalogProduct["status"];
              stock: number;
            }[]
          | null;
      }
    | {
        product_id: string;
        products:
          | {
              id: string;
              name: string;
              status: CatalogProduct["status"];
              stock: number;
            }
          | {
              id: string;
              name: string;
              status: CatalogProduct["status"];
              stock: number;
            }[]
          | null;
      }[]
    | null;
};

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function subDays(value: Date, days: number) {
  const copy = new Date(value);
  copy.setDate(copy.getDate() - days);
  return copy;
}

function getDateKey(value: string | Date) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatChartLabel(value: Date) {
  return value.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  });
}

function mapOrderRow(order: OrderRow): AdminOrderRecord {
  const itemCount = (order.order_items ?? []).reduce(
    (runningTotal, item) => runningTotal + item.quantity,
    0,
  );

  return {
    createdAt: order.created_at,
    customerEmail: order.users?.email ?? "Unknown",
    customerId: order.user_id,
    customerName: order.users?.full_name ?? "Customer",
    id: order.id,
    itemCount,
    paymentStatus: order.payment_status,
    status: order.status,
    total: Number(order.total),
  };
}

function buildRevenueSeries(orders: AdminOrderRecord[]): AdminRevenuePoint[] {
  const today = startOfDay(new Date());
  const buckets = new Map<string, AdminRevenuePoint>();

  for (let index = 6; index >= 0; index -= 1) {
    const current = subDays(today, index);
    const key = getDateKey(current);
    buckets.set(key, {
      dateKey: key,
      label: formatChartLabel(current),
      orders: 0,
      revenue: 0,
    });
  }

  for (const order of orders) {
    if (order.paymentStatus !== "paid") {
      continue;
    }

    const bucket = buckets.get(getDateKey(order.createdAt));
    if (!bucket) {
      continue;
    }

    bucket.orders += 1;
    bucket.revenue += order.total;
  }

  return Array.from(buckets.values());
}

function buildProductPerformance(rows: ProductOrderRow[]): AdminProductPerformancePoint[] {
  const aggregate = new Map<string, AdminProductPerformancePoint>();

  for (const row of rows ?? []) {
    if (!row) continue;
    const variantRecord = Array.isArray(row.product_variants)
      ? row.product_variants[0]
      : row.product_variants;
    const productRecord = Array.isArray(variantRecord?.products)
      ? variantRecord?.products[0]
      : variantRecord?.products;

    if (!variantRecord || !productRecord || !productRecord.id) {
      continue;
    }

    const productId = productRecord.id;
    const productName = productRecord.name ?? "Item";
    const productStatus = productRecord.status ?? "active";
    const productStock = Number(productRecord.stock ?? 0);
    const quantity = Number(row.quantity ?? 0);
    const revenue = Number(row.price ?? 0) * quantity;

    const existing = aggregate.get(productId);

    if (existing) {
      existing.unitsSold += quantity;
      existing.revenue += revenue;
      continue;
    }

    aggregate.set(productId, {
      id: productId,
      name: productName,
      revenue,
      status: productStatus,
      stock: productStock,
      unitsSold: quantity,
    });
  }

  return Array.from(aggregate.values())
    .sort((left, right) => right.unitsSold - left.unitsSold)
    .slice(0, 6);
}

function buildActivityFeed(input: {
  customers: AdminCustomerRecord[];
  orders: AdminOrderRecord[];
  performance: AdminProductPerformancePoint[];
  products: CatalogProduct[];
}): AdminActivityItem[] {
  const lowStock = input.products
    .filter((product) => product.stock <= 5)
    .slice(0, 2)
    .map((product) => ({
      description: `${product.stock} units left across active variants.`,
      id: `inventory-${product.id}`,
      timestamp: product.updatedAt,
      title: `${product.name} is approaching low stock`,
      tone: "warning" as const,
      type: "inventory" as const,
    }));

  const latestOrders = input.orders.slice(0, 3).map((order) => ({
    description: `${order.customerName} placed ${order.itemCount} item(s) worth $${Math.round(order.total)}.`,
    id: `order-${order.id}`,
    timestamp: order.createdAt,
    title: `Order ${order.id.slice(0, 8)} moved into ${order.status}`,
    tone: order.paymentStatus === "paid" ? ("success" as const) : ("neutral" as const),
    type: "order" as const,
  }));

  const newCustomers = input.customers
    .filter((customer) => customer.status === "new")
    .slice(0, 2)
    .map((customer) => ({
      description: `${customer.email} joined the VALTORN customer base.`,
      id: `customer-${customer.id}`,
      timestamp: customer.createdAt,
      title: `${customer.name} created a new account`,
      tone: "neutral" as const,
      type: "customer" as const,
    }));

  const bestSeller = input.performance[0];
  const catalogItem = bestSeller
    ? [
        {
          description: `${bestSeller.unitsSold} units sold with $${Math.round(bestSeller.revenue)} in attributed revenue.`,
          id: `catalog-${bestSeller.id}`,
          timestamp: new Date().toISOString(),
          title: `${bestSeller.name} is leading product performance`,
          tone: "success" as const,
          type: "catalog" as const,
        },
      ]
    : [];

  return [...latestOrders, ...lowStock, ...newCustomers, ...catalogItem]
    .sort(
      (left, right) =>
        new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime(),
    )
    .slice(0, 8);
}

export async function getAdminDashboardData(): Promise<AdminDashboardData> {
  await requireAdminUser();
  const adminClient = createSupabaseAdminClient();

  const [productsResult, ordersResult, usersResult, collectionsResult, orderItemsResult] =
    await Promise.all([
      listAdminProducts(1, 50).then(
        (result) => result,
        (err) => { console.warn("Admin dashboard products query warning:", err?.message ?? err); return { data: [] as CatalogProduct[], meta: createPaginationMeta(1, 50, 0) }; },
      ),
      adminClient
        .from("orders")
        .select(
          "id, created_at, total, status, payment_status, user_id, users ( full_name, email ), order_items ( quantity )",
        )
        .order("created_at", { ascending: false })
        .limit(24),
      adminClient
        .from("users")
        .select("id, full_name, email, phone, role, created_at")
        .order("created_at", { ascending: false })
        .limit(50),
      listAdminCollections().then(
        (result) => result,
        (err) => { console.warn("Admin dashboard collections query warning:", err?.message ?? err); return [] as Awaited<ReturnType<typeof listAdminCollections>>; },
      ),
      adminClient
        .from("order_items")
        .select(
          "quantity, price, product_variants!inner ( product_id, products!inner ( id, name, stock, status ) )",
        ),
    ]);

  if (ordersResult.error) console.warn("Admin dashboard orders query warning:", ordersResult.error.message);
  if (usersResult.error) console.warn("Admin dashboard users query warning:", usersResult.error.message);
  if (orderItemsResult.error) console.warn("Admin dashboard order items query warning:", orderItemsResult.error.message);

  const products = productsResult.data ?? [];
  const orders = (ordersResult.data ?? []).map((order) => mapOrderRow(order as OrderRow));
  const customersSource = (usersResult.data ?? []) as UserRow[];
  const collections = collectionsResult ?? [];
  const productPerformance = buildProductPerformance(
    (orderItemsResult.data ?? []) as ProductOrderRow[],
  );

  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  const revenueSummary = {
    dailyRevenue: paidOrders
      .filter((order) => now - new Date(order.createdAt).getTime() <= oneDayMs)
      .reduce((sum, order) => sum + order.total, 0),
    monthlyRevenue: paidOrders
      .filter((order) => now - new Date(order.createdAt).getTime() <= 30 * oneDayMs)
      .reduce((sum, order) => sum + order.total, 0),
    totalSales: paidOrders.reduce((sum, order) => sum + order.total, 0),
    weeklyRevenue: paidOrders
      .filter((order) => now - new Date(order.createdAt).getTime() <= 7 * oneDayMs)
      .reduce((sum, order) => sum + order.total, 0),
  };

  const orderSummary = {
    cancelled: orders.filter((order) => order.status === "cancelled").length,
    confirmed: orders.filter((order) => order.status === "confirmed").length,
    delivered: orders.filter((order) => order.status === "delivered").length,
    pending: orders.filter((order) => order.status === "pending").length,
    processing: orders.filter((order) => order.status === "processing").length,
    shipped: orders.filter((order) => order.status === "shipped").length,
    total: orders.length,
  };

  const customerOrderMap = new Map<string, { count: number; lastOrderAt: string | null; spending: number }>();

  for (const order of orders) {
    const existing = customerOrderMap.get(order.customerId) ?? {
      count: 0,
      lastOrderAt: null,
      spending: 0,
    };

    customerOrderMap.set(order.customerId, {
      count: existing.count + 1,
      lastOrderAt:
        !existing.lastOrderAt ||
        new Date(order.createdAt).getTime() > new Date(existing.lastOrderAt).getTime()
          ? order.createdAt
          : existing.lastOrderAt,
      spending: existing.spending + order.total,
    });
  }

  const customers = customersSource
    .filter((user) => user.role === "customer")
    .map<AdminCustomerRecord>((user) => {
      const orderStats = customerOrderMap.get(user.id) ?? {
        count: 0,
        lastOrderAt: null,
        spending: 0,
      };
      const ageDays =
        (now - new Date(user.created_at).getTime()) / oneDayMs;

      const status: AdminCustomerRecord["status"] =
        orderStats.spending >= 1000
          ? "vip"
          : orderStats.count > 1
            ? "returning"
            : "new";

      return {
        createdAt: user.created_at,
        email: user.email,
        id: user.id,
        lastOrderAt: orderStats.lastOrderAt,
        name: user.full_name ?? "Customer",
        orderCount: orderStats.count,
        phone: user.phone,
        role: user.role,
        spending: orderStats.spending,
        status: ageDays <= 30 && orderStats.count <= 1 ? "new" : status,
      };
    });

  const customerSummary = {
    newCustomers: customers.filter((customer) => customer.status === "new").length,
    returningCustomers: customers.filter(
      (customer) => customer.status === "returning" || customer.status === "vip",
    ).length,
    totalCustomers: customers.length,
  };

  const productSummary = {
    activeProducts: products.filter((product) => product.status === "active").length,
    archivedProducts: products.filter((product) => product.status === "archived").length,
    bestSellingProducts: productPerformance.length,
    lowStockProducts: products.filter((product) => product.stock <= 5).length,
    totalProducts: products.length,
  };

  const homepageSections = await getAllHomepageSectionsForAdmin();

  return {
    activityFeed: buildActivityFeed({
      customers,
      orders,
      performance: productPerformance,
      products,
    }),
    collections,
    customerSummary,
    customers,
    homepageSections,
    orderSummary,
    orders,
    productPerformance,
    productSummary,
    products,
    revenueSeries: buildRevenueSeries(orders),
    revenueSummary,
  };
}
