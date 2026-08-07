"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { motion } from "framer-motion";
import { navigationLinks } from "@/lib/constants";
import { CartSheet } from "@/components/layout/cart-sheet";
import { GlobalSearch } from "@/components/layout/global-search";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserAuthButton } from "@/components/layout/user-auth-button";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(72);
  const headerRef = useRef<HTMLElement>(null);

  // Measure exact header height dynamically to prevent any CLS
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const updateHeight = () => {
      const h = el.getBoundingClientRect().height;
      if (h > 0) {
        setHeaderHeight(h);
        document.documentElement.style.setProperty("--header-height", `${h}px`);
      }
    };

    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Sync scroll position with Lenis or fallback window scroll listener
  useLenis((lenis) => {
    const scrolled = lenis.scroll > 30;
    setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
  });

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 30;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={false}
        animate={{
          paddingTop: isScrolled ? "10px" : "0px",
          paddingLeft: isScrolled ? "12px" : "0px",
          paddingRight: isScrolled ? "12px" : "0px",
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 w-full z-40"
      >
        <motion.div
          initial={false}
          animate={{
            borderRadius: isScrolled ? "9999px" : "0px",
            backgroundColor: isScrolled ? "rgba(255, 255, 255, 0.94)" : "rgba(255, 255, 255, 0.82)",
            borderColor: isScrolled ? "rgba(0, 0, 0, 0.10)" : "rgba(0, 0, 0, 0.05)",
            boxShadow: isScrolled
              ? "0px 20px 60px -20px rgba(0, 0, 0, 0.20)"
              : "0px 0px 0px 0px rgba(0, 0, 0, 0)",
            paddingTop: isScrolled ? "10px" : "16px",
            paddingBottom: isScrolled ? "10px" : "16px",
          }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 border-b backdrop-blur-xl"
        >
          <div className="flex items-center gap-3">
            <MobileNav />
            <Link
              href="/"
              className="group inline-flex flex-col rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            >
              <motion.span
                animate={{ scale: isScrolled ? 0.96 : 1 }}
                transition={{ duration: 0.25 }}
                className="text-sm sm:text-base font-bold uppercase tracking-[0.36em] text-black origin-left"
              >
                VALTORN
              </motion.span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-zinc-500 transition group-hover:text-black">
                Streetwear
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-6 xl:gap-8 lg:flex">
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
            <GlobalSearch />
            <UserAuthButton />
            <CartSheet />
          </div>
        </motion.div>
      </motion.header>

      {/* Dynamic Spacer for Zero Layout Shift */}
      <div
        style={{ height: `${headerHeight}px` }}
        aria-hidden="true"
        className="w-full shrink-0 pointer-events-none"
      />
    </>
  );
}
