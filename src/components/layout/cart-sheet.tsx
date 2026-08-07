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

      <SheetContent className="w-[92vw] sm:w-[440px] max-w-[100vw] gap-6 flex flex-col p-4 sm:p-6 overflow-x-hidden">
        <SheetHeader className="pr-8 text-left">
          <SheetTitle className="text-xl font-bold uppercase tracking-[0.2em] text-black">Shopping Bag</SheetTitle>
          <SheetDescription className="text-xs text-zinc-500">
            Review your selected pieces before proceeding to secure checkout.
          </SheetDescription>
        </SheetHeader>

        {items.length ? (
          <>
            <div className="flex-1 space-y-3.5 overflow-y-auto overflow-x-hidden pr-1">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="grid grid-cols-[68px_minmax(0,1fr)] sm:grid-cols-[84px_minmax(0,1fr)] gap-2.5 sm:gap-3.5 rounded-[1.4rem] sm:rounded-[1.75rem] border border-black/10 bg-white p-2.5 sm:p-3 shadow-sm min-w-0 overflow-hidden"
                >
                  <div className="relative aspect-[3/4] overflow-hidden rounded-[0.9rem] bg-zinc-100 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="84px"
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-between min-w-0 overflow-hidden">
                    <div className="flex items-start justify-between gap-1.5 min-w-0">
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate text-xs sm:text-sm font-semibold uppercase tracking-[0.1em] text-black">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-[10px] sm:text-xs uppercase tracking-[0.14em] text-zinc-500 truncate">
                          {item.color} / {item.size}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color)
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition hover:bg-black hover:text-white active:scale-95 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-1 min-w-0">
                      <div className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-black/10 bg-[#f6f3ee] p-0.5 shrink-0">
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
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black hover:text-white active:scale-95 shrink-0"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-4 sm:min-w-5 text-center text-xs font-semibold select-none">
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
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black hover:text-white active:scale-95 shrink-0"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <p className="text-xs sm:text-sm font-bold text-black shrink-0 whitespace-nowrap ml-auto">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3.5 rounded-[1.5rem] border border-black/10 bg-white p-4.5 shadow-sm">
              <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-600">
                <span>Subtotal</span>
                <span className="font-semibold text-black">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-600">
                <span>Shipping</span>
                <span className="font-semibold text-black">
                  {subtotal >= 5000 ? "Free" : formatCurrency(80)}
                </span>
              </div>
              <Button asChild className="w-full min-h-[50px] rounded-full bg-black text-white font-semibold uppercase tracking-[0.16em] text-xs hover:bg-zinc-800 active:scale-[0.98]">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center rounded-[2rem] border border-dashed border-black/15 bg-white px-6 py-12 text-center">
            <ShoppingBag className="h-10 w-10 text-zinc-400" />
            <h3 className="mt-4 text-base sm:text-lg font-semibold tracking-tight text-black">
              Your cart is empty
            </h3>
            <p className="mt-2 max-w-xs text-xs sm:text-sm leading-relaxed text-zinc-600">
              Add a few pieces from the collection to experience the full checkout flow.
            </p>
            <Button asChild className="mt-6 min-h-[48px] rounded-full px-6 text-xs uppercase tracking-[0.16em]">
              <Link href="/products">Browse Collection</Link>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
