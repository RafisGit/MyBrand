import Link from "next/link";
import Image from "next/image";

import { heroContent } from "@/lib/data/content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedSection } from "@/components/shared/animated-section";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden rounded-[2.5rem] border border-black/10 bg-black text-white">
      <div className="absolute inset-0">
        <Image
          src={heroContent.image}
          alt="Luxury fashion editorial hero"
          fill
          priority
          className="object-cover opacity-90"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_40%),linear-gradient(180deg,rgba(0,0,0,0.12),rgba(0,0,0,0.75))]" />
      </div>

      <div className="relative mx-auto flex min-h-[78svh] max-w-[1400px] flex-col justify-end gap-12 px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-24">
        <AnimatedSection className="max-w-4xl space-y-8">
          <Badge variant="secondary" className="w-fit bg-white/10 text-white ring-white/15">
            {heroContent.eyebrow}
          </Badge>

          <div className="space-y-6">
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-7xl lg:text-[6rem]">
              {heroContent.title}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
              {heroContent.body}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="bg-white text-black hover:bg-zinc-200">
              <Link href={heroContent.primaryCta.href}>
                {heroContent.primaryCta.label}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white hover:text-black"
            >
              <Link href={heroContent.secondaryCta.href}>
                {heroContent.secondaryCta.label}
              </Link>
            </Button>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.15} className="grid gap-5 border-t border-white/10 pt-8 text-white/90 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">Look</p>
            <p className="mt-3 text-xl font-semibold tracking-tight text-white">Hanging garments. Quiet luxury.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">Mood</p>
            <p className="mt-3 text-xl font-semibold tracking-tight text-white">Sculptural light, matte surfaces, minimal drama.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-400">Focus</p>
            <p className="mt-3 text-xl font-semibold tracking-tight text-white">Products are the hero in every frame.</p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
