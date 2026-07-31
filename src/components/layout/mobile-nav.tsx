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
      <SheetContent className="border-l-white/20 bg-[#0d0d0d] text-white">
        <SheetHeader className="pr-10">
          <SheetTitle className="text-white">VALTORN</SheetTitle>
          <SheetDescription className="text-zinc-400">
            Luxury streetwear, cinematic product imagery, and a cleaner path into the collection.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-8 flex flex-1 flex-col justify-between">
          <nav className="space-y-2">
            {navigationLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-[48px] items-center rounded-2xl px-4 py-3 text-base font-medium tracking-[0.14em] uppercase transition ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/85 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-4">
            <Button asChild className="w-full min-h-[48px] bg-white text-black hover:bg-zinc-200">
              <Link href="/products" onClick={() => setOpen(false)}>
                Shop Collection
              </Link>
            </Button>
            <p className="px-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
              Sign in from the user icon in the header.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
