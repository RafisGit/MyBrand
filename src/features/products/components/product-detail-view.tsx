"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, ShieldCheck, ShoppingBag } from "lucide-react";
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
    <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] xl:gap-16">
      <ProductGallery name={product.name} images={product.images} />

      <div className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-[2.5rem] border border-black/10 bg-white p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            {product.featured ? <Badge>Featured</Badge> : null}
            {product.bestSeller ? <Badge variant="secondary">Best Seller</Badge> : null}
          </div>

          <div className="mt-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              {product.collection}
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">
              {product.name}
            </h1>
            <p className="text-base leading-8 text-zinc-600">
              {product.description}
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-black/10 pt-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-3xl font-semibold tracking-tight text-black">
                {formatCurrency(product.price)}
              </p>
              {product.compareAtPrice ? (
                <p className="mt-2 text-sm text-zinc-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </p>
              ) : null}
            </div>
            <div className="text-right text-sm text-zinc-500">
              <p className="font-medium text-black">{stockLabel}</p>
              <p>{product.rating.toFixed(1)} / 5.0 rating</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-black/10 bg-[#f8f5f0] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Fabric detail
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Explore the craftsmanship in the macro close-up, where stitching, texture, and finish define the luxury narrative.
              </p>
            </div>
            <div className="rounded-[1.75rem] border border-black/10 bg-[#f8f5f0] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Styling note
              </p>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                Maintain tonal cohesion and let the product’s materiality lead the outfit. This piece works best as the anchor of a minimalist edit.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-6">
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

            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
                Quantity
              </p>
              <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-[#f6f3ee] p-2">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  className="rounded-full px-3 py-2 transition hover:bg-black hover:text-white"
                >
                  -
                </button>
                <span className="min-w-8 text-center text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => current + 1)}
                  className="rounded-full px-3 py-2 transition hover:bg-black hover:text-white"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Button size="lg" className="w-full" onClick={handleAddToCart}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
            <Button size="lg" variant="outline" className="w-full" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-[1.5rem] bg-black/5 px-4 py-4 text-sm text-zinc-600">
            <ShieldCheck className="h-5 w-5 text-black" />
            Secure checkout ready for Stripe and SSLCommerz integrations.
          </div>

          <div className="mt-8">
            <Accordion type="single" collapsible defaultValue="description">
              <AccordionItem value="description">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent>{product.story}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping</AccordionTrigger>
                <AccordionContent>
                  Free shipping on qualifying orders and global checkout support with Stripe. Bangladesh-specific flows can route through SSLCommerz.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="care">
                <AccordionTrigger>Care Guide</AccordionTrigger>
                <AccordionContent>
                  Store folded or on broad hangers, steam lightly, and dry clean when needed to preserve silhouette and fabrication.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="extra">
                <AccordionTrigger>Extra</AccordionTrigger>
                <AccordionContent>
                  Materials: {product.materials.join(", ")}. Pair with related pieces in the collection for a complete tonal look.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-black/10 bg-[#f8f5f0] p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-zinc-500">
              Styling note
            </p>
            <p className="mt-3 text-sm leading-7 text-zinc-600">
              Quiet luxury looks best when the palette stays tight. Build around one dominant tone and let texture create contrast.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-black"
            >
              <Check className="h-4 w-4" />
              Explore the full collection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
