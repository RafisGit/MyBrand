"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Heart, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuickViewDialog } from "@/features/products/components/quick-view-dialog";

export function ProductCard({
  product,
  showQuickView = true,
}: {
  product: Product;
  showQuickView?: boolean;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.ids.includes(product.id));

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock < 1) {
      toast.info("This piece is currently unavailable.");
      return;
    }

    addItem({
      product,
      quantity: 1,
      size: product.sizes[0] ?? "M",
      color: product.colors[0] ?? "Black",
    });

    toast.success(`${product.name} added to bag.`);
  };

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_80px_-60px_rgba(0,0,0,0.35)] flex flex-col justify-between"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
          />
          {product.images[1] ? (
            <Image
              src={product.images[1]}
              alt={`${product.name} alternate view`}
              fill
              className="object-cover opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20 opacity-30 transition-opacity duration-300 group-hover:opacity-70" />
        </Link>

        {/* Top Badges */}
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-1.5 max-w-[70%]">
          {(() => {
            const badges: Array<{ label: string; className: string }> = [];

            const isOnSale = Boolean(product.onSale || (product.compareAtPrice && product.compareAtPrice > product.price));
            if (isOnSale) {
              badges.push({ label: "SALE", className: "bg-rose-600/90 text-white border-rose-500/30 font-bold" });
            }
            if (product.bestSeller) {
              badges.push({ label: "BEST SELLER", className: "bg-amber-500/90 text-black font-bold border-amber-400/40" });
            }
            if (product.newArrival) {
              badges.push({ label: "NEW", className: "bg-emerald-600/90 text-white border-emerald-500/30" });
            }
            if (product.limitedEdition) {
              badges.push({ label: "LIMITED", className: "bg-purple-600/90 text-white border-purple-500/30" });
            }
            if (product.trending) {
              badges.push({ label: "TRENDING", className: "bg-orange-600/90 text-white border-orange-500/30" });
            }
            if (product.featured) {
              badges.push({ label: "FEATURED", className: "bg-indigo-600/90 text-white border-indigo-500/30" });
            }
            if (product.recommended) {
              badges.push({ label: "RECOMMENDED", className: "bg-sky-600/90 text-white border-sky-500/30" });
            }

            return badges.slice(0, 2).map((badge) => (
              <Badge
                key={badge.label}
                className={`uppercase tracking-[0.18em] text-[9px] px-2 py-0.5 backdrop-blur-md shadow-sm border ${badge.className}`}
              >
                {badge.label}
              </Badge>
            ));
          })()}
        </div>

        {/* Top-right Actions */}
        <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
          {showQuickView ? (
            <QuickViewDialog product={product}>
              <button
                type="button"
                aria-label={`Quick view ${product.name}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/88 text-black backdrop-blur-md transition hover:bg-black hover:text-white shadow-md"
              >
                <Eye className="h-4 w-4" />
              </button>
            </QuickViewDialog>
          ) : null}
          <button
            type="button"
            aria-label={`Toggle wishlist for ${product.name}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleItem(product.id);
            }}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300 shadow-md ${
              isWishlisted
                ? "bg-black text-white"
                : "bg-white/88 text-black hover:bg-black hover:text-white"
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Centered Glassmorphic Quick Add Button inside Image container */}
        <div className="absolute inset-x-4 bottom-4 z-10 flex justify-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-4 sm:scale-95 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:scale-100">
          <Button
            type="button"
            onClick={handleQuickAdd}
            className="h-11 w-full max-w-[92%] rounded-full border border-white/40 bg-white/90 text-black shadow-lg backdrop-blur-md text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Quick Add To Cart
          </Button>
        </div>
      </div>

      {/* Info Section below Image */}
      <div className="space-y-2.5 p-3.5 sm:p-4.5">
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            {product.collection || product.category || "Valtorn Essential"}
          </p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <Link href={`/products/${product.slug}`} className="block min-w-0 flex-1">
              <h3 className="truncate text-base sm:text-lg font-semibold tracking-tight text-black hover:text-zinc-700 transition">
                {product.name}
              </h3>
            </Link>
            <div className="shrink-0 text-right">
              <p className="text-base sm:text-lg font-bold tracking-tight text-black">
                {formatCurrency(product.price)}
              </p>
              {product.compareAtPrice ? (
                <p className="text-[11px] text-zinc-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {product.shortDescription ? (
          <p className="text-xs leading-relaxed text-zinc-600 line-clamp-2">{product.shortDescription}</p>
        ) : null}
      </div>
    </motion.article>
  );
}
