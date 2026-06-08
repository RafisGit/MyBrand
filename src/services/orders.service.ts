import "server-only";

import { requireAdminUser, requireAuthenticatedUser } from "@/lib/auth";
import type { Json } from "@/lib/supabase/database.types";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { DbOrder, PaymentStatus } from "@/types/backend";
import type { Address, DashboardMetric, Order } from "@/types";
import { AppError } from "@/lib/utils/errors";
import { formatCompactNumber, formatCurrency } from "@/lib/utils";

type OrderQueryRecord = DbOrder & {
  order_items: {
    id: string;
    order_id: string;
    price: number;
    product_variant_id: string;
    quantity: number;
  }[];
};

const ORDER_SELECT = `
  id,
  user_id,
  status,
  total,
  payment_status,
  shipping_address,
  phone,
  payment_method,
  payment_reference,
  created_at,
  updated_at,
  order_items ( id, order_id, product_variant_id, quantity, price )
`;

function mapOrderRecord(record: OrderQueryRecord): Order {
  const shippingAddress = record.shipping_address as unknown as Address;

  return {
    id: record.id,
    userId: record.user_id,
    status: record.status as Order["status"],
    total: Number(record.total),
    paymentStatus: record.payment_status as Order["paymentStatus"],
    shippingAddress,
    createdAt: record.created_at,
    items: record.order_items.map((item) => ({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_variant_id,
      quantity: item.quantity,
      price: Number(item.price),
    })),
  };
}

export async function getOrders() {
  const { profile, supabase } = await requireAuthenticatedUser();

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((record) => mapOrderRecord(record as OrderQueryRecord));
}

export async function getRecentOrders() {
  const { supabase } = await requireAdminUser();

  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  return (data ?? []).map((record) => mapOrderRecord(record as OrderQueryRecord));
}

export async function getDashboardMetrics(): Promise<DashboardMetric[]> {
  const { supabase } = await requireAdminUser();

  const [analyticsResult, ordersCountResult, customersCountResult] = await Promise.all([
    supabase.rpc("get_sales_analytics"),
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "customer"),
  ]);

  if (analyticsResult.error) {
    throw analyticsResult.error;
  }

  const snapshot = analyticsResult.data?.[0] ?? {
    revenue: 0,
    conversion_orders: 0,
    average_order_value: 0,
  };

  return [
    {
      label: "Revenue",
      value: formatCurrency(Number(snapshot.revenue)),
      change: `${formatCompactNumber(Number(snapshot.conversion_orders))} paid orders`,
    },
    {
      label: "Orders",
      value: String(ordersCountResult.count ?? 0),
      change: `${formatCompactNumber(Number(snapshot.conversion_orders))} converted`,
    },
    {
      label: "Customers",
      value: String(customersCountResult.count ?? 0),
      change: `${formatCurrency(Number(snapshot.average_order_value))} AOV`,
    },
  ];
}

export async function createOrderFromCheckoutPayload(input: {
  items: { color: string; productId: string; quantity: number; size: string }[];
  paymentMethod: "stripe" | "sslcommerz";
  paymentReference?: string;
  paymentStatus?: PaymentStatus;
  shippingAddress: Address;
}) {
  const { supabase } = await requireAuthenticatedUser();

  const productIds = Array.from(new Set(input.items.map((item) => item.productId)));

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, product_variants ( id, size, color, stock, sku )",
    )
    .in("id", productIds);

  if (productsError) {
    throw productsError;
  }

  const variantMap = new Map<string, { id: string; stock: number }>();

  for (const product of products ?? []) {
    for (const variant of product.product_variants ?? []) {
      variantMap.set(
        `${product.id}:${variant.size.toLowerCase()}:${variant.color.toLowerCase()}`,
        {
          id: variant.id,
          stock: variant.stock,
        },
      );
    }
  }

  const rpcItems = input.items.map((item) => {
    const key = `${item.productId}:${item.size.toLowerCase()}:${item.color.toLowerCase()}`;
    const variant = variantMap.get(key);

    if (!variant) {
      throw new AppError(
        `Variant not found for ${item.size} / ${item.color}.`,
        400,
      );
    }

    if (variant.stock < item.quantity) {
      throw new AppError(
        `Requested quantity is unavailable for ${item.size} / ${item.color}.`,
        400,
      );
    }

    return {
      product_variant_id: variant.id,
      quantity: item.quantity,
    };
  });

  const { data, error } = await supabase.rpc("create_order", {
    p_items: rpcItems,
    p_shipping_address: input.shippingAddress as unknown as Json,
    p_phone: input.shippingAddress.phone,
    p_payment_method: input.paymentMethod,
    p_payment_reference: input.paymentReference ?? null,
    p_payment_status: input.paymentStatus ?? "unpaid",
  });

  if (error) {
    throw error;
  }

  const createdOrder = data?.[0];

  if (!createdOrder) {
    throw new AppError("Order could not be created.", 500);
  }

  return createdOrder;
}

export async function markOrderPaymentStatusByReference(
  paymentReference: string,
  paymentStatus: PaymentStatus,
) {
  const adminClient = createSupabaseAdminClient();
  const nextStatus = paymentStatus === "paid" ? "confirmed" : "pending";

  const { data, error } = await adminClient
    .from("orders")
    .update({
      payment_status: paymentStatus,
      status: nextStatus,
    })
    .eq("payment_reference", paymentReference)
    .select("*")
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateOrderStatus(
  orderId: string,
  payload: {
    paymentStatus?: PaymentStatus;
    status: Order["status"];
  },
) {
  const { supabase } = await requireAdminUser();

  const { data, error } = await supabase
    .from("orders")
    .update({
      status: payload.status,
      payment_status: payload.paymentStatus,
    })
    .eq("id", orderId)
    .select(ORDER_SELECT)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new AppError("Order not found.", 404);
  }

  return mapOrderRecord(data as OrderQueryRecord);
}
