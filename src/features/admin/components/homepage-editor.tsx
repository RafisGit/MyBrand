"use client";

import React, { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Eye, EyeOff, Save, Loader2, Sparkles, ImagePlus, UploadCloud, Trash2 } from "lucide-react";
import type { HomepageSection } from "@/types/cms";
import { updateHomepageSectionAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface HeroImageSlotProps {
  label: string;
  url: string;
  onUrlChange: (newUrl: string) => void;
  folderName: string;
}

function HeroImageSlot({ label, url, onUrlChange, folderName }: HeroImageSlotProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("bucket", "banners");
      formData.append("folder", folderName);
      formData.append("file", file);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });

      const json = await response.json();
      if (!response.ok || !json.data?.publicUrl) {
        throw new Error(json.error || "Failed to upload image.");
      }

      onUrlChange(json.data.publicUrl);
      toast.success(`${label} uploaded successfully!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  return (
    <div className="space-y-2 rounded-2xl border border-white/8 bg-white/[0.02] p-3.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-[#d8c0a1] uppercase tracking-wider">{label}</Label>
        <div className="flex items-center gap-2">
          {url ? (
            <button
              type="button"
              onClick={() => onUrlChange("")}
              className="text-[11px] text-rose-400 hover:text-rose-300 hover:underline flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" /> Clear
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-[11px] font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 hover:underline disabled:opacity-50"
          >
            Select File
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Drag & Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-3 text-center cursor-pointer transition-all duration-200 min-h-[110px]",
          isDragging
            ? "border-amber-400 bg-amber-400/10 scale-[1.01]"
            : "border-white/15 bg-black/30 hover:border-white/30 hover:bg-black/40"
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-3 text-amber-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xs font-semibold">Uploading to Storage...</span>
          </div>
        ) : url ? (
          <div className="relative w-full aspect-[16/7] overflow-hidden rounded-lg border border-white/10 group-hover:border-white/30">
            <Image src={url} alt={label} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <UploadCloud className="h-5 w-5 text-amber-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Drop new file or Click to replace
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 py-3 text-[#a79f92]">
            <UploadCloud className="h-6 w-6 text-amber-400/80 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-medium text-white">
              Drag & drop image here, or <span className="text-amber-400 underline">browse</span>
            </p>
            <p className="text-[10px] text-[#8d867a]">Supports PNG, JPG, WEBP</p>
          </div>
        )}
      </div>

      {/* Direct URL text box */}
      <Input
        value={url}
        onChange={(e) => onUrlChange(e.target.value)}
        placeholder="Or paste direct image URL (https://...)"
        className="border-white/10 bg-white/[0.04] text-xs text-white placeholder:text-white/30"
      />
    </div>
  );
}

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
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to save homepage section.");
      }
    });
  };

  return (
    <div className="space-y-6 rounded-3xl border border-white/10 bg-[#111111] p-6 text-[#f5efe7]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            Homepage Hero Section Editor
          </h2>
          <p className="text-xs text-[#a79f92] mt-1">
            Edit text, CTAs, and upload hero images via Drag & Drop or direct URLs. Updates live on storefront.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFormState((prev) => ({ ...prev, visibility: !prev.visibility }))}
            className="border-white/15 bg-white/5 text-[#f5efe7] hover:bg-white/10 hover:text-white"
          >
            {formState.visibility ? <Eye className="mr-2 h-4 w-4 text-emerald-400" /> : <EyeOff className="mr-2 h-4 w-4 text-rose-400" />}
            {formState.visibility ? "Visible" : "Hidden"}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-amber-500 text-black hover:bg-amber-400 font-bold px-6 cursor-pointer disabled:opacity-50"
          >
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
            Hero Section Image Assets (Drag & Drop or File Select)
          </h3>

          <HeroImageSlot
            label="Primary Hero Image"
            url={formState.primaryImage}
            onUrlChange={(url) => setFormState((prev) => ({ ...prev, primaryImage: url }))}
            folderName="hero"
          />

          <HeroImageSlot
            label="Fabric Close-up Image"
            url={formState.fabricImage}
            onUrlChange={(url) => setFormState((prev) => ({ ...prev, fabricImage: url }))}
            folderName="hero"
          />

          <HeroImageSlot
            label="Apparel / Trousers Card Image"
            url={formState.trousersImage}
            onUrlChange={(url) => setFormState((prev) => ({ ...prev, trousersImage: url }))}
            folderName="hero"
          />

          <HeroImageSlot
            label="Studio Editorial Image"
            url={formState.editorialImage}
            onUrlChange={(url) => setFormState((prev) => ({ ...prev, editorialImage: url }))}
            folderName="hero"
          />
        </div>
      </div>
    </div>
  );
}
