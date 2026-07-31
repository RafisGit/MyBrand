"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { navigationLinks } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { CartSheet } from "@/components/layout/cart-sheet";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserAuthButton } from "@/components/layout/user-auth-button";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 18);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        isScrolled ? "px-3 pt-3" : "px-0 pt-0",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[1400px] items-center justify-between transition-all duration-300",
          isScrolled
            ? "rounded-full border border-black/10 bg-white/88 px-5 py-3 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.35)] backdrop-blur-xl lg:px-7"
            : "border-transparent bg-transparent px-4 py-4 lg:px-8 lg:py-6",
        )}
      >
        <div className="flex items-center gap-3">
          <MobileNav />
          <Link href="/" className="group inline-flex flex-col rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black">
            <span className="text-sm font-semibold uppercase tracking-[0.38em] text-black">
              VALTORN
            </span>
            <span className="text-[11px] uppercase tracking-[0.26em] text-zinc-500 transition group-hover:text-black">
              Streetwear
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          {navigationLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm text-xs font-semibold uppercase tracking-[0.24em] text-zinc-600 transition hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <UserAuthButton />
          <CartSheet />
        </div>
      </div>
    </header>
  );
}
