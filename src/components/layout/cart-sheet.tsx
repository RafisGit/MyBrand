"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function CartSheet() {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const itemCount = useCartStore((state) =>
    state.items.reduce((runningTotal, item) => runningTotal + item.quantity, 0),
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          aria-label="Open cart"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-black ring-1 ring-black/10 backdrop-blur transition hover:bg-black hover:text-white"
        >
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-semibold text-white">
              {itemCount}
            </span>
          ) : null}
        </button>
      </SheetTrigger>

      <SheetContent className="gap-6">
        <SheetHeader className="pr-10">
          <SheetTitle>Cart</SheetTitle>
          <SheetDescription>
            A clean, mobile-ready drawer with live totals and quantity controls.
          </SheetDescription>
        </SheetHeader>

        {items.length ? (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="grid grid-cols-[88px_1fr] gap-4 rounded-[1.75rem] border border-black/10 bg-white p-3"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[1.25rem] bg-zinc-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="88px"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {item.color} / {item.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color)
                        }
                        className="rounded-full p-2 text-zinc-500 transition hover:bg-black hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-[#f6f3ee] px-2 py-1">
                        <button
                          type="button"
                          aria-label={`Decrease quantity of ${item.name}`}
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              item.quantity - 1,
                            )
                          }
                          className="rounded-full p-2 transition hover:bg-black hover:text-white"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-6 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`Increase quantity of ${item.name}`}
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.size,
                              item.color,
                              item.quantity + 1,
                            )
                          }
                          className="rounded-full p-2 transition hover:bg-black hover:text-white"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <p className="text-sm font-semibold text-black">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 rounded-[1.75rem] border border-black/10 bg-white p-5">
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <span>Subtotal</span>
                <span className="font-semibold text-black">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm text-zinc-600">
                <span>Shipping</span>
                <span className="font-semibold text-black">
                  {subtotal >= 5000 ? "Free" : formatCurrency(80)}
                </span>
              </div>
              <Button asChild className="w-full">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center rounded-[2rem] border border-dashed border-black/15 bg-white px-8 py-14 text-center">
            <ShoppingBag className="h-10 w-10 text-zinc-400" />
            <h3 className="mt-5 text-lg font-semibold tracking-tight text-black">
              Your cart is empty
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-7 text-zinc-600">
              Add a few pieces from the collection to experience the full checkout flow.
            </p>
            <Button asChild className="mt-6">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
