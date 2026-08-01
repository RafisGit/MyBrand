"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function QuickViewDialog({
  product,
  children,
}: {
  product: Product;
  children: React.ReactNode;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "M");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "Black");

  useEffect(() => {
    setSelectedSize(product.sizes[0] ?? "M");
    setSelectedColor(product.colors[0] ?? "Black");
  }, [product]);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="overflow-hidden p-0 sm:p-0">
        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[340px] bg-zinc-100 lg:min-h-[640px]">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>

          <div className="flex flex-col justify-between gap-8 p-6 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-3xl tracking-[-0.04em]">
                {product.name}
              </DialogTitle>
              <DialogDescription className="space-y-3">
                <span className="block text-sm font-semibold uppercase tracking-[0.18em] text-black">
                  {formatCurrency(product.price)}
                </span>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Size
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                        selectedSize === size
                          ? "bg-black text-white"
                          : "bg-black/5 text-black hover:bg-black hover:text-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                  Color
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
                        selectedColor === color
                          ? "bg-black text-white"
                          : "bg-black/5 text-black hover:bg-black hover:text-white"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm leading-7 text-zinc-600">{product.story}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1"
                onClick={() => {
                  addItem({
                    product,
                    quantity: 1,
                    size: selectedSize,
                    color: selectedColor,
                  });
                  toast.success(`${product.name} added to cart`);
                }}
              >
                Add to Cart
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/products/${product.slug}`}>View Details</Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
