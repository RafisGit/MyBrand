"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { motion } from "framer-motion";

import { useWishlistStore } from "@/store/wishlist-store";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { QuickViewDialog } from "@/features/products/components/quick-view-dialog";

export function ProductCard({
  product,
  showQuickView = true,
}: {
  product: Product;
  showQuickView?: boolean;
}) {
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.ids.includes(product.id));

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_80px_-60px_rgba(0,0,0,0.35)] transition duration-300 hover:border-black/10"
    >
      <div className="absolute left-4 top-4 z-10 flex gap-2">
        {product.bestSeller ? <Badge>Best Seller</Badge> : null}
        {product.featured ? <Badge variant="secondary">Featured</Badge> : null}
      </div>

      <div className="absolute right-4 top-4 z-10 flex items-center gap-2 opacity-0 transition duration-300 group-hover:opacity-100">
        {showQuickView ? (
          <QuickViewDialog product={product}>
            <button
              type="button"
              aria-label={`Quick view ${product.name}`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/88 text-black backdrop-blur transition hover:bg-black hover:text-white"
            >
              <Eye className="h-4 w-4" />
            </button>
          </QuickViewDialog>
        ) : null}
        <button
          type="button"
          aria-label={`Toggle wishlist for ${product.name}`}
          onClick={() => toggleItem(product.id)}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-full backdrop-blur transition ${
            isWishlisted
              ? "bg-black text-white"
              : "bg-white/88 text-black hover:bg-black hover:text-white"
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      <Link href={`/products/${product.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04),transparent_40%)]" />
          {product.images[1] ? (
            <Image
              src={product.images[1]}
              alt={`${product.name} alternate view`}
              fill
              className="object-cover opacity-0 transition duration-700 group-hover:opacity-100"
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 40vw, 100vw"
            />
          ) : null}
        </div>
      </Link>

      <div className="space-y-3 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold tracking-tight text-black">
              {product.name}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.24em] text-zinc-500">
              {product.collection}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-black">
              {formatCurrency(product.price)}
            </p>
            {product.compareAtPrice ? (
              <p className="mt-1 text-xs text-zinc-400 line-through">
                {formatCurrency(product.compareAtPrice)}
              </p>
            ) : null}
          </div>
        </div>

        <p className="text-sm leading-7 text-zinc-600">{product.shortDescription}</p>
      </div>
    </motion.article>
  );
}
