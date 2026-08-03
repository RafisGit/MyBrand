"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { AnimatedSection } from "@/components/shared/animated-section";
import { Button } from "@/components/ui/button";
import {
  buildStorefrontDisplayMeta,
  type CollectionFilter,
  type ProductDisplayMeta,
} from "@/lib/products/storefront-display";

type SortOption = "featured" | "latest" | "price-asc" | "price-desc";

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


import { toSlug } from "@/lib/utils/slug";

function resolveDefaultFilter(category?: string, sort?: string): CollectionFilter {
  if (sort === "popular") {
    return "best-sellers";
  }

  if (sort === "latest") {
    return "new-arrivals";
  }

  if (category) {
    const catLower = category.toLowerCase();
    if (catLower === "oversized") return "oversized-fits";
    return toSlug(category);
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

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      className="group relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#101010] shadow-[0_40px_120px_-80px_rgba(0,0,0,1)] flex flex-col justify-between"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#171717]">
        <Link href={`/products/${entry.product.slug}`} className="block h-full w-full">
          <Image
            src={entry.meta.images[0]}
            alt={entry.product.name}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            sizes="(min-width: 1280px) 24vw, (min-width: 768px) 40vw, 100vw"
          />
          {entry.meta.images[1] ? (
            <Image
              src={entry.meta.images[1]}
              alt={`${entry.product.name} detail`}
              fill
              className="object-cover opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:opacity-100"
              sizes="(min-width: 1280px) 24vw, (min-width: 768px) 40vw, 100vw"
            />
          ) : null}
          {/* Subtle dark gradient overlay on hover for high contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20 opacity-40 transition-opacity duration-300 group-hover:opacity-75" />
        </Link>

        {/* Category / Badge overlay in top-left */}
        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/12 bg-black/50 px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f5efe7] backdrop-blur-md">
          {entry.meta.badge || entry.meta.categoryLabel}
        </div>

        {/* Wishlist Heart Icon Button in top-right */}
        <button
          type="button"
          aria-label={`Toggle wishlist for ${entry.product.name}`}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleItem(entry.product.id);
          }}
          className={`absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 backdrop-blur-md transition-all duration-300 ${
            isWishlisted
              ? "bg-[#f5efe7] text-black shadow-lg"
              : "bg-black/40 text-white hover:bg-[#f5efe7] hover:text-black"
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Centered Glassmorphic Quick Add Button inside Image container */}
        <div className="absolute inset-x-4 bottom-4 z-10 flex justify-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-4 sm:scale-95 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:scale-100">
          <Button
            type="button"
            onClick={handleQuickAdd}
            className="h-11 w-full max-w-[92%] rounded-full border border-white/25 bg-white/90 text-black shadow-lg shadow-black/30 backdrop-blur-md text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Quick Add To Cart
          </Button>
        </div>
      </div>

      {/* Info Section below Image */}
      <div className="space-y-2.5 p-3.5 sm:p-4.5">
        <div>
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ccb79d]">
            {entry.meta.categoryLabel}
          </p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <Link href={`/products/${entry.product.slug}`} className="block min-w-0 flex-1">
              <h3 className="truncate text-base sm:text-lg font-semibold tracking-tight text-[#f5efe7] transition-colors duration-200 group-hover:text-[#ccb79d]">
                {entry.product.name}
              </h3>
            </Link>
            <div className="shrink-0 text-right">
              <p className="text-base sm:text-lg font-bold tracking-tight text-[#f5efe7]">
                {formatCurrency(entry.product.price)}
              </p>
              {entry.product.compareAtPrice ? (
                <p className="text-[11px] text-[#827b70] line-through">
                  {formatCurrency(entry.product.compareAtPrice)}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {entry.product.shortDescription ? (
          <p className="text-xs leading-relaxed text-[#9f988b] line-clamp-2">
            {entry.product.shortDescription}
          </p>
        ) : null}
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
  categories,
  defaultCategory,
  defaultSortParam,
  defaultQueryParam,
  products,
}: {
  categories?: { id: string; name: string; slug: string }[];
  defaultCategory?: string;
  defaultSortParam?: string;
  defaultQueryParam?: string;
  products: Product[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlQuery = searchParams?.get("q") || searchParams?.get("query") || defaultQueryParam || "";
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const [sort, setSort] = useState<SortOption>(resolveDefaultSort(defaultSortParam));
  const [activeFilter, setActiveFilter] = useState<CollectionFilter>(
    resolveDefaultFilter(defaultCategory, defaultSortParam),
  );
  const deferredQuery = useDeferredValue(query);

  const activeFilterOptions = useMemo(() => {
    const list: { label: string; value: CollectionFilter }[] = [];
    if (categories && categories.length > 0) {
      for (const cat of categories) {
        list.push({ label: cat.name, value: cat.slug || cat.name.toLowerCase() });
      }
    } else {
      list.push(...filterOptions);
    }
    if (!list.some((item) => item.value === "new-arrivals")) {
      list.push({ label: "New Arrivals", value: "new-arrivals" });
    }
    if (!list.some((item) => item.value === "best-sellers")) {
      list.push({ label: "Best Sellers", value: "best-sellers" });
    }
    return list;
  }, [categories]);

  const curatedProducts = useMemo(() => {
    return products.map((product, index) => ({
      meta: buildStorefrontDisplayMeta(product, index + 1),
      product,
    }));
  }, [products]);


  const filteredProducts = useMemo(() => {
    const normalizedQuery = deferredQuery.toLowerCase().trim();
    const activeSlug = toSlug(activeFilter);

    const visibleProducts = curatedProducts.filter((entry) => {
      const matchesFilter =
        activeFilter === "all" ||
        entry.meta.filters.includes(activeFilter) ||
        entry.meta.filters.includes(activeSlug);


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

      const featuredDifference =
        Number(right.product.featured) - Number(left.product.featured);
      if (featuredDifference !== 0) {
        return featuredDifference;
      }

      const bestSellerDifference =
        Number(right.product.bestSeller) - Number(left.product.bestSeller);
      if (bestSellerDifference !== 0) {
        return bestSellerDifference;
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

        <AnimatedSection id="collection-grid" className="space-y-8">
          <div className="sticky top-20 z-20 rounded-[1.6rem] border border-white/8 bg-[#0d0d0d]/92 p-2.5 sm:p-3.5 shadow-[0_30px_110px_-70px_rgba(0,0,0,1)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="-mx-2.5 overflow-x-auto px-2.5 sm:mx-0 sm:px-0">
                <div className="flex min-w-max items-center gap-2 sm:gap-2.5">
                  <button
                    type="button"
                    onClick={() => startTransition(() => setActiveFilter("all"))}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                      activeFilter === "all"
                        ? "bg-[#f5efe7] text-black"
                        : "border border-white/10 bg-white/[0.04] text-[#b0a99d] hover:bg-white/[0.08] hover:text-[#f5efe7]"
                    }`}
                  >
                    All Pieces
                  </button>
                  {activeFilterOptions.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      onClick={() => startTransition(() => setActiveFilter(filter.value))}
                      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
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

              <div className="flex items-center justify-end gap-2.5 shrink-0">
                <select
                  value={sort}
                  onChange={(event) =>
                    startTransition(() => setSort(event.target.value as SortOption))
                  }
                  className="h-9 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold uppercase tracking-[0.16em] text-[#f5efe7] outline-none transition hover:bg-white/[0.08] cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#101010] text-[#f5efe7]">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {query ? (
            <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-[#0d0d0d] px-4 py-3 text-xs text-[#f5efe7]">
              <span>
                Showing results for &quot;<strong className="text-[#ccb79d]">{query}</strong>&quot;
              </span>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  router.push("/products");
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1 text-[11px] font-medium text-[#b0a99d] transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-3 w-3" /> Clear search
              </button>
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#8d7d6b]">
                Showing
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#111111] sm:text-3xl md:text-4xl">
                {filteredProducts.length} curated pieces
              </h2>
            </div>
            <p className="hidden max-w-lg text-right text-sm leading-7 text-[#5f5a53] sm:block">
              Built around calm studio imagery, clean typography, and enough breathing room for the product to lead.
            </p>
          </div>

          {filteredProducts.length ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
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
                <h2 className="text-3xl font-semibold tracking-[-0.06em] text-[#f7f2eb] sm:text-4xl md:text-5xl lg:text-[4rem]">
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
