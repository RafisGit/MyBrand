"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

import { campaignBanners } from "@/lib/data/content";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/shared/animated-section";

export function CampaignSection() {
  return (
    <AnimatedSection className="space-y-10">
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-500">
            Campaigns
          </p>
          <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em] text-black sm:text-5xl">
            Premium campaigns built from product, light, and architectural space.
          </h2>
          <p className="max-w-2xl text-sm leading-8 text-zinc-600 sm:text-base">
            Each editorial frame is focused on garments alone: floating silhouettes, folded details, and quiet premium compositions.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaignBanners.map((banner, index) => (
            <motion.article
              key={banner.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative overflow-hidden rounded-[2rem] border border-black/10 bg-black/5"
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-[1.03]"
                sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 100vw"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08),rgba(0,0,0,0.7))] transition duration-300 group-hover:bg-[linear-gradient(180deg,rgba(0,0,0,0.14),rgba(0,0,0,0.8))]" />
              <div className="relative p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                  {banner.title}
                </p>
                <p className="mt-4 text-sm leading-7 text-white/90">
                  {banner.subtitle}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-6 border-white/20 text-white hover:bg-white/10">
                  <Link href={banner.cta.href}>{banner.cta.label}</Link>
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}
