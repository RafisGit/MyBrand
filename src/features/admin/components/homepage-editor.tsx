"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, Save, Loader2, Sparkles, ImagePlus } from "lucide-react";
import type { HomepageSection } from "@/types/cms";
import { updateHomepageSectionAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function HomepageEditor({ sections }: { sections: HomepageSection[] }) {
  const [isPending, startTransition] = useTransition();
  const heroSection = sections.find((s) => s.sectionKey === "hero") || {
    sectionKey: "hero",
    title: "ARCHITECTURAL SILHOUETTES FOR THE MODERN ICON.",
    subtitle: "EST. 2026 / HIGH-DENSITY COTTON & TAILORED DRAPE",
    description: "VALTORN engineers heavyweight minimalist streetwear crafted with precision drape.",
    buttonText: "EXPLORE COLLECTION",
    buttonLink: "/products",
    images: {
      primary: "https://images.pexels.com/photos/35625406/pexels-photo-35625406.jpeg",
      fabric: "https://images.pexels.com/photos/7717491/pexels-photo-7717491.jpeg",
      trousers: "https://images.pexels.com/photos/20094389/pexels-photo-20094389.jpeg",
      editorial: "https://images.pexels.com/photos/35586905/pexels-photo-35586905.jpeg",
    },
    visibility: true,
    status: "published" as const,
  };

  const [formState, setFormState] = useState({
    title: heroSection.title,
    subtitle: heroSection.subtitle || "",
    description: heroSection.description || "",
    buttonText: heroSection.buttonText || "",
    buttonLink: heroSection.buttonLink || "",
    primaryImage: heroSection.images?.primary || "",
    fabricImage: heroSection.images?.fabric || "",
    trousersImage: heroSection.images?.trousers || "",
    editorialImage: heroSection.images?.editorial || "",
    visibility: heroSection.visibility,
  });

  const handleSave = () => {
    startTransition(async () => {
      try {
        await updateHomepageSectionAction("hero", {
          title: formState.title,
          subtitle: formState.subtitle,
          description: formState.description,
          buttonText: formState.buttonText,
          buttonLink: formState.buttonLink,
          images: {
            primary: formState.primaryImage,
            fabric: formState.fabricImage,
            trousers: formState.trousersImage,
            editorial: formState.editorialImage,
          },
          visibility: formState.visibility,
          status: "published",
        });
        toast.success("Homepage Hero Section published successfully!");
      } catch {
        toast.error("Failed to save homepage section.");
      }
    });
  };

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-[#111111] p-6 text-[#f5efe7]">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            Homepage Hero Section Editor
          </h2>
          <p className="text-xs text-[#a79f92] mt-1">
            Edit text, CTAs, and background/feature image URLs. Everything updates live on the storefront.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFormState((prev) => ({ ...prev, visibility: !prev.visibility }))}
            className="border-white/10 text-white"
          >
            {formState.visibility ? <Eye className="mr-2 h-4 w-4 text-emerald-400" /> : <EyeOff className="mr-2 h-4 w-4 text-rose-400" />}
            {formState.visibility ? "Visible" : "Hidden"}
          </Button>
          <Button onClick={handleSave} disabled={isPending} className="bg-amber-500 text-black hover:bg-amber-400 font-semibold">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save & Publish
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Subheading / Eyebrow</Label>
            <Input
              value={formState.subtitle}
              onChange={(e) => setFormState({ ...formState, subtitle: e.target.value })}
              className="border-white/10 bg-white/[0.04] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Main Hero Heading</Label>
            <Textarea
              value={formState.title}
              onChange={(e) => setFormState({ ...formState, title: e.target.value })}
              rows={2}
              className="border-white/10 bg-white/[0.04] text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Description Paragraph</Label>
            <Textarea
              value={formState.description}
              onChange={(e) => setFormState({ ...formState, description: e.target.value })}
              rows={3}
              className="border-white/10 bg-white/[0.04] text-white"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white">CTA Button Text</Label>
              <Input
                value={formState.buttonText}
                onChange={(e) => setFormState({ ...formState, buttonText: e.target.value })}
                className="border-white/10 bg-white/[0.04] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">CTA Link Target</Label>
              <Input
                value={formState.buttonLink}
                onChange={(e) => setFormState({ ...formState, buttonLink: e.target.value })}
                className="border-white/10 bg-white/[0.04] text-white"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <ImagePlus className="h-4 w-4 text-amber-400" />
            Hero Section Image Assets (Storage / CDN URLs)
          </h3>

          <div className="space-y-2">
            <Label className="text-xs text-[#a79f92]">Primary Hero Image URL</Label>
            <Input
              value={formState.primaryImage}
              onChange={(e) => setFormState({ ...formState, primaryImage: e.target.value })}
              className="border-white/10 bg-white/[0.04] text-xs text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-[#a79f92]">Fabric Close-up Image URL</Label>
            <Input
              value={formState.fabricImage}
              onChange={(e) => setFormState({ ...formState, fabricImage: e.target.value })}
              className="border-white/10 bg-white/[0.04] text-xs text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-[#a79f92]">Apparel / Trousers Card Image URL</Label>
            <Input
              value={formState.trousersImage}
              onChange={(e) => setFormState({ ...formState, trousersImage: e.target.value })}
              className="border-white/10 bg-white/[0.04] text-xs text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-[#a79f92]">Studio Editorial Image URL</Label>
            <Input
              value={formState.editorialImage}
              onChange={(e) => setFormState({ ...formState, editorialImage: e.target.value })}
              className="border-white/10 bg-white/[0.04] text-xs text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
