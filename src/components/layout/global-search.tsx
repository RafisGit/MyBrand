"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search API call
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?query=${encodeURIComponent(trimmed)}&pageSize=5`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.data || []);
          setSelectedIndex(-1);
        }
      } catch {
        setResults([]);
        setSelectedIndex(-1);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle outside click, Esc key, Shortcut & Arrow Navigation
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
        return;
      }

      if (!isOpen) return;

      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
        setSelectedIndex(-1);
      } else if (e.key === "ArrowDown") {
        if (results.length > 0) {
          e.preventDefault();
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        }
      } else if (e.key === "ArrowUp") {
        if (results.length > 0) {
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, results]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      const selectedProduct = results[selectedIndex];
      setIsOpen(false);
      setQuery("");
      setSelectedIndex(-1);
      inputRef.current?.blur();
      router.push(`/products/${selectedProduct.slug}`);
      return;
    }

    if (!query.trim()) return;
    setIsOpen(false);
    inputRef.current?.blur();
    setSelectedIndex(-1);
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectProduct = () => {
    setIsOpen(false);
    setQuery("");
    setSelectedIndex(-1);
  };

  return (
    <div ref={searchRef} className="relative">
      {/* Mobile Search Icon Trigger */}
      <button
        type="button"
        aria-label="Open mobile search"
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-black ring-1 ring-black/10 backdrop-blur transition hover:bg-black hover:text-white sm:hidden"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Desktop Search Input Form */}
      <form onSubmit={handleSubmit} className="hidden sm:flex relative items-center w-[220px] md:w-[280px] lg:w-[320px]">
        <Search className="pointer-events-none absolute left-3.5 h-3.5 w-3.5 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search collection..."
          className="h-10 w-full rounded-full border border-black/10 bg-zinc-100/80 pl-9 pr-8 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-black/30 focus:bg-white focus:ring-1 focus:ring-black/20"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setSelectedIndex(-1);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-zinc-400 hover:text-black"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-3 hidden rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-zinc-400 sm:inline-block">
            ⌘K
          </kbd>
        )}
      </form>

      {/* Mobile Full-Width Floating Search Box */}
      {isOpen && (
        <div className="sm:hidden fixed inset-x-3 top-16 z-50 overflow-hidden rounded-3xl border border-white/15 bg-[#0e0e0e]/95 p-3 shadow-2xl backdrop-blur-2xl">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-zinc-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pieces, categories..."
              className="h-12 w-full rounded-full border border-white/10 bg-white/10 pl-11 pr-10 text-sm text-white placeholder:text-zinc-400 outline-none focus:border-white/30"
            />
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setQuery("");
              }}
              className="absolute right-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </form>

          {query.trim().length > 0 && (
            <div className="mt-3 max-h-[60vh] overflow-y-auto space-y-1">
              {isLoading ? (
                <div className="flex items-center justify-center p-6 text-xs text-zinc-400">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching pieces...
                </div>
              ) : results.length > 0 ? (
                <>
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ccb79d]">
                    Products ({results.length})
                  </p>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={handleSelectProduct}
                      className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-white/10 active:bg-white/15"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-white">{product.name}</p>
                        <p className="text-[10px] text-zinc-400 capitalize">
                          {typeof product.category === "object" && product.category !== null
                            ? (product.category as { name?: string }).name
                            : String(product.category || "")}
                        </p>
                      </div>
                      <p className="text-xs font-semibold text-[#f5efe7]">
                        {formatCurrency(product.price)}
                      </p>
                    </Link>
                  ))}

                  <Link
                    href={`/products?q=${encodeURIComponent(query.trim())}`}
                    onClick={() => setIsOpen(false)}
                    className="mt-2 flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 text-xs font-medium text-[#f5efe7]"
                  >
                    <span>View all results for &quot;{query}&quot;</span>
                    <ArrowRight className="h-4 w-4 text-[#ccb79d]" />
                  </Link>
                </>
              ) : (
                <div className="p-6 text-center text-xs text-zinc-400">
                  No pieces match &quot;{query}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Desktop Instant Search Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="hidden sm:block absolute left-0 right-0 top-full mt-2 min-w-[300px] overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e0e]/95 p-2 shadow-2xl backdrop-blur-xl z-50">
          {isLoading ? (
            <div className="flex items-center justify-center p-6 text-xs text-zinc-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching pieces...
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#ccb79d]">
                Products ({results.length})
              </p>
              {results.map((product, idx) => {
                const isSelected = selectedIndex === idx;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    onClick={handleSelectProduct}
                    className={`flex items-center gap-3 rounded-xl p-2 transition ${
                      isSelected ? "bg-white/15 border-l-2 border-[#ccb79d]" : "hover:bg-white/10"
                    }`}
                  >
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium text-white">{product.name}</p>
                      <p className="text-[10px] text-zinc-400 capitalize">
                        {typeof product.category === "object" && product.category !== null
                          ? (product.category as { name?: string }).name
                          : String(product.category || "")}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-[#f5efe7]">
                      {formatCurrency(product.price)}
                    </p>
                  </Link>
                );
              })}

              <Link
                href={`/products?q=${encodeURIComponent(query.trim())}`}
                onClick={() => setIsOpen(false)}
                className="mt-2 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2.5 text-xs font-medium text-[#f5efe7] transition hover:bg-white/10"
              >
                <span>View all results for &quot;{query}&quot;</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#ccb79d]" />
              </Link>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-400">
              No pieces match &quot;{query}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
