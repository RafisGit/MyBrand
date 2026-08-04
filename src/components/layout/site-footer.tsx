"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { footerGroups, siteConfig } from "@/lib/constants";
import { LuxuryNewsletterFooter } from "@/components/newsletter/luxury-newsletter-footer";

interface SiteFooterProps {
  hideNewsletter?: boolean;
}

export function SiteFooter({ hideNewsletter }: SiteFooterProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const shouldHideNewsletter = hideNewsletter ?? isHomePage;

  return (
    <footer className="border-t border-black/10 bg-[#0d0d0d] text-white">
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {shouldHideNewsletter ? (
          /* HOME PAGE CLEAN LUXURY FOOTER (Newsletter Hidden) */
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-14">
            {/* Brand Intro Column */}
            <div className="space-y-4 sm:col-span-2 lg:col-span-1">
              <span className="text-xl font-semibold uppercase tracking-[0.28em] text-white font-serif block">
                {siteConfig.name}
              </span>
              <p className="text-xs leading-relaxed text-zinc-400 max-w-sm">
                Architectural menswear and modern essentials designed for comfort, simplicity, and timeless quiet luxury.
              </p>
            </div>

            {/* Navigation Link Groups */}
            {footerGroups.map((group) => (
              <div key={group.title} className="space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-white">
                  {group.title}
                </h3>
                <div className="space-y-2.5">
                  {group.links.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="block text-xs text-zinc-400 transition hover:text-white"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* OTHER PAGES FOOTER (Includes Newsletter Box) */
          <div className="grid gap-14 lg:grid-cols-[1.22fr_1fr]">
            <div className="space-y-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-zinc-500">
                  Newsletter
                </p>
                <h2 className="mt-5 max-w-xl text-2xl sm:text-3xl font-semibold tracking-[-0.04em] text-white sm:text-4xl">
                  Join a private list for capsule drops, early access, and editorial releases.
                </h2>
              </div>
              <LuxuryNewsletterFooter />
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
        )}
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-6 text-xs uppercase tracking-[0.2em] text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>{siteConfig.name}</p>
          <p>Instagram / Pinterest / Tiktok</p>
        </div>
      </div>
    </footer>
  );
}
