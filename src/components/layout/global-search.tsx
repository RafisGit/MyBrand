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
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search API call
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?query=${encodeURIComponent(trimmed)}&pageSize=5`);
        if (res.ok) {
          const json = await res.json();
          setResults(json.data || []);
        }
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle outside click & Esc key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    inputRef.current?.blur();
    router.push(`/products?q=${encodeURIComponent(query.trim())}`);
  };

  const handleSelectProduct = () => {
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-[260px] sm:max-w-[320px]">
      <form onSubmit={handleSubmit} className="relative flex items-center">
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
          className="h-9 w-full rounded-full border border-black/10 bg-zinc-100/80 pl-9 pr-8 text-xs text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-black/30 focus:bg-white focus:ring-1 focus:ring-black/20"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 inline-flex h-4 w-4 items-center justify-center rounded-full text-zinc-400 hover:text-black"
          >
            <X className="h-3 w-3" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-3 hidden rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[9px] font-medium text-zinc-400 sm:inline-block">
            ⌘K
          </kbd>
        )}
      </form>

      {/* Instant Search Results Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0e0e0e]/95 p-2 shadow-2xl backdrop-blur-xl z-50">
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
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  onClick={handleSelectProduct}
                  className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/10"
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
                    <p className="text-[10px] text-zinc-400 capitalize">{product.category}</p>
                  </div>
                  <p className="text-xs font-semibold text-[#f5efe7]">
                    {formatCurrency(product.price)}
                  </p>
                </Link>
              ))}

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
