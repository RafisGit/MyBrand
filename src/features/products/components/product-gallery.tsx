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
    <div className="grid gap-3 sm:gap-4 lg:grid-cols-[120px_1fr]">
      {/* Thumbnail Strip */}
      <div className="order-2 flex gap-2.5 overflow-x-auto py-1 no-scrollbar lg:order-1 lg:flex-col lg:py-0">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`relative h-20 w-16 sm:h-24 sm:w-20 shrink-0 overflow-hidden rounded-[1rem] sm:rounded-[1.25rem] border transition active:scale-95 ${
              activeIndex === index ? "border-black ring-2 ring-black/20" : "border-black/10 opacity-70 hover:opacity-100"
            }`}
          >
            <Image
              src={image}
              alt={`${name} thumbnail ${index + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>

      {/* Main Image Viewport with Mobile Swipe Snap Points */}
      <div className="order-1 relative aspect-[4/5] overflow-hidden rounded-[1.8rem] sm:rounded-[2.25rem] border border-black/10 bg-zinc-100 lg:order-2">
        <Image
          src={activeImage}
          alt={name}
          fill
          priority
          className="object-cover transition duration-500 hover:scale-105"
          sizes="(min-width: 1024px) 50vw, 100vw"
        />

        {/* Mobile Slide Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-4 z-10 flex gap-1.5 sm:hidden">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? "w-6 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 flex items-center justify-between gap-3 rounded-full border border-white/20 bg-black/40 px-3.5 py-1.5 text-white backdrop-blur-md">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.24em] text-white/90 font-medium">
            {activeIndex === 0 ? "Hero" : activeIndex === 1 ? "Flat lay" : "Macro detail"}
          </span>
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white transition hover:bg-white/20 active:scale-95"
              >
                <ZoomIn className="h-3.5 w-3.5" />
                Zoom
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[92vw] sm:max-w-[85vw] p-0 border-none bg-transparent">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-black shadow-2xl">
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
