import Image from "next/image";
import Link from "next/link";

import { categoryHighlights } from "@/lib/constants";
import { AnimatedSection } from "@/components/shared/animated-section";
import { SectionHeading } from "@/components/shared/section-heading";

export function CategoryGrid() {
  return (
    <AnimatedSection className="space-y-10">
      <SectionHeading
        eyebrow="Categories"
        title="Browse the collection through a premium editorial edit."
        description="Each product category is presented with calm, contrast, and dramatic space so the garment reads like a campaign." 
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {categoryHighlights.map((category, index) => (
          <Link
            key={`${category.name}-${index}`}
            href={`/products?category=${encodeURIComponent(category.name)}`}
            className="group relative isolate overflow-hidden rounded-[2rem] border border-black/10 bg-black/5 transition hover:-translate-y-1 hover:shadow-[0_40px_100px_-60px_rgba(0,0,0,0.45)]"
          >
            <div className="absolute inset-0 bg-black/10" />
            <Image
              src={category.image}
              alt={category.name}
              fill
              className="object-cover opacity-90 transition duration-700 group-hover:scale-[1.05]"
              sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.8))]" />
            <div className="relative p-8 sm:p-10 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-zinc-300">
                {category.name}
              </p>
              <p className="mt-4 max-w-sm text-lg font-semibold tracking-[-0.03em] text-white sm:text-xl">
                {category.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </AnimatedSection>
  );
}
