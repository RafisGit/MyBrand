import { Activity, Boxes, Users } from "lucide-react";

import type { DashboardMetric, Order, Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AdminOverview({
  metrics,
  products,
  orders,
}: {
  metrics: DashboardMetric[];
  products: Product[];
  orders: Order[];
}) {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2.5rem] border border-black/10 bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Admin Dashboard
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-black">
            Manage catalog, users, orders, and premium storefront operations.
          </h1>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div key={metric.label} className="rounded-[1.75rem] bg-[#f8f5f0] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  {metric.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-black">
                  {metric.value}
                </p>
                <p className="mt-2 text-sm text-zinc-500">{metric.change}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-black/10 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-black" />
            <h2 className="text-2xl font-semibold tracking-tight text-black">
              Quick Actions
            </h2>
          </div>
          <div className="mt-6 grid gap-3">
            <Button className="justify-start">Add new product</Button>
            <Button variant="secondary" className="justify-start">
              Upload campaign imagery
            </Button>
            <Button variant="outline" className="justify-start">
              Review pending orders
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-black/10 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <Boxes className="h-5 w-5 text-black" />
          <h2 className="text-2xl font-semibold tracking-tight text-black">
            Product Management
          </h2>
        </div>
        <div className="mt-6 space-y-4">
          {products.slice(0, 6).map((product) => (
            <div
              key={product.id}
              className="grid gap-4 rounded-[1.75rem] border border-black/10 p-5 lg:grid-cols-[1fr_auto_auto_auto]"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black">
                  {product.name}
                </p>
                <p className="mt-2 text-sm text-zinc-600">
                  {typeof product.category === "object" && product.category !== null
                    ? (product.category as { name?: string }).name
                    : String(product.category || "")}{" "}
                  / {product.collection}
                </p>
              </div>
              <p className="text-sm font-medium text-black">
                {formatCurrency(product.price)}
              </p>
              <p className="text-sm font-medium text-black">{product.stock} in stock</p>
              <Badge variant={product.featured ? "default" : "outline"}>
                {product.featured ? "Featured" : "Standard"}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[2.5rem] border border-black/10 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-black" />
            <h2 className="text-2xl font-semibold tracking-tight text-black">
              Order Queue
            </h2>
          </div>
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-[1.75rem] bg-[#f8f5f0] p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black">
                    {order.id}
                  </p>
                  <Badge variant="secondary">{order.status}</Badge>
                </div>
                <p className="mt-3 text-sm text-zinc-600">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="mt-2 text-sm font-medium text-black">
                  {formatCurrency(order.total)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-black/10 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-black" />
            <h2 className="text-2xl font-semibold tracking-tight text-black">
              User Management
            </h2>
          </div>
          <div className="mt-6 grid gap-4">
            <div className="rounded-[1.75rem] bg-[#f8f5f0] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black">
                Active customers
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-black">
                1,248
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-[#f8f5f0] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black">
                Returning customers
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-black">
                42%
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-[#f8f5f0] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black">
                Admin roles
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-black">
                3
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
