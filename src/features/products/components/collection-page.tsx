"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";

import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { AnimatedSection } from "@/components/shared/animated-section";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CollectionFilter =
  | "all"
  | "best-sellers"
  | "new-arrivals"
  | "oversized-fits"
  | "pants"
  | "t-shirts";

type SortOption = "featured" | "latest" | "price-asc" | "price-desc";

type ProductDisplayMeta = {
  accent: string;
  badge: string;
  categoryLabel: string;
  filters: CollectionFilter[];
  images: [string, string];
  mood: string;
  priority: number;
};

const filterOptions: { label: string; value: CollectionFilter }[] = [
  { label: "T-Shirts", value: "t-shirts" },
  { label: "Pants", value: "pants" },
  { label: "Oversized Fits", value: "oversized-fits" },
  { label: "New Arrivals", value: "new-arrivals" },
  { label: "Best Sellers", value: "best-sellers" },
];

const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Featured", value: "featured" },
  { label: "Price Low to High", value: "price-asc" },
  { label: "Price High to Low", value: "price-desc" },
  { label: "Latest", value: "latest" },
];

const collectionProductMeta: Record<string, ProductDisplayMeta> = {
  "bone-heavyweight-hoodie": {
    accent: "Premium fleece",
    badge: "Core Layer",
    categoryLabel: "Heavyweight Hoodie",
    filters: ["all", "oversized-fits", "new-arrivals"],
    images: [
      "https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg?cs=srgb&dl=pexels-karolina-grabowska-4210866.jpg&fm=jpg",
      "https://images.pexels.com/photos/35586905/pexels-photo-35586905.jpeg?cs=srgb&dl=pexels-jc-qi-2157200577-35586905.jpg&fm=jpg",
    ],
    mood: "Soft structure",
    priority: 4,
  },
  "charcoal-knit-polo": {
    accent: "Sharp texture",
    badge: "Everyday Essential",
    categoryLabel: "Knit Essential",
    filters: ["all", "new-arrivals"],
    images: [
      "https://images.pexels.com/photos/35586905/pexels-photo-35586905.jpeg?cs=srgb&dl=pexels-jc-qi-2157200577-35586905.jpg&fm=jpg",
      "https://images.pexels.com/photos/7717491/pexels-photo-7717491.jpeg?cs=srgb&dl=pexels-marina-zasorina-7717491.jpg&fm=jpg",
    ],
    mood: "Dry-hand knit",
    priority: 6,
  },
  "olive-transit-bomber": {
    accent: "Utility volume",
    badge: "Street Layer",
    categoryLabel: "Transit Bomber",
    filters: ["all", "best-sellers", "oversized-fits"],
    images: [
      "https://images.pexels.com/photos/35586905/pexels-photo-35586905.jpeg?cs=srgb&dl=pexels-jc-qi-2157200577-35586905.jpg&fm=jpg",
      "https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg?cs=srgb&dl=pexels-karolina-grabowska-4210866.jpg&fm=jpg",
    ],
    mood: "Muted outerwear",
    priority: 5,
  },
  "sand-utility-shirt": {
    accent: "Clean workwear",
    badge: "Daily Rotation",
    categoryLabel: "Utility Overshirt",
    filters: ["all", "new-arrivals"],
    images: [
      "https://images.pexels.com/photos/35586905/pexels-photo-35586905.jpeg?cs=srgb&dl=pexels-jc-qi-2157200577-35586905.jpg&fm=jpg",
      "https://images.pexels.com/photos/4862951/pexels-photo-4862951.jpeg?cs=srgb&dl=pexels-karolina-grabowska-4862951.jpg&fm=jpg",
    ],
    mood: "Matte hardware",
    priority: 3,
  },
  "shadow-oversized-tee": {
    accent: "320gsm cotton",
    badge: "Launch Focus",
    categoryLabel: "Oversized T-Shirt",
    filters: ["all", "best-sellers", "new-arrivals", "oversized-fits", "t-shirts"],
    images: [
      "https://images.pexels.com/photos/35625406/pexels-photo-35625406.jpeg?cs=srgb&dl=pexels-joint-x-2158831780-35625406.jpg&fm=jpg",
      "https://images.pexels.com/photos/7717491/pexels-photo-7717491.jpeg?cs=srgb&dl=pexels-marina-zasorina-7717491.jpg&fm=jpg",
    ],
    mood: "Heavyweight drape",
    priority: 1,
  },
  "taupe-studio-trouser": {
    accent: "Relaxed tailoring",
    badge: "Precision Fit",
    categoryLabel: "Premium Trouser",
    filters: ["all", "new-arrivals", "pants"],
    images: [
      "https://images.pexels.com/photos/20094389/pexels-photo-20094389.jpeg?cs=srgb&dl=pexels-thomas-richard-945930195-20094389.jpg&fm=jpg",
      "https://images.pexels.com/photos/4862951/pexels-photo-4862951.jpeg?cs=srgb&dl=pexels-karolina-grabowska-4862951.jpg&fm=jpg",
    ],
    mood: "Studio structure",
    priority: 2,
  },
};

