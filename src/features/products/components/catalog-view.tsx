"use client";

import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { colorScale, sizeScale } from "@/lib/constants";
import { ProductCard } from "@/features/products/components/product-card";
import { Input } from "@/components/ui/input";
import type { Product } from "@/types";

const sortLabels = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "price-asc", label: "Price low-high" },
  { value: "price-desc", label: "Price high-low" },
] as const;

export function CatalogView({
  products,
  defaultCategory = "",
}: {
  products: Product[];
  defaultCategory?: string;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(defaultCategory);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [sort, setSort] =
    useState<(typeof sortLabels)[number]["value"]>("latest");
  const [maxPrice, setMaxPrice] = useState(600);
  const deferredSearch = useDeferredValue(search);

  const categories = useMemo(
    () => [...new Set(products.map((product) => product.category))],
    [products],
  );

  const filteredProducts = useMemo(() => {
    const normalizedSearch = deferredSearch.toLowerCase().trim();

    return [...products]
      .filter((product) => {
        const matchesSearch =
          !normalizedSearch ||
          `${product.name} ${product.collection} ${product.shortDescription}`
            .toLowerCase()
            .includes(normalizedSearch);
        const matchesCategory = !category || product.category === category;
        const matchesSize = !size || product.sizes.includes(size);
        const matchesColor = !color || product.colors.includes(color);
        const matchesPrice = product.price <= maxPrice;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesSize &&
          matchesColor &&
          matchesPrice
        );
      })
      .sort((left, right) => {
        switch (sort) {
          case "popular":
            return right.rating - left.rating;
          case "price-asc":
            return left.price - right.price;
          case "price-desc":
            return right.price - left.price;
          case "latest":
          default:
            return (
              new Date(right.createdAt).getTime() -
              new Date(left.createdAt).getTime()
            );
        }
      });
  }, [category, color, deferredSearch, maxPrice, products, size, sort]);

  return (
    <div className="space-y-8">
      <div className="grid gap-6 rounded-[2rem] border border-black/10 bg-white p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-3 rounded-full bg-black/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
            <SlidersHorizontal className="h-4 w-4" />
            Premium filters
          </div>

          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={search}
              onChange={(event) => {
                const nextValue = event.target.value;
                startTransition(() => setSearch(nextValue));
              }}
              placeholder="Search the collection"
              className="pl-11"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <select
            value={category}
            onChange={(event) =>
              startTransition(() => setCategory(event.target.value))
            }
            className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none"
          >
            <option value="">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={size}
            onChange={(event) =>
              startTransition(() => setSize(event.target.value))
            }
            className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none"
          >
            <option value="">All sizes</option>
            {sizeScale.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={color}
            onChange={(event) =>
              startTransition(() => setColor(event.target.value))
            }
            className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none"
          >
            <option value="">All colors</option>
            {colorScale.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) =>
              startTransition(
                () => setSort(event.target.value as (typeof sortLabels)[number]["value"]),
              )
            }
            className="h-12 rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none"
          >
            {sortLabels.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
            <span>Price ceiling</span>
            <span>${maxPrice}</span>
          </div>
          <input
            type="range"
            min={75}
            max={600}
            step={5}
            value={maxPrice}
            onChange={(event) =>
              startTransition(() => setMaxPrice(Number(event.target.value)))
            }
            className="w-full accent-black"
          />
        </div>
      </div>

      {filteredProducts.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-black/15 bg-white px-6 py-16 text-center">
          <p className="text-lg font-semibold tracking-tight text-black">
            No products match this filter combination.
          </p>
          <p className="mt-2 text-sm leading-7 text-zinc-600">
            Adjust the category, size, color, or price range to reveal more of the collection.
          </p>
        </div>
      )}
    </div>
  );
}
