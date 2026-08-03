"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { ProductGallery } from "@/features/products/components/product-gallery";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export function ProductDetailView({ product }: { product: Product }) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "M");
  const [selectedColor, setSelectedColor] = useState(product.colors[0] ?? "Black");
  const [quantity, setQuantity] = useState(1);

  const stockLabel = useMemo(
    () => (product.stock > 10 ? "In stock" : `Only ${product.stock} left`),
    [product.stock],
  );

  const handleAddToCart = () => {
    addItem({
      product,
      quantity,
      size: selectedSize,
      color: selectedColor,
    });
    toast.success(`${product.name} added to cart`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  return (
    <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 xl:gap-12">
      <ProductGallery name={product.name} images={product.images} />

      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[1.8rem] sm:rounded-[2.2rem] border border-black/10 bg-white p-4.5 sm:p-6">
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {product.featured ? <Badge>Featured</Badge> : null}
            {product.bestSeller ? <Badge variant="secondary">Best Seller</Badge> : null}
          </div>

          <div className="mt-2.5 sm:mt-4 space-y-1 sm:space-y-2">
            <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              {product.collection}
            </p>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-black">
              {product.name}
            </h1>
          </div>

          <div className="mt-3.5 sm:mt-5 flex flex-row items-center justify-between border-t border-black/10 pt-3.5 sm:pt-5">
            <div>
              <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-black">
                {formatCurrency(product.price)}
              </p>
              {product.compareAtPrice ? (
                <p className="mt-0.5 text-xs sm:text-sm text-zinc-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </p>
              ) : null}
            </div>
            <div className="text-right text-xs sm:text-sm text-zinc-500">
              <p className="font-semibold text-black">{stockLabel}</p>
              <p>{product.rating.toFixed(1)} / 5.0 rating</p>
            </div>
          </div>

          <div className="mt-3.5 sm:mt-5 space-y-3 sm:space-y-4">
            <div className="space-y-1 sm:space-y-1.5">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
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

            <div className="space-y-1 sm:space-y-1.5">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Color
              </p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition ${
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

            <div className="space-y-1 sm:space-y-1.5">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Quantity
              </p>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-black/10 bg-[#f6f3ee] px-2 py-1">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="rounded-full px-2.5 py-1 transition hover:bg-black hover:text-white text-xs font-medium"
                >
                  -
                </button>
                <span className="min-w-6 text-center text-xs sm:text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="rounded-full px-2.5 py-1 transition hover:bg-black hover:text-white text-xs font-medium"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-5 flex flex-col gap-2.5">
            <Button size="lg" className="h-10 sm:h-11 w-full text-xs uppercase tracking-[0.18em]" onClick={handleAddToCart}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="h-10 sm:h-11 w-full text-xs uppercase tracking-[0.18em]" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>

          <div className="mt-3.5 sm:mt-4 flex items-center gap-2.5 rounded-[1.25rem] bg-black/5 px-3.5 py-2.5 text-xs text-zinc-600">
            <ShieldCheck className="h-4 w-4 shrink-0 text-black" />
            <span>Secure checkout ready for Stripe & SSLCommerz.</span>
          </div>

          <div className="mt-3.5 sm:mt-4">
            <Accordion type="single" collapsible defaultValue="description">
              <AccordionItem value="description">
                <AccordionTrigger className="py-2.5 text-xs sm:text-xs font-semibold uppercase tracking-[0.16em]">Description</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm leading-relaxed text-zinc-600">{product.story}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger className="py-2.5 text-xs sm:text-xs font-semibold uppercase tracking-[0.16em]">Shipping</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm leading-relaxed text-zinc-600">
                  Free shipping on qualifying orders and global checkout support with Stripe. Bangladesh-specific flows can route through SSLCommerz.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger className="py-2.5 text-xs sm:text-xs font-semibold uppercase tracking-[0.16em]">Care Guide</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm leading-relaxed text-zinc-600">
                  Store folded or on broad hangers, steam lightly, and dry clean when needed to preserve silhouette and fabrication.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="extra">
                <AccordionTrigger className="py-2.5 text-xs sm:text-xs font-semibold uppercase tracking-[0.16em]">Extra</AccordionTrigger>
                <AccordionContent className="text-xs sm:text-sm leading-relaxed text-zinc-600">
                  Materials: {product.materials.join(", ")}. Pair with related pieces in the collection for a complete tonal look.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </div>
    </div>
  );
}
