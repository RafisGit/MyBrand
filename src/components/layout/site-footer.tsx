import Link from "next/link";

import { footerGroups, siteConfig } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 bg-[#0d0d0d] text-white">
      <div className="mx-auto grid max-w-[1440px] gap-14 px-4 py-18 sm:px-6 lg:grid-cols-[1.22fr_1fr] lg:px-8 lg:py-24">
        <div className="space-y-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-zinc-500">
              Newsletter
            </p>
            <h2 className="mt-5 max-w-xl text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
              Join a private list for capsule drops, early access, and editorial releases.
            </h2>
          </div>
          <div className="flex max-w-xl flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              placeholder="Enter your email"
              className="h-[52px] rounded-[1.3rem] border-white/10 bg-white/5 text-white placeholder:text-zinc-500"
            />
            <Button type="button" className="h-[52px] w-full bg-white text-black hover:bg-zinc-200 sm:w-auto">
              Subscribe
            </Button>
          </div>
          <p className="text-sm leading-7 text-zinc-500">
            Designed for luxury product storytelling with a responsive, commerce-ready architecture.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-10 lg:pt-2">
          {footerGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white">
                {group.title}
              </h3>
              <div className="space-y-3">
                {group.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block py-1.5 text-sm text-zinc-500 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-6 text-xs uppercase tracking-[0.2em] text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>{siteConfig.name}</p>
          <p>Instagram / Pinterest / Tiktok</p>
        </div>
      </div>
    </footer>
  );
}
