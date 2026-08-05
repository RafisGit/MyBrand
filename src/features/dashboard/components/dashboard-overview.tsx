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
      <section className="grid gap-4 sm:gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[1.8rem] sm:rounded-[2.5rem] border border-black/10 bg-white p-4.5 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16">
                <AvatarFallback>{profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                  Account
                </p>
                <h1 className="mt-1 text-xl sm:text-3xl font-semibold tracking-[-0.04em] text-black truncate">
                  {profile.name}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 truncate">{profile.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
              <Badge variant="secondary">{profile.role}</Badge>
              <SignOutButton />
            </div>
          </div>

          <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2.5 sm:gap-4">
            <div className="rounded-[1.25rem] sm:rounded-[1.75rem] bg-[#f8f5f0] p-3.5 sm:p-5">
              <p className="text-[9px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Orders
              </p>
              <p className="mt-1.5 sm:mt-3 text-xl sm:text-3xl font-bold tracking-tight text-black">
                {orders.length}
              </p>
            </div>
            <div className="rounded-[1.25rem] sm:rounded-[1.75rem] bg-[#f8f5f0] p-3.5 sm:p-5">
              <p className="text-[9px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500 truncate">
                Spend
              </p>
              <p className="mt-1.5 sm:mt-3 text-sm sm:text-3xl font-bold tracking-tight text-black truncate">
                {formatCurrency(totalSpend)}
              </p>
            </div>
            <div className="rounded-[1.25rem] sm:rounded-[1.75rem] bg-[#f8f5f0] p-3.5 sm:p-5">
              <p className="text-[9px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Wishlist
              </p>
              <p className="mt-1.5 sm:mt-3 text-xl sm:text-3xl font-bold tracking-tight text-black">
                {wishlistIds.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.8rem] sm:rounded-[2.5rem] border border-black/10 bg-white p-4.5 sm:p-8">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-black" />
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-black">
              Saved Addresses
            </h2>
          </div>
          <div className="mt-4 sm:mt-6 space-y-3">
            {addresses.map((address) => (
              <div
                key={`${address.addressLine1}-${address.country}`}
                className="rounded-[1.4rem] sm:rounded-[1.75rem] bg-[#f8f5f0] p-4 sm:p-5"
              >
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.14em] text-black">
                  {address.fullName}
                </p>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-zinc-600">
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

      <section className="rounded-[1.8rem] sm:rounded-[2.5rem] border border-black/10 bg-white p-4.5 sm:p-8">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-black" />
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-black">
            Order History
          </h2>
        </div>
        <div className="mt-4 sm:mt-6 space-y-3">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-[1.4rem] sm:rounded-[1.75rem] border border-black/10 p-4 sm:p-5"
            >
              <div>
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.16em] text-black">
                  {order.id}
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center justify-between sm:gap-8 pt-2 sm:pt-0 border-t sm:border-t-0 border-black/5">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Status
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-black capitalize">
                    {order.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                    Total
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-black">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-black" />
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-black">
              Wishlist
            </h2>
            <p className="text-xs sm:text-sm leading-relaxed text-zinc-600">
              Your saved pieces ready for quick access.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 xl:grid-cols-4">
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
