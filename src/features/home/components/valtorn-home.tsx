"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  ShieldCheck,
  Shirt,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { AnimatedSection } from "@/components/shared/animated-section";
import { Button } from "@/components/ui/button";

const heroAssets = {
  primary:
    "https://images.pexels.com/photos/35625406/pexels-photo-35625406.jpeg?cs=srgb&dl=pexels-joint-x-2158831780-35625406.jpg&fm=jpg",
  fabric:
    "https://images.pexels.com/photos/7717491/pexels-photo-7717491.jpeg?cs=srgb&dl=pexels-marina-zasorina-7717491.jpg&fm=jpg",
  trousers:
    "https://images.pexels.com/photos/20094389/pexels-photo-20094389.jpeg?cs=srgb&dl=pexels-thomas-richard-945930195-20094389.jpg&fm=jpg",
  editorial:
    "https://images.pexels.com/photos/35586905/pexels-photo-35586905.jpeg?cs=srgb&dl=pexels-jc-qi-2157200577-35586905.jpg&fm=jpg",
};

const featureBlocks = [
  {
    title: "Premium Fabric",
    description: "Heavyweight cotton, structured drape, and soft-touch finishing that still feels effortless.",
    icon: Shirt,
  },
  {
    title: "Minimal Streetwear",
    description: "Clean silhouettes, quiet tones, and modern proportions built for repeat wear.",
    icon: Sparkles,
  },
  {
    title: "Built For Daily Wear",
    description: "Easy layering, durable construction, and confident comfort from morning to late night.",
    icon: ShieldCheck,
  },
] as const;

const featuredCollections = [
  {
    title: "Oversized T-Shirts",
    description: "Studio-shot black tees with heavyweight structure, soft drape, and clean finishes.",
    href: "/products?category=Oversized",
    image:
      "https://images.pexels.com/photos/35625406/pexels-photo-35625406.jpeg?cs=srgb&dl=pexels-joint-x-2158831780-35625406.jpg&fm=jpg",
    eyebrow: "Launch Priority",
  },
  {
    title: "Essential Pants",
    description: "Relaxed tailored bottoms and utility-led shapes with an elevated neutral palette.",
    href: "/products",
    image:
      "https://images.pexels.com/photos/20094389/pexels-photo-20094389.jpeg?cs=srgb&dl=pexels-thomas-richard-945930195-20094389.jpg&fm=jpg",
    eyebrow: "Structured Ease",
  },
  {
    title: "Everyday Fits",
    description: "Layered wardrobes, folded denim, and clean combinations designed to stay in rotation.",
    href: "/products",
    image:
      "https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg?cs=srgb&dl=pexels-karola-g-4210866.jpg&fm=jpg",
    eyebrow: "Daily Rotation",
  },
] as const;

const bestSellerFrames = [
  {
    image:
      "https://images.pexels.com/photos/35625406/pexels-photo-35625406.jpeg?cs=srgb&dl=pexels-joint-x-2158831780-35625406.jpg&fm=jpg",
    detail: "Oversized silhouette",
  },
  {
    image:
      "https://images.pexels.com/photos/20094389/pexels-photo-20094389.jpeg?cs=srgb&dl=pexels-thomas-richard-945930195-20094389.jpg&fm=jpg",
    detail: "Utility structure",
  },
  {
    image:
      "https://images.pexels.com/photos/5706275/pexels-photo-5706275.jpeg?cs=srgb&dl=pexels-karola-g-5706275.jpg&fm=jpg",
    detail: "Neutral layering",
  },
  {
    image:
      "https://images.pexels.com/photos/7717491/pexels-photo-7717491.jpeg?cs=srgb&dl=pexels-marina-zasorina-7717491.jpg&fm=jpg",
    detail: "Fabric close-up",
  },
] as const;

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

  const handleQuickAdd = () => {
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
      className="group overflow-hidden rounded-[2rem] border border-black/8 bg-white shadow-[0_38px_120px_-80px_rgba(0,0,0,0.28)]"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#111]">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
            sizes="(min-width: 1280px) 24vw, (min-width: 768px) 50vw, 100vw"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,7,0.02),rgba(7,7,7,0.72))]" />
          <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/55 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f4efe8]">
            {detail}
          </div>
        </div>
      </Link>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#9b8b77]">
              {product.collection}
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#111111]">
              {product.name}
            </h3>
          </div>
          <p className="text-sm font-semibold text-[#111111]">
            {formatCurrency(product.price)}
          </p>
        </div>

        <p className="text-sm leading-7 text-[#5f5a53]">{product.shortDescription}</p>

        <div className="flex items-center justify-between gap-3 border-t border-black/8 pt-4">
          <Link
            href={`/products/${product.slug}`}
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7b6b58] transition hover:text-black"
          >
            View Piece
            <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Button
            type="button"
            size="sm"
            onClick={handleQuickAdd}
            className="bg-black text-white hover:bg-[#2b2b2b]"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Quick Add
          </Button>
        </div>
      </div>
    </motion.article>
  );
}

