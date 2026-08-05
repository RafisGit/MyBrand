"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

import type { Product } from "@/types";
import type { HomepageSection } from "@/types/cms";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { AnimatedSection } from "@/components/shared/animated-section";
import { Button } from "@/components/ui/button";
import { LuxuryNewsletterSection } from "@/components/newsletter/luxury-newsletter-section";

const defaultHeroAssets = {
  primary:
    "https://images.pexels.com/photos/35625406/pexels-photo-35625406.jpeg?cs=srgb&dl=pexels-joint-x-2158831780-35625406.jpg&fm=jpg",
  fabric:
    "https://images.pexels.com/photos/7717491/pexels-photo-7717491.jpeg?cs=srgb&dl=pexels-marina-zasorina-7717491.jpg&fm=jpg",
  trousers:
    "https://images.pexels.com/photos/20094389/pexels-photo-20094389.jpeg?cs=srgb&dl=pexels-thomas-richard-945930195-20094389.jpg&fm=jpg",
  editorial:
    "https://images.pexels.com/photos/35586905/pexels-photo-35586905.jpeg?cs=srgb&dl=pexels-jc-qi-2157200577-35586905.jpg&fm=jpg",
};



function LaunchProductCard({
  product,
  image,
  detail,
}: {
  product: Product;
  image: string;
  detail: string;
}) {
  const addItem = useCartStore((state) => state.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock < 1) {
      toast.info("This piece is currently unavailable.");
      return;
    }

    addItem({
      product,
      quantity: 1,
      size: product.sizes[0] ?? "M",
      color: product.colors[0] ?? "Black",
    });

    toast.success(`${product.name} added to bag.`);
  };

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_38px_120px_-80px_rgba(0,0,0,0.28)] flex flex-col justify-between"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#111]">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={image || product.images[0] || defaultHeroAssets.primary}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
            sizes="(min-width: 1280px) 24vw, (min-width: 768px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20 opacity-30 transition-opacity duration-300 group-hover:opacity-75" />
        </Link>

        {/* Badge in top-left */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 sm:left-4 sm:top-4 rounded-full border border-white/12 bg-black/55 px-2.5 py-0.5 sm:px-3.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f4efe8] backdrop-blur-md">
          {detail}
        </div>

        {/* Glassmorphic Quick Add Button centered inside image container */}
        <div className="absolute inset-x-2 bottom-2 sm:inset-x-4 sm:bottom-4 z-10 flex justify-center transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-4 sm:scale-95 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 sm:group-hover:scale-100">
          <Button
            type="button"
            onClick={handleQuickAdd}
            className="h-10 sm:h-11 w-full rounded-full border border-white/25 bg-white/90 text-black shadow-lg backdrop-blur-md text-[10px] sm:text-xs font-semibold uppercase tracking-[0.14em] sm:tracking-[0.2em] transition-all duration-300 hover:bg-white hover:shadow-xl active:scale-[0.96]"
          >
            <ShoppingBag className="mr-1.5 h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Quick Add</span>
          </Button>
        </div>
      </div>

      {/* Info Section below Image */}
      <div className="space-y-1.5 sm:space-y-2.5 p-3 sm:p-4.5">
        <div>
          <p className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.24em] text-[#9b8b77]">
            {product.collection || "Valtorn Essential"}
          </p>
          <div className="mt-0.5 sm:mt-1 flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-3">
            <Link href={`/products/${product.slug}`} className="block min-w-0 flex-1">
              <h3 className="truncate text-xs sm:text-lg font-semibold tracking-tight text-[#111111] hover:text-[#7b6b58] transition">
                {product.name}
              </h3>
            </Link>
            <div className="shrink-0 text-left sm:text-right">
              <p className="text-xs sm:text-lg font-bold tracking-tight text-[#111111]">
                {formatCurrency(product.price)}
              </p>
              {product.compareAtPrice ? (
                <p className="text-[10px] sm:text-[11px] text-zinc-400 line-through">
                  {formatCurrency(product.compareAtPrice)}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {product.shortDescription ? (
          <p className="hidden sm:block text-xs leading-relaxed text-[#5f5a53] line-clamp-2">{product.shortDescription}</p>
        ) : null}
      </div>
    </motion.article>
  );
}

export function ValtornHome({
  products,
  sections,
}: {
  products: Product[];
  sections?: Record<string, HomepageSection>;
}) {
  const heroSection = sections?.hero;
  const heroTitle = heroSection?.title || "Built For Everyday Confidence.";
  const heroSubtitle = heroSection?.subtitle || "VALTORN STREETWEAR";
  const heroDesc = heroSection?.description || "Premium oversized t-shirts and modern essentials designed for comfort, simplicity, and timeless streetwear style.";
  const heroBtnText = heroSection?.buttonText || "EXPLORE COLLECTION";
  const heroBtnLink = heroSection?.buttonLink || "/products";
  const heroImages = {
    primary: heroSection?.images?.primary || defaultHeroAssets.primary,
    fabric: heroSection?.images?.fabric || defaultHeroAssets.fabric,
    trousers: heroSection?.images?.trousers || defaultHeroAssets.trousers,
    editorial: heroSection?.images?.editorial || defaultHeroAssets.editorial,
  };

  const showcasedProducts = products
    .slice(0, 4)
    .map((product) => ({
      product,
      image: product.images[0] || defaultHeroAssets.primary,
      detail: product.featured ? "Featured Piece" : "Catalog Essential",
    }));

  return (
    <div
      className="bg-white text-[#111111]"
      style={{
        fontFamily:
          '"Inter","Neue Montreal","General Sans","Satoshi","Helvetica Neue",system-ui,sans-serif',
      }}
    >
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-8 px-3 py-4 sm:px-6 sm:py-8 lg:gap-10 lg:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.6rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(205,183,158,0.14),transparent_34%),linear-gradient(180deg,#121212_0%,#060606_100%)] p-4.5 sm:p-8 lg:p-10 xl:p-14 shadow-[0_45px_140px_-70px_rgba(0,0,0,1)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.06),transparent_24%)]" />
          <div className="relative grid gap-8 lg:gap-10 xl:grid-cols-[0.88fr_1.12fr] xl:items-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
            >
              <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.32em] text-[#b8afa2]">
                {heroSubtitle}
              </p>
              <h1 className="mt-3 sm:mt-5 max-w-xl text-3xl xs:text-4xl sm:text-6xl lg:text-[5.2rem] font-semibold tracking-[-0.06em] leading-[1.1] text-[#f7f2eb]">
                {heroTitle}
              </h1>
              <p className="mt-4 sm:mt-6 max-w-xl text-xs sm:text-base lg:text-lg leading-relaxed text-[#b7b1a7]">
                {heroDesc}
              </p>

              <div className="mt-6 sm:mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="w-full sm:w-auto min-h-[48px] rounded-full bg-[#f4efe8] text-black font-semibold text-xs tracking-[0.16em] uppercase hover:bg-[#d7c8b3] active:scale-[0.98]"
                >
                  <Link href="/products?category=Oversized">SHOP T-SHIRTS</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto min-h-[48px] rounded-full border-white/15 bg-white/[0.03] text-[#f4efe8] font-semibold text-xs tracking-[0.16em] uppercase hover:bg-white/[0.08] hover:text-[#f4efe8] active:scale-[0.98]"
                >
                  <Link href={heroBtnLink}>{heroBtnText}</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-3 sm:gap-4 lg:grid-cols-[1.05fr_0.7fr] lg:grid-rows-[minmax(220px,1fr)_minmax(180px,0.78fr)]"
            >
              {/* Primary Feature Image */}
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-[1.6rem] sm:rounded-[2rem] border border-white/8 bg-[#111] lg:row-span-2 min-h-[260px] sm:min-h-[300px]"
              >
                <Image
                  src={heroImages.primary}
                  alt="Primary Hero Feature"
                  fill
                  priority
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  sizes="(min-width: 1280px) 38vw, (min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0),rgba(6,6,6,0.85))]" />
                <div className="absolute inset-x-4 sm:inset-x-5 bottom-4 sm:bottom-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.24em] text-[#cdb79e]">
                      Launch Focus
                    </p>
                    <p className="mt-1 text-base sm:text-xl font-semibold tracking-[-0.03em] text-[#f4efe8]">
                      Oversized black tees under quiet studio light.
                    </p>
                  </div>
                  <div className="shrink-0 rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-[#f4efe8]">
                    320gsm Cotton
                  </div>
                </div>
              </motion.div>

              {/* Mobile 2-col Secondary Grid / Desktop Stacked Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1 lg:contents">
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-[1.4rem] sm:rounded-[2rem] border border-white/8 bg-[#111] min-h-[150px] sm:min-h-[160px]"
                >
                  <Image
                    src={heroImages.fabric}
                    alt="Fabric Detail"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 20vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0.08),rgba(6,6,6,0.85))]" />
                  <div className="absolute inset-x-3.5 bottom-3.5 sm:inset-x-4 sm:bottom-4">
                    <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.24em] text-[#cdb79e]">
                      Fabric Detail
                    </p>
                    <p className="mt-1 text-xs sm:text-sm leading-snug sm:leading-6 text-[#f4efe8]">
                      Matte surface & luxury hand feel.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-[1.4rem] sm:rounded-[2rem] border border-white/8 bg-[#111] min-h-[150px] sm:min-h-[160px]"
                >
                  <Image
                    src={heroImages.trousers}
                    alt="Essential Apparel"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 20vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0.02),rgba(6,6,6,0.85))]" />
                  <div className="absolute inset-x-3.5 bottom-3.5 sm:inset-x-4 sm:bottom-4">
                    <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.24em] text-[#cdb79e]">
                      Essential Fits
                    </p>
                    <p className="mt-1 text-xs sm:text-sm leading-snug sm:leading-6 text-[#f4efe8]">
                      Relaxed structural silhouette.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Dynamic Launch Products Section */}
        {showcasedProducts.length > 0 && (
          <AnimatedSection className="space-y-4 sm:space-y-6">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.34em] text-[#9b8b77]">
                  {sections?.featured_collection?.subtitle || "LAUNCH SELECTION"}
                </p>
                <h2 className="mt-1.5 text-2xl font-semibold tracking-[-0.05em] text-[#111111] sm:text-4xl">
                  {sections?.featured_collection?.title || "Essential Streetwear Pieces."}
                </h2>
              </div>
              <Button
                asChild
                variant="outline"
                className="self-start min-h-[44px] rounded-full border-black/10 text-black hover:bg-black hover:text-white sm:self-auto text-xs"
              >
                <Link href="/products">
                  {sections?.featured_collection?.buttonText || "View All Products"}
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
              {showcasedProducts.map(({ product, image, detail }) => (
                <LaunchProductCard
                  key={product.id}
                  product={product}
                  image={image}
                  detail={detail}
                />
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* Private Members Luxury Newsletter Subscription System */}
        <div className="mt-8 rounded-[2.6rem] overflow-hidden">
          <LuxuryNewsletterSection source="homepage" />
        </div>
      </div>
    </div>
  );
}
