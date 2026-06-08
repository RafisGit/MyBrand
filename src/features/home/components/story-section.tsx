import Image from "next/image";

import { editorialFeatures } from "@/lib/data/content";
import { AnimatedSection } from "@/components/shared/animated-section";
import { SectionHeading } from "@/components/shared/section-heading";

export function StorySection() {
  return (
    <section id="story" className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
      <AnimatedSection className="relative min-h-[620px] overflow-hidden rounded-[2.5rem] border border-black/10 bg-black">
        <Image
          src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80"
          alt="Editorial brand story image"
          fill
          className="object-cover opacity-90"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.85))]" />
        <div className="absolute inset-x-0 bottom-0 p-8 text-white sm:p-10">
          <p className="text-xs uppercase tracking-[0.26em] text-zinc-400">Brand Story</p>
          <p className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
            Designed with the restraint of a lookbook and the clarity of premium commerce.
          </p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300 sm:text-base">
            Every visual detail is chosen to let the garment presence breathe: soft light, deep shadow, and sculptural product focus.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection delay={0.1} className="space-y-10 rounded-[2.5rem] border border-black/10 bg-white p-8 sm:p-10">
        <SectionHeading
          eyebrow="Editorial Commerce"
          title="A homepage that behaves like a luxury campaign."
          description="Whitespace, contrast, and motion are used to let the product photography carry the story."
        />

        <div className="space-y-8">
          {editorialFeatures.map((feature) => (
            <div key={feature.title} className="border-t border-black/10 pt-6 first:border-t-0 first:pt-0">
              <h3 className="text-lg font-semibold tracking-tight text-black">
                {feature.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </AnimatedSection>
    </section>
  );
}