export function ValtornHome({ products }: { products: Product[] }) {
  const showcasedProducts = products
    .slice(0, 4)
    .map((product, index) => ({
      product,
      image: bestSellerFrames[index % bestSellerFrames.length].image,
      detail: bestSellerFrames[index % bestSellerFrames.length].detail,
    }));

  return (
    <div
      className="bg-white text-[#111111]"
      style={{
        fontFamily:
          '"Inter","Neue Montreal","General Sans","Satoshi","Helvetica Neue",system-ui,sans-serif',
      }}
    >
      <div className="mx-auto flex w-full max-w-[1480px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:gap-10 lg:px-8 lg:py-10">
        <section className="relative overflow-hidden rounded-[2.6rem] border border-white/8 bg-[radial-gradient(circle_at_top_left,rgba(205,183,158,0.14),transparent_34%),linear-gradient(180deg,#121212_0%,#060606_100%)] p-6 shadow-[0_45px_140px_-70px_rgba(0,0,0,1)] sm:p-8 lg:p-10 xl:p-14">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.06),transparent_24%)]" />
          <div className="relative grid gap-10 xl:grid-cols-[0.88fr_1.12fr] xl:items-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[#b8afa2]">
                VALTORN STREETWEAR
              </p>
              <h1 className="mt-5 max-w-xl text-5xl font-semibold tracking-[-0.08em] text-[#f7f2eb] sm:text-6xl lg:text-[5.2rem]">
                Built For Everyday Confidence.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[#b7b1a7] sm:text-lg">
                Premium oversized t-shirts and modern essentials designed for comfort,
                simplicity, and timeless streetwear style.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-[#f4efe8] text-black hover:bg-[#d7c8b3]"
                >
                  <Link href="/products?category=Oversized">SHOP T-SHIRTS</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/12 bg-white/[0.02] text-[#f4efe8] hover:bg-white/[0.05] hover:text-[#f4efe8]"
                >
                  <Link href="/products">EXPLORE COLLECTION</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-4 lg:grid-cols-[1.05fr_0.7fr] lg:grid-rows-[minmax(220px,1fr)_minmax(180px,0.78fr)]"
            >
              <motion.div
                whileHover={{ y: -4, scale: 1.01 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#111] lg:row-span-2"
              >
                <Image
                  src={heroAssets.primary}
                  alt="Black oversized t-shirts hanging on a rack"
                  fill
                  priority
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                  sizes="(min-width: 1280px) 38vw, 100vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0),rgba(6,6,6,0.78))]" />
                <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.26em] text-[#cdb79e]">
                      Launch Focus
                    </p>
                    <p className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#f4efe8]">
                      Oversized black tees under quiet studio light.
                    </p>
                  </div>
                  <div className="rounded-full border border-white/10 bg-black/45 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-[#f4efe8]">
                    320gsm Cotton
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#111]"
              >
                <Image
                  src={heroAssets.fabric}
                  alt="Black fabric close-up"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1280px) 20vw, 100vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0.08),rgba(6,6,6,0.8))]" />
                <div className="absolute inset-x-4 bottom-4">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#cdb79e]">
                    Fabric Detail
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f4efe8]">
                    Matte surface, soft depth, and a luxury hand feel.
                  </p>
                </div>
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#111]"
                >
                  <Image
                    src={heroAssets.trousers}
                    alt="Premium pants hanging on a rack"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 20vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0.02),rgba(6,6,6,0.72))]" />
                  <div className="absolute inset-x-4 bottom-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#cdb79e]">
                      Essential Pants
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#f4efe8]">
                      Relaxed structure designed to ground the full uniform.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[#111]"
                >
                  <Image
                    src={heroAssets.editorial}
                    alt="Editorial rack with cinematic shadow"
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 20vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0.02),rgba(6,6,6,0.82))]" />
                  <div className="absolute inset-x-4 bottom-4">
                    <p className="text-[11px] uppercase tracking-[0.28em] text-[#cdb79e]">
                      Studio Mood
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#f4efe8]">
                      Calm lighting, soft motion, and product-led framing.
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </section>

        <AnimatedSection className="grid gap-4 lg:grid-cols-3">
          {featureBlocks.map((feature) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-[1.9rem] border border-black/8 bg-[#f8f6f1] p-6 shadow-[0_30px_90px_-75px_rgba(0,0,0,0.18)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-black/8 bg-white text-[#9b8166]">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-[-0.04em] text-[#111111]">
                  {feature.title}
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-7 text-[#5f5a53]">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </AnimatedSection>

        <AnimatedSection className="space-y-8 pt-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[#9b8b77]">
                Featured Collection
              </p>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-[#111111] sm:text-5xl">
                A minimal fashion edit built around product, texture, and breathing room.
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-[#5f5a53]">
              Oversized tees lead the launch, with neutral pants and easy daily combinations
              giving the collection depth without clutter.
            </p>
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            {featuredCollections.map((collection) => (
              <Link
                key={collection.title}
                href={collection.href}
                className="group overflow-hidden rounded-[2.2rem] border border-black/8 bg-white shadow-[0_38px_120px_-80px_rgba(0,0,0,0.28)]"
              >
                <div className="relative aspect-[4/4.5] overflow-hidden bg-[#111]">
                  <Image
                    src={collection.image}
                    alt={collection.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-[1.04]"
                    sizes="(min-width: 1280px) 30vw, (min-width: 768px) 50vw, 100vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,7,0.04),rgba(7,7,7,0.84))]" />
                </div>
                <div className="space-y-4 p-6">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-[#9b8b77]">
                    {collection.eyebrow}
                  </p>
                  <h3 className="text-3xl font-semibold tracking-[-0.05em] text-[#111111]">
                    {collection.title}
                  </h3>
                  <p className="text-sm leading-7 text-[#5f5a53]">{collection.description}</p>
                  <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#111111]">
                    Explore
                    <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="space-y-8 pt-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[#9b8b77]">
                Best Sellers
              </p>
              <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-[#111111] sm:text-5xl">
                Minimal luxury staples with quick access from the first scroll.
              </h2>
            </div>
            <Button
              asChild
              variant="outline"
              className="border-black/12 bg-white text-black hover:bg-black hover:text-white"
            >
              <Link href="/products">Shop All Essentials</Link>
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {showcasedProducts.map((entry) => (
              <LaunchProductCard
                key={entry.product.id}
                product={entry.product}
                image={entry.image}
                detail={entry.detail}
              />
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="pt-2">
          <section className="relative overflow-hidden rounded-[2.6rem] border border-white/8 bg-[#0d0d0d] shadow-[0_40px_140px_-75px_rgba(0,0,0,1)]">
            <Image
              src="https://images.pexels.com/photos/4862951/pexels-photo-4862951.jpeg?cs=srgb&dl=pexels-karola-g-4862951.jpg&fm=jpg"
              alt="Dark fabric texture"
              fill
              className="object-cover opacity-50"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(205,183,158,0.16),transparent_28%),linear-gradient(90deg,rgba(3,3,3,0.92),rgba(3,3,3,0.62))]" />
            <div className="relative flex min-h-[360px] items-end px-6 py-8 sm:px-8 lg:px-12 lg:py-12">
              <div className="max-w-2xl space-y-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-[#cdb79e]">
                  VALTORN Uniform
                </p>
                <h2 className="text-4xl font-semibold tracking-[-0.06em] text-[#f4efe8] sm:text-5xl lg:text-[4rem]">
                  Not Just Fashion. A Lifestyle.
                </h2>
                <p className="max-w-xl text-base leading-8 text-[#d1c9bd]">
                  Modern essentials crafted for confident everyday wear.
                </p>
                <Button
                  asChild
                  className="bg-[#f4efe8] text-black hover:bg-[#d7c8b3]"
                >
                  <Link href="/products">Discover The Drop</Link>
                </Button>
              </div>
            </div>
          </section>
        </AnimatedSection>
      </div>
    </div>
  );
}
