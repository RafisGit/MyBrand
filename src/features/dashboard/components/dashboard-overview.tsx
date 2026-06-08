"use client";

import { useMemo } from "react";
import { MapPin, Package, Sparkles } from "lucide-react";

import type { Address, Order, Product, UserProfile } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist-store";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProductCard } from "@/features/products/components/product-card";

export function DashboardOverview({
  profile,
  addresses,
  orders,
  products,
}: {
  profile: UserProfile;
  addresses: Address[];
  orders: Order[];
  products: Product[];
}) {
  const wishlistIds = useWishlistStore((state) => state.ids);
  const wishlistedProducts = useMemo(
    () => products.filter((product) => wishlistIds.includes(product.id)).slice(0, 4),
    [products, wishlistIds],
  );

  const totalSpend = useMemo(
    () => orders.reduce((runningTotal, order) => runningTotal + order.total, 0),
    [orders],
  );

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2.5rem] border border-black/10 bg-white p-6 sm:p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  Account
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-black">
                  {profile.name}
                </h1>
                <p className="mt-1 text-sm text-zinc-600">{profile.email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Badge variant="secondary">{profile.role}</Badge>
              <SignOutButton />
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[1.75rem] bg-[#f8f5f0] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Orders
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-black">
                {orders.length}
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-[#f8f5f0] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Total Spend
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-black">
                {formatCurrency(totalSpend)}
              </p>
            </div>
            <div className="rounded-[1.75rem] bg-[#f8f5f0] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Wishlist
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-black">
                {wishlistIds.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[2.5rem] border border-black/10 bg-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-black" />
            <h2 className="text-2xl font-semibold tracking-tight text-black">
              Saved Addresses
            </h2>
          </div>
          <div className="mt-6 space-y-4">
            {addresses.map((address) => (
              <div
                key={`${address.addressLine1}-${address.country}`}
                className="rounded-[1.75rem] bg-[#f8f5f0] p-5"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black">
                  {address.fullName}
                </p>
                <p className="mt-2 text-sm leading-7 text-zinc-600">
                  {address.addressLine1}
                  {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                  <br />
                  {address.city}, {address.region} {address.postalCode}
                  <br />
                  {address.country}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[2.5rem] border border-black/10 bg-white p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-black" />
          <h2 className="text-2xl font-semibold tracking-tight text-black">
            Order History
          </h2>
        </div>
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="grid gap-4 rounded-[1.75rem] border border-black/10 p-5 lg:grid-cols-[1fr_auto_auto]"
            >
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-black">
                  {order.id}
                </p>
                <p className="mt-2 text-sm text-zinc-600">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Status
                </p>
                <p className="mt-2 text-sm font-medium text-black capitalize">
                  {order.status}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Total
                </p>
                <p className="mt-2 text-sm font-medium text-black">
                  {formatCurrency(order.total)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-black" />
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-black">
              Wishlist
            </h2>
            <p className="text-sm leading-7 text-zinc-600">
              Stored locally with Zustand and ready to sync to Supabase tables later.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {(wishlistedProducts.length ? wishlistedProducts : products.slice(0, 4)).map(
            (product) => (
              <ProductCard key={product.id} product={product} showQuickView={false} />
            ),
          )}
        </div>
      </section>
    </div>
  );
}
