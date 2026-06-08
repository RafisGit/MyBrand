import Image from "next/image";

import { socialGallery } from "@/lib/data/content";
import { AnimatedSection } from "@/components/shared/animated-section";
import { SectionHeading } from "@/components/shared/section-heading";

export function SocialGrid() {
  return (
    <AnimatedSection className="space-y-10">
      <SectionHeading
        eyebrow="Product Frames"
        title="A gallery of material, shape, and texture built around product presence."
        description="A premium editorial edit with cinematic lighting and sculptural product detail."
        align="center"
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {socialGallery.map((item) => (
          <figure
            key={item.id}
            className="group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-black/10 bg-black/5"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.05]"
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.68))]" />
            <figcaption className="absolute bottom-0 left-0 p-6 text-sm font-medium uppercase tracking-[0.2em] text-white">
              {item.title}
            </figcaption>
          </figure>
        ))}
      </div>
    </AnimatedSection>
  );
}