function resolveDefaultFilter(category?: string, sort?: string): CollectionFilter {
  if (sort === "popular") {
    return "best-sellers";
  }

  if (sort === "latest") {
    return "new-arrivals";
  }

  if ((category ?? "").toLowerCase() === "oversized") {
    return "oversized-fits";
  }

  return "all";
}

function resolveDefaultSort(sort?: string): SortOption {
  if (sort === "price-asc" || sort === "price-desc" || sort === "latest") {
    return sort;
  }

  return "featured";
}

function CollectionProductCard({
  entry,
}: {
  entry: { meta: ProductDisplayMeta; product: Product };
}) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleItem = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.ids.includes(entry.product.id));

  const handleQuickAdd = () => {
    if (entry.product.stock < 1) {
      toast.info("This piece is currently unavailable.");
      return;
    }

    addItem({
      product: entry.product,
      quantity: 1,
      size: entry.product.sizes[0] ?? "M",
      color: entry.product.colors[0] ?? "Black",
    });

    toast.success(`${entry.product.name} added to bag.`);
  };

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group overflow-hidden rounded-[2rem] border border-white/8 bg-[#101010] shadow-[0_40px_120px_-80px_rgba(0,0,0,1)]"
    >
      <Link href={`/products/${entry.product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#171717]">
          <Image
            src={entry.meta.images[0]}
            alt={entry.product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.03]"
            sizes="(min-width: 1280px) 24vw, (min-width: 768px) 40vw, 100vw"
          />
          <Image
            src={entry.meta.images[1]}
            alt={`${entry.product.name} detail`}
            fill
            className="object-cover opacity-0 transition duration-700 group-hover:opacity-100"
            sizes="(min-width: 1280px) 24vw, (min-width: 768px) 40vw, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,7,0.02),rgba(7,7,7,0.76))]" />

          <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f5efe7]">
            {entry.meta.badge}
          </div>

          <button
            type="button"
            aria-label={`Toggle wishlist for ${entry.product.name}`}
            onClick={(event) => {
              event.preventDefault();
              toggleItem(entry.product.id);
            }}
            className={`absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 backdrop-blur transition ${
              isWishlisted
                ? "bg-[#f5efe7] text-black"
                : "bg-black/35 text-white hover:bg-[#f5efe7] hover:text-black"
            }`}
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
          </button>

          <div className="absolute inset-x-5 bottom-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#ccb79d]">
              {entry.meta.mood}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#f5efe7]">{entry.meta.accent}</p>
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#a59d90]">
              {entry.meta.categoryLabel}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#f5efe7]">
              {entry.product.name}
            </h3>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-[#f5efe7]">
              {formatCurrency(entry.product.price)}
            </p>
            {entry.product.compareAtPrice ? (
              <p className="mt-1 text-xs text-[#827b70] line-through">
                {formatCurrency(entry.product.compareAtPrice)}
              </p>
            ) : null}
          </div>
        </div>

        <p className="text-sm leading-7 text-[#9f988b]">{entry.product.shortDescription}</p>

        <Button
          type="button"
          onClick={handleQuickAdd}
          className="h-12 w-full bg-[#f5efe7] text-black hover:bg-[#d8c7b0]"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Quick Add To Cart
        </Button>
      </div>
    </motion.article>
  );
}

function MobileCartBar() {
  const subtotal = useCartStore((state) => state.getSubtotal());
  const itemCount = useCartStore((state) => state.getItemCount());

  // Don't render if cart is empty
  if (itemCount < 1) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-4 bottom-4 z-30 sm:hidden">
      <div className="pointer-events-auto flex items-center justify-between rounded-[1.6rem] border border-white/10 bg-[#0e0e0e]/95 px-4 py-3 shadow-[0_30px_90px_-50px_rgba(0,0,0,1)] backdrop-blur-xl">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#a59d90]">
            Cart
          </p>
          <p className="mt-1 text-sm font-semibold text-[#f5efe7]">
            {`${itemCount} item${itemCount === 1 ? "" : "s"}`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-[#f5efe7]">{formatCurrency(subtotal)}</p>
          <Button
            asChild
            size="sm"
            className="bg-[#f5efe7] text-black hover:bg-[#d8c7b0]"
          >
            <Link href="/checkout">Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CollectionPage({
  defaultCategory,
  defaultSortParam,
  products,
}: {
  defaultCategory?: string;
  defaultSortParam?: string;
  products: Product[];
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>(resolveDefaultSort(defaultSortParam));
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>(
    resolveDefaultFilter(defaultCategory, defaultSortParam),
  );
  const deferredQuery = useDeferredValue(query);

  const curatedProducts = useMemo(() => {
    return Object.entries(collectionProductMeta)
      .map(([slug, meta]) => {
        const product = products.find((item) => item.slug === slug);

        if (!product) {
          return null;
        }

        return { meta, product };
      })
      .filter((item): item is { meta: ProductDisplayMeta; product: Product } => Boolean(item));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = deferredQuery.toLowerCase().trim();

    const visibleProducts = curatedProducts.filter((entry) => {
      const matchesFilter =
        activeFilter === "all" || entry.meta.filters.includes(activeFilter);
      const matchesQuery =
        !normalizedQuery ||
        `${entry.product.name} ${entry.meta.categoryLabel} ${entry.product.shortDescription}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });

    return [...visibleProducts].sort((left, right) => {
      if (sort === "price-asc") {
        return left.product.price - right.product.price;
      }

      if (sort === "price-desc") {
        return right.product.price - left.product.price;
      }

      if (sort === "latest") {
        return (
          new Date(right.product.createdAt).getTime() -
          new Date(left.product.createdAt).getTime()
        );
      }

      return left.meta.priority - right.meta.priority;
    });
  }, [activeFilter, curatedProducts, deferredQuery, sort]);

  return (
    <div
      className="bg-white pb-20 text-[#111111] sm:pb-8"
      style={{
        fontFamily:
          '"Inter","Neue Montreal","General Sans","Satoshi","Helvetica Neue",system-ui,sans-serif',
      }}
    >
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <AnimatedSection>
          <section className="relative overflow-hidden rounded-[2.8rem] border border-white/8 bg-[radial-gradient(circle_at_top,rgba(205,183,158,0.12),transparent_24%),linear-gradient(180deg,#121212_0%,#060606_100%)] p-6 shadow-[0_50px_150px_-70px_rgba(0,0,0,1)] sm:p-8 lg:p-12">
            <Image
              src="https://images.pexels.com/photos/4862951/pexels-photo-4862951.jpeg?cs=srgb&dl=pexels-karolina-grabowska-4862951.jpg&fm=jpg"
              alt="Dark luxury fabric texture"
              fill
              priority
              className="object-cover opacity-38"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(5,5,5,0.92),rgba(5,5,5,0.58)),radial-gradient(circle_at_right,rgba(205,183,158,0.12),transparent_28%)]" />
            <div className="relative grid gap-8 xl:grid-cols-[0.92fr_1.08fr] xl:items-end">
              <div className="max-w-2xl space-y-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[#ccb79d]">
                  VALTORN COLLECTION
                </p>
                <h1 className="text-5xl font-semibold tracking-[-0.08em] text-[#f7f2eb] sm:text-6xl lg:text-[5.1rem]">
                  Minimal Streetwear Essentials.
                </h1>
                <p className="max-w-xl text-base leading-8 text-[#b6afa4] sm:text-lg">
                  Oversized silhouettes, premium fabrics, and modern menswear designed
                  for everyday confidence.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-[#f5efe7] text-black hover:bg-[#d8c7b0]"
                >
                  <Link href="#collection-grid">SHOP NOW</Link>
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#111] md:min-h-[320px]"
                >
                  <Image
                    src="https://images.pexels.com/photos/35625406/pexels-photo-35625406.jpeg?cs=srgb&dl=pexels-joint-x-2158831780-35625406.jpg&fm=jpg"
                    alt="Oversized black t-shirts on rack"
                    fill
                    priority
                    className="object-cover"
                    sizes="(min-width: 1280px) 32vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0.04),rgba(6,6,6,0.8))]" />
                  <div className="absolute inset-x-5 bottom-5">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#ccb79d]">
                      Oversized Focus
                    </p>
                    <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-[#f5efe7]">
                      Product-first imagery with quiet studio light.
                    </p>
                  </div>
                </motion.div>

                <div className="grid gap-4">
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#111] min-h-[152px]"
                  >
                    <Image
                      src="https://images.pexels.com/photos/20094389/pexels-photo-20094389.jpeg?cs=srgb&dl=pexels-thomas-richard-945930195-20094389.jpg&fm=jpg"
                      alt="Premium pants on hanger"
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 20vw, 100vw"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0.08),rgba(6,6,6,0.8))]" />
                    <div className="absolute inset-x-4 bottom-4">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-[#ccb79d]">
                        Premium Pants
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="rounded-[2rem] border border-white/8 bg-white/[0.04] p-5"
                  >
                    <Sparkles className="h-5 w-5 text-[#ccb79d]" />
                    <p className="mt-5 text-[11px] uppercase tracking-[0.28em] text-[#ccb79d]">
                      Curated Selection
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#a7a093]">
                      Focused on oversized t-shirts, cargos, premium pants, and neutral essentials with minimal visual noise.
                    </p>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>
        </AnimatedSection>

        <AnimatedSection id="collection-grid" className="space-y-8">
          <div className="sticky top-20 z-20 rounded-[2rem] border border-white/8 bg-[#0d0d0d]/92 p-4 shadow-[0_30px_110px_-70px_rgba(0,0,0,1)] backdrop-blur-xl">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#ccb79d]">
                    <SlidersHorizontal className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#9f988b]">
                      Collection Filters
                    </p>
                    <p className="mt-1 text-sm text-[#f5efe7]">
                      Refined selection for a quieter luxury shopping flow.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen((value) => !value)}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 px-4 text-xs font-semibold uppercase tracking-[0.22em] text-[#f5efe7] transition hover:bg-white/[0.06] lg:hidden"
                >
                  Filters
                </button>
              </div>

              <div className="overflow-x-auto pb-1">
                <div className="flex min-w-max gap-3">
                  <button
                    type="button"
                    onClick={() => startTransition(() => setActiveFilter("all"))}
                    className={`rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] transition ${
                      activeFilter === "all"
                        ? "bg-[#f5efe7] text-black"
                        : "border border-white/10 bg-white/[0.04] text-[#b0a99d] hover:bg-white/[0.08] hover:text-[#f5efe7]"
                    }`}
                  >
                    All Pieces
                  </button>
                  {filterOptions.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => startTransition(() => setActiveFilter(filter.value))}
                      className={`rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.24em] transition ${
                        activeFilter === filter.value
                          ? "bg-[#f5efe7] text-black"
                          : "border border-white/10 bg-white/[0.04] text-[#b0a99d] hover:bg-white/[0.08] hover:text-[#f5efe7]"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className={`${filtersOpen ? "grid" : "hidden"} gap-4 lg:grid lg:grid-cols-[1.2fr_0.8fr]`}>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#837b70]" />
                  <Input
                    value={query}
                    onChange={(event) => startTransition(() => setQuery(event.target.value))}
                    placeholder="Search oversized tees, cargos, and essentials"
                    className="h-[52px] rounded-[1.5rem] border-white/10 bg-white/[0.04] pl-11 text-[#f5efe7] placeholder:text-[#837b70]"
                  />
                </div>

                <select
                  value={sort}
                  onChange={(event) =>
                    startTransition(() => setSort(event.target.value as SortOption))
                  }
                  className="h-[52px] rounded-[1.5rem] border border-white/10 bg-white/[0.04] px-4 text-sm text-[#f5efe7] outline-none"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#101010]">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#8d7d6b]">
                Showing
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#111111] sm:text-4xl">
                {filteredProducts.length} curated pieces
              </h2>
            </div>
            <p className="max-w-lg text-right text-sm leading-7 text-[#5f5a53]">
              Built around calm studio imagery, clean typography, and enough breathing room for the product to lead.
            </p>
          </div>

          {filteredProducts.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map((entry) => (
                <CollectionProductCard key={entry.product.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-white/14 bg-white/[0.03] px-6 py-16 text-center">
              <p className="text-xl font-semibold tracking-[-0.04em] text-[#f5efe7]">
                No pieces match this combination.
              </p>
              <p className="mt-3 text-sm leading-7 text-[#9f988b]">
                Adjust the filter or search to reveal more of the collection.
              </p>
            </div>
          )}
        </AnimatedSection>

        <AnimatedSection>
          <section className="relative overflow-hidden rounded-[2.8rem] border border-white/8 bg-[#0f0f0f] shadow-[0_45px_140px_-80px_rgba(0,0,0,1)]">
            <Image
              src="https://images.pexels.com/photos/4862951/pexels-photo-4862951.jpeg?cs=srgb&dl=pexels-karolina-grabowska-4862951.jpg&fm=jpg"
              alt="Featured editorial drop texture"
              fill
              className="object-cover opacity-55"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(205,183,158,0.18),transparent_28%),linear-gradient(90deg,rgba(6,6,6,0.94),rgba(6,6,6,0.6))]" />
            <div className="relative flex min-h-[360px] items-end px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
              <div className="max-w-2xl space-y-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[#ccb79d]">
                  Featured Drop
                </p>
                <h2 className="text-4xl font-semibold tracking-[-0.06em] text-[#f7f2eb] sm:text-5xl lg:text-[4rem]">
                  Built Different.
                </h2>
                <p className="max-w-xl text-base leading-8 text-[#d1c9bd]">
                  Designed for men who value confidence, comfort, and timeless minimal style.
                </p>
                <Button
                  asChild
                  className="bg-[#f5efe7] text-black hover:bg-[#d8c7b0]"
                >
                  <Link href="/products?sort=latest">Explore New Arrivals</Link>
                </Button>
              </div>
            </div>
          </section>
        </AnimatedSection>
      </div>

      <MobileCartBar />
    </div>
  );
}
