"use client";

import Image from "next/image";
import { useState } from "react";
import { ZoomIn } from "lucide-react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function ProductGallery({
  name,
  images,
}: {
  name: string;
  images: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[120px_1fr]">
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-[1.25rem] border transition ${
              activeIndex === index ? "border-black" : "border-black/10"
            }`}
          >
            <Image
              src={image}
              alt={`${name} thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition duration-300 hover:opacity-100" />
          </button>
        ))}
      </div>

      <div className="order-1 relative aspect-[4/5] overflow-hidden rounded-[2.25rem] border border-black/10 bg-zinc-100 lg:order-2">
        <Image
          src={activeImage}
          alt={name}
          fill
          className="object-cover transition duration-700 hover:scale-105"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />
        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 rounded-full border border-white/20 bg-black/30 px-4 py-2 text-white backdrop-blur-sm">
          <span className="text-xs uppercase tracking-[0.28em] text-white/90">
            {activeIndex === 0 ? "Hero" : activeIndex === 1 ? "Flat lay" : "Macro detail"}
          </span>
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.24em] text-white transition hover:bg-white/15"
              >
                <ZoomIn className="h-4 w-4" />
                Zoom
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[90vw] p-0">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-black">
                <Image
                  src={activeImage}
                  alt={`${name} enlarged image`}
                  fill
                  className="object-cover"
                  sizes="90vw"
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
