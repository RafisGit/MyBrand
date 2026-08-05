"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { navigationLinks } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Body scroll locking
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open navigation menu"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-black ring-1 ring-black/10 backdrop-blur transition hover:bg-black hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] sm:w-[380px] border-r-white/10 bg-[#0d0d0d] text-white p-6 sm:p-8">
        <SheetHeader className="pr-8 text-left">
          <SheetTitle className="text-xl font-bold uppercase tracking-[0.3em] text-white">VALTORN</SheetTitle>
          <SheetDescription className="text-xs leading-relaxed text-zinc-400">
            Architectural streetwear and modern essentials designed for comfort, simplicity, and quiet luxury.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 flex flex-1 flex-col justify-between h-[calc(100vh-180px)] overflow-y-auto">
          <nav className="space-y-2">
            {navigationLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-[52px] items-center rounded-2xl px-5 py-3.5 text-sm font-semibold tracking-[0.16em] uppercase transition-all duration-200 active:scale-[0.98] ${
                    isActive
                      ? "bg-white text-black font-bold shadow-lg"
                      : "text-white/85 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-4 pt-6 border-t border-white/10">
            <Button asChild className="w-full min-h-[52px] rounded-full bg-white text-black font-semibold uppercase tracking-[0.16em] text-xs hover:bg-zinc-200 active:scale-[0.98]">
              <Link href="/products" onClick={() => setOpen(false)}>
                Shop Full Collection
              </Link>
            </Button>
            <div className="flex justify-between items-center px-2 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              <span>VALTORN STUDIO</span>
              <span>2026 EDITION</span>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
