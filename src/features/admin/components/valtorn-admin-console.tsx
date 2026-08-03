"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Activity,
  Archive,
  ArrowUpRight,
  CheckSquare,
  Copy,
  Filter,
  Layers3,
  Loader2,
  PackageSearch,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Square,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  archiveProductAction,
  bulkUpdateProductLabelsAction,
  createCategoryAction,
  createProductAction,
  deleteCategoryAction,
  deleteProductAction,
  duplicateProductAction,
  updateCategoryAction,
  updateOrderStatusAction,
  updateProductAction,
} from "@/actions/admin";
import type { CatalogProduct } from "@/types/backend";
import type { AdminCollectionRecord, AdminDashboardData, AdminOrderRecord } from "@/types/admin";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

import { useImageUpload } from "@/hooks/use-image-upload";
import { ImageUploadZone } from "./image-upload-zone";
import { HomepageEditor } from "./homepage-editor";


type ProductFormState = {
  categoryId: string;
  description: string;
  discountPrice: string;
  featured: boolean;
  trending: boolean;
  newArrival: boolean;
  bestSeller: boolean;
  recommended: boolean;
  limitedEdition: boolean;
  onSale: boolean;
  gender: "men" | "women" | "unisex";
  name: string;
  price: string;
  slug: string;
  status: "active" | "archived" | "draft";
  variants: {
    color: string;
    size: string;
    sku: string;
    stock: string;
  }[];
};

function extractCleanMessage(str: string, defaultMsg: string): string {
  if (!str) return defaultMsg;

  // 1. Try standard JSON parsing
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed) && parsed[0]?.message) {
      return parsed
        .map(
          (item: { path?: Array<string | number>; message: string }) =>
            `${item.path?.join(".") || "Field"}: ${item.message}`,
        )
        .join(" | ");
    }
    if (typeof parsed === "object" && parsed !== null && "message" in parsed) {
      const msg = String((parsed as { message: unknown }).message || "");
      if (msg && msg !== "...") return msg;
    }
  } catch {
    // Not JSON
  }

  // 2. Extract message property from unquoted/inspected object string like {code: ..., details: Null, message: Target message}
  if (str.includes("message:")) {
    const match = str.match(/message:\s*["']?([^,}]+)["']?/i) || str.match(/message:\s*(.+)$/i);
    if (match && match[1]) {
      const extracted = match[1].replace(/["'}]/g, "").trim();
      if (extracted && extracted !== "..." && extracted.toLowerCase() !== "null") {
        return extracted;
      }
    }
  }

  // 3. If raw object string like {code: ..., details: Null} with no readable message
  if (str.includes("code:") || str.includes("details:") || str.startsWith("{")) {
    return defaultMsg;
  }

  return str;
}

function getErrorMessage(error: unknown, defaultMessage = "An error occurred"): string {
  if (!error) return defaultMessage;

  if (typeof error === "string") {
    return extractCleanMessage(error, defaultMessage);
  }

  if (error instanceof Error) {
    return extractCleanMessage(error.message, defaultMessage);
  }

  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof (error as { message: unknown }).message === "string") {
      return extractCleanMessage((error as { message: string }).message, defaultMessage);
    }
  }

  return defaultMessage;
}

function buildDefaultProductForm(product?: CatalogProduct): ProductFormState {
  const variants =
    product?.variants.length
      ? product.variants.map((variant) => ({
          color: variant.color,
          size: variant.size,
          sku: variant.sku,
          stock: String(variant.stock),
        }))
      : [
          { color: "Black", size: "S", sku: "", stock: "0" },
          { color: "Black", size: "M", sku: "", stock: "0" },
          { color: "Black", size: "L", sku: "", stock: "0" },
        ];

  return {
    categoryId: product?.category.id ?? "",
    description: product?.description ?? "",
    discountPrice:
      product?.discountPrice === null || product?.discountPrice === undefined
        ? ""
        : String(product.discountPrice),
    featured: product?.featured ?? false,
    trending: product?.trending ?? false,
    newArrival: product?.newArrival ?? true,
    bestSeller: product?.bestSeller ?? false,
    recommended: product?.recommended ?? false,
    limitedEdition: product?.limitedEdition ?? false,
    onSale: product?.onSale ?? false,
    gender: product?.gender ?? "unisex",
    name: product?.name ?? "",
    price: product ? String(product.price) : "",
    slug: product?.slug ?? "",
    status: product?.status ?? "active",
    variants,
  };
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "No activity yet";
  }

  return new Date(value).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function SectionCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.9rem] border border-white/10 bg-[#121212] p-5 shadow-[0_24px_100px_-60px_rgba(0,0,0,0.85)] backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}

function VisibilityToggle({
  label,
  description,
  checked,
  onChange,
  badgeColor,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  badgeColor: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center justify-between rounded-xl border p-3 text-left transition-all duration-200 cursor-pointer w-full",
        checked
          ? "border-white/20 bg-white/[0.08] shadow-md"
          : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]",
      )}
    >
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#f5efe7]">{label}</span>
          <span className={cn("inline-block h-2 w-2 rounded-full", badgeColor)} />
        </div>
        <p className="text-[10px] text-[#a79f92]">{description}</p>
      </div>
      <div
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-in-out",
          checked ? "bg-emerald-500" : "bg-white/20",
        )}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out mt-0.5",
            checked ? "translate-x-4.5" : "translate-x-0.5",
          )}
        />
      </div>
    </button>
  );
}

function ProductEditorDialog({
  categories,
  product,
}: {
  categories: AdminCollectionRecord[];
  product?: CatalogProduct & {
    detailedImages?: Array<{ imageUrl: string; altText?: string | null; storagePath?: string | null; fileSize?: number | null; displayOrder: number }>;
  };
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<ProductFormState>(() =>
    buildDefaultProductForm(product),
  );

  // Initialize custom hook with detailed database image rows
  const initialImagesInput = product?.detailedImages 
    ? product.detailedImages.map((img) => ({
        imageUrl: img.imageUrl,
        altText: img.altText || "",
        displayOrder: img.displayOrder,
      }))
    : product?.images.map((img, i) => ({
        imageUrl: img,
        altText: "",
        displayOrder: i,
      })) || [];

  const {
    images: uploadableImages,
    addFiles,
    removeImage,
    replaceImage,
    reorderImages,
    retryUpload,
    setAltText,
    isUploading,
    hasErrors,
  } = useImageUpload(initialImagesInput);

  const isEditing = Boolean(product);

  const setVariantValue = (
    index: number,
    key: "color" | "size" | "sku" | "stock",
    value: string,
  ) => {
    setFormState((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [key]: value } : variant,
      ),
    }));
  };

  const addVariant = () => {
    setFormState((current) => ({
      ...current,
      variants: [...current.variants, { color: "Black", size: "S", sku: "", stock: "0" }],
    }));
  };

  const removeVariant = (index: number) => {
    setFormState((current) => ({
      ...current,
      variants: current.variants.filter((_, i) => i !== index),
    }));
  };

  const submit = () => {
    // 1. Client-side checks
    if (isUploading) {
      toast.error("Please wait until all uploads are complete.");
      return;
    }

    const completedImages = uploadableImages.filter((img) => img.status === "complete");
    if (completedImages.length < 3) {
      toast.error("At least 3 images are required.");
      return;
    }

    startTransition(async () => {
      try {
        const selectedCatId = formState.categoryId || null;
        const payload = {
          categoryId: selectedCatId,
          collectionId: selectedCatId,
          description: formState.description,
          discountPrice: formState.discountPrice
            ? Number(formState.discountPrice)
            : null,
          featured: formState.featured,
          trending: formState.trending,
          newArrival: formState.newArrival,
          bestSeller: formState.bestSeller,
          recommended: formState.recommended,
          limitedEdition: formState.limitedEdition,
          onSale: formState.onSale,
          gender: formState.gender,
          images: completedImages.map((img, index) => ({
            displayOrder: index,
            imageUrl: img.publicUrl!,
            altText: img.altText || null,
            storagePath: img.storagePath || null,
            fileSize: img.fileSize || null,
          })),
          name: formState.name,
          price: Number(formState.price),
          slug: formState.slug || undefined,
          status: formState.status,
          variants: formState.variants.map((variant) => ({
            color: variant.color,
            size: variant.size,
            sku:
              variant.sku && variant.sku.length >= 3
                ? variant.sku
                : `VAL-${(formState.name || "ITEM").replace(/[^a-zA-Z0-9]/g, "").substring(0, 3).toUpperCase()}-${variant.color}-${variant.size}`,
            stock: Number(variant.stock),
          })),
        };

        if (isEditing && product) {
          await updateProductAction(product.id, payload);
          toast.success("Product updated.");
        } else {
          await createProductAction(payload);
          toast.success("Product created.");
          setFormState(buildDefaultProductForm());
        }

        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to save product."));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isEditing ? "secondary" : "default"}>
          {isEditing ? "Edit" : "Create Product"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] overflow-y-auto border-white/10 bg-[#111111] text-[#f5efe7] sm:max-w-[960px]">
        <DialogHeader>
          <DialogTitle className="text-[#f7f2eb]">
            {isEditing ? "Edit Product" : "Create Product"}
          </DialogTitle>
          <DialogDescription className="text-[#a79f92]">
            Configure catalog details, upload product media assets, and manage variant-level inventory.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[#f5efe7]">Product Name</Label>
              <Input
                value={formState.name}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, name: event.target.value }))
                }
                className="border-white/10 bg-white/[0.04] text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[#f5efe7]">Slug</Label>
              <Input
                value={formState.slug}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, slug: event.target.value }))
                }
                className="border-white/10 bg-white/[0.04] text-white"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[#f5efe7]">Collection</Label>
                <select
                  value={formState.categoryId}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      categoryId: event.target.value,
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none cursor-pointer"
                >
                  <option value="" className="bg-[#121212] text-[#f5efe7]">Unassigned</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id} className="bg-[#121212] text-[#f5efe7]">
                      {category.name}
                    </option>
                  ))}
                </select>
                {formState.categoryId ? (
                  <p className="mt-1 text-[11px] font-semibold text-emerald-400">
                    ✓ Collection: {categories.find((c) => c.id === formState.categoryId)?.name || "Assigned"}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-amber-400/80">
                    ⚠ Unassigned collection
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-[#f5efe7]">Status</Label>
                <select
                  value={formState.status}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      status: event.target.value as ProductFormState["status"],
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none cursor-pointer"
                >
                  <option value="draft" className="bg-[#121212] text-[#f5efe7]">Draft</option>
                  <option value="active" className="bg-[#121212] text-[#f5efe7]">Active</option>
                  <option value="archived" className="bg-[#121212] text-[#f5efe7]">Archived</option>
                </select>
              </div>
            </div>

            {/* Product Visibility Section */}
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div>
                <h4 className="text-sm font-bold text-[#f7f2eb]">Product Visibility</h4>
                <p className="text-[11px] text-[#a79f92]">
                  Control how and where this piece appears across the storefront.
                </p>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2">
                <VisibilityToggle
                  label="Featured Product"
                  description="Pin to main featured showcases."
                  checked={formState.featured}
                  onChange={(val) => setFormState((curr) => ({ ...curr, featured: val }))}
                  badgeColor="bg-indigo-400"
                />
                <VisibilityToggle
                  label="New Arrival"
                  description="Mark as fresh catalog drop."
                  checked={formState.newArrival}
                  onChange={(val) => setFormState((curr) => ({ ...curr, newArrival: val }))}
                  badgeColor="bg-emerald-400"
                />
                <VisibilityToggle
                  label="Best Seller"
                  description="Highlight top-performing piece."
                  checked={formState.bestSeller}
                  onChange={(val) => setFormState((curr) => ({ ...curr, bestSeller: val }))}
                  badgeColor="bg-amber-400"
                />
                <VisibilityToggle
                  label="Trending"
                  description="Feature in Trending Now carousels."
                  checked={formState.trending}
                  onChange={(val) => setFormState((curr) => ({ ...curr, trending: val }))}
                  badgeColor="bg-orange-400"
                />
                <VisibilityToggle
                  label="Limited Edition"
                  description="Tag as rare/exclusive drop."
                  checked={formState.limitedEdition}
                  onChange={(val) => setFormState((curr) => ({ ...curr, limitedEdition: val }))}
                  badgeColor="bg-purple-400"
                />
                <VisibilityToggle
                  label="Recommended"
                  description="Suggest in recommendation modules."
                  checked={formState.recommended}
                  onChange={(val) => setFormState((curr) => ({ ...curr, recommended: val }))}
                  badgeColor="bg-sky-400"
                />
                <VisibilityToggle
                  label="On Sale"
                  description="Flag as promotional/discounted item."
                  checked={formState.onSale}
                  onChange={(val) => setFormState((curr) => ({ ...curr, onSale: val }))}
                  badgeColor="bg-rose-400"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#f5efe7]">Description</Label>
              <Textarea
                value={formState.description}
                onChange={(event) =>
                  setFormState((current) => ({ ...current, description: event.target.value }))
                }
                rows={2}
                placeholder="Product description..."
                className="border-white/10 bg-white/[0.04] text-white placeholder:text-white/30"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label className="text-[#f5efe7]">Price</Label>
                <Input
                  value={formState.price}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, price: event.target.value }))
                  }
                  className="border-white/10 bg-white/[0.04] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#f5efe7]">Discount Price</Label>
                <Input
                  value={formState.discountPrice}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      discountPrice: event.target.value,
                    }))
                  }
                  className="border-white/10 bg-white/[0.04] text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#f5efe7]">Gender</Label>
                <select
                  value={formState.gender}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      gender: event.target.value as ProductFormState["gender"],
                    }))
                  }
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none cursor-pointer"
                >
                  <option value="unisex" className="bg-[#121212] text-[#f5efe7]">Unisex</option>
                  <option value="men" className="bg-[#121212] text-[#f5efe7]">Men</option>
                  <option value="women" className="bg-[#121212] text-[#f5efe7]">Women</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-[#d3ccbf] cursor-pointer">
              <input
                type="checkbox"
                checked={formState.featured}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    featured: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-white cursor-pointer"
              />
              Mark as featured
            </label>
          </div>

          <div className="space-y-5">
            <div className="space-y-3">
              <Label className="text-[#f5efe7]">Images</Label>
              <ImageUploadZone
                images={uploadableImages}
                onAddFiles={addFiles}
                onRemoveImage={removeImage}
                onReplaceImage={replaceImage}
                onReorderImages={reorderImages}
                onRetryUpload={retryUpload}
                onSetAltText={setAltText}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-[#f5efe7]">Variants</Label>
                <button
                  type="button"
                  onClick={addVariant}
                  className="text-xs font-bold uppercase tracking-widest text-[#d8c0a1] hover:text-[#e5d4be] hover:underline"
                >
                  + Add Variant
                </button>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {formState.variants.map((variant, index) => (
                  <div
                    key={`${variant.sku}-${index}`}
                    className="relative grid gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 sm:grid-cols-2"
                  >
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-950 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white"
                    >
                      ×
                    </button>
                    <Input
                      value={variant.size}
                      onChange={(event) =>
                        setVariantValue(index, "size", event.target.value)
                      }
                      placeholder="Size"
                      className="border-white/10 bg-black/20 text-white"
                    />
                    <Input
                      value={variant.color}
                      onChange={(event) =>
                        setVariantValue(index, "color", event.target.value)
                      }
                      placeholder="Color"
                      className="border-white/10 bg-black/20 text-white"
                    />
                    <Input
                      value={variant.sku}
                      onChange={(event) =>
                        setVariantValue(index, "sku", event.target.value)
                      }
                      placeholder="SKU"
                      className="border-white/10 bg-black/20 text-white"
                    />
                    <Input
                      value={variant.stock}
                      onChange={(event) =>
                        setVariantValue(index, "stock", event.target.value)
                      }
                      placeholder="Stock"
                      className="border-white/10 bg-black/20 text-white"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-white/15 bg-white/5 text-[#f5efe7] hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={submit}
            disabled={isPending || isUploading || hasErrors}
            className="bg-[#f5efe7] text-black hover:bg-white font-bold disabled:opacity-50"
          >
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CollectionEditorDialog({
  collection,
}: {
  collection?: AdminCollectionRecord;

}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(collection?.name ?? "");
  const [slug, setSlug] = useState(collection?.slug ?? "");

  const isEditing = Boolean(collection);

  const submit = () => {
    startTransition(async () => {
      try {
        if (isEditing && collection) {
          await updateCategoryAction(collection.id, { name, slug });
          toast.success("Collection updated.");
        } else {
          await createCategoryAction({ name, slug });
          toast.success("Collection created.");
          setName("");
          setSlug("");
        }

        setOpen(false);
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to save collection."));
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={isEditing ? "secondary" : "default"}>
          {isEditing ? "Edit" : "Create Collection"}
        </Button>
      </DialogTrigger>
      <DialogContent className="border-white/10 bg-[#111111] text-[#f5efe7] sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-[#f7f2eb]">
            {isEditing ? "Edit Collection" : "Create Collection"}
          </DialogTitle>
          <DialogDescription className="text-[#a79f92]">
            Use collections for VALTORN groups like oversized fits, new arrivals, and best sellers.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[#f5efe7]">Name</Label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="border-white/10 bg-white/[0.04] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#f5efe7]">Slug</Label>
            <Input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="border-white/10 bg-white/[0.04] text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-white/15 bg-white/5 text-[#f5efe7] hover:bg-white/10 hover:text-white"
          >
            Cancel
          </Button>
          <Button onClick={submit} disabled={isPending} className="bg-[#f5efe7] text-black hover:bg-white font-bold disabled:opacity-50">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEditing ? "Save Changes" : "Create Collection"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProductManagementTab({
  products,
  collections,
}: {
  products: CatalogProduct[];
  collections: AdminCollectionRecord[];
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [labelFilter, setLabelFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkPending, startTransition] = useTransition();

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        `${product.name} ${product.category?.name ?? ""} ${product.status} ${product.description}`
          .toLowerCase()
          .includes(query);

      if (!matchesSearch) return false;

      if (labelFilter === "all") return true;
      if (labelFilter === "featured") return product.featured;
      if (labelFilter === "new_arrival") return product.newArrival;
      if (labelFilter === "best_seller") return product.bestSeller;
      if (labelFilter === "trending") return product.trending;
      if (labelFilter === "limited_edition") return product.limitedEdition;
      if (labelFilter === "recommended") return product.recommended;
      if (labelFilter === "on_sale") return product.onSale;

      return true;
    });
  }, [products, searchQuery, labelFilter]);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkAction = (updates: Record<string, boolean>, labelName: string) => {
    if (!selectedIds.size) {
      toast.error("Please select at least one product.");
      return;
    }

    startTransition(async () => {
      try {
        await bulkUpdateProductLabelsAction(Array.from(selectedIds), updates);
        toast.success(`Applied "${labelName}" to ${selectedIds.size} product(s).`);
        setSelectedIds(new Set());
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error, "Unable to execute bulk update."));
      }
    });
  };

  const labelFilters = [
    { key: "all", label: "All Products" },
    { key: "featured", label: "Featured" },
    { key: "new_arrival", label: "New Arrivals" },
    { key: "best_seller", label: "Best Sellers" },
    { key: "trending", label: "Trending" },
    { key: "limited_edition", label: "Limited Edition" },
    { key: "recommended", label: "Recommended" },
    { key: "on_sale", label: "On Sale" },
  ];

  return (
    <div className="space-y-6">
      <SectionCard>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d867a]">
              Product Management & Merchandising
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#f7f2eb]">
              Control product visibility, merchandising labels, and catalog updates.
            </h2>
          </div>
          <ProductEditorDialog categories={collections} />
        </div>
      </SectionCard>

      {/* Filter Bar & Bulk Actions */}
      <div className="flex flex-col gap-4 rounded-[1.8rem] border border-white/10 bg-[#121212] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products by name, collection, or description..."
              className="pl-10 border-white/10 bg-white/[0.04] text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Bulk Action Controls */}
          {selectedIds.size > 0 ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-xs">
              <span className="font-semibold text-amber-300">
                {selectedIds.size} selected
              </span>
              <div className="h-4 w-px bg-amber-500/30" />
              <select
                disabled={isBulkPending}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  if (val === "mark_featured") handleBulkAction({ featured: true }, "Mark as Featured");
                  if (val === "remove_featured") handleBulkAction({ featured: false }, "Remove Featured");
                  if (val === "mark_bestseller") handleBulkAction({ bestSeller: true }, "Mark as Best Seller");
                  if (val === "remove_bestseller") handleBulkAction({ bestSeller: false }, "Remove Best Seller");
                  if (val === "mark_newarrival") handleBulkAction({ newArrival: true }, "Mark as New Arrival");
                  if (val === "remove_newarrival") handleBulkAction({ newArrival: false }, "Remove New Arrival");
                  if (val === "mark_trending") handleBulkAction({ trending: true }, "Mark as Trending");
                  if (val === "remove_trending") handleBulkAction({ trending: false }, "Remove Trending");
                  if (val === "mark_limited") handleBulkAction({ limitedEdition: true }, "Mark as Limited Edition");
                  if (val === "remove_limited") handleBulkAction({ limitedEdition: false }, "Remove Limited Edition");
                  if (val === "mark_recommended") handleBulkAction({ recommended: true }, "Mark as Recommended");
                  if (val === "remove_recommended") handleBulkAction({ recommended: false }, "Remove Recommended");
                  if (val === "mark_onsale") handleBulkAction({ onSale: true }, "Mark as On Sale");
                  if (val === "remove_onsale") handleBulkAction({ onSale: false }, "Remove On Sale");
                  e.target.value = "";
                }}
                className="h-8 rounded-lg border border-amber-500/30 bg-[#161616] px-3 text-xs text-amber-200 outline-none cursor-pointer font-medium"
              >
                <option value="">Bulk Actions...</option>
                <option value="mark_featured">Mark as Featured</option>
                <option value="remove_featured">Remove Featured</option>
                <option value="mark_bestseller">Mark as Best Seller</option>
                <option value="remove_bestseller">Remove Best Seller</option>
                <option value="mark_newarrival">Mark as New Arrival</option>
                <option value="remove_newarrival">Remove New Arrival</option>
                <option value="mark_trending">Mark as Trending</option>
                <option value="remove_trending">Remove Trending</option>
                <option value="mark_limited">Mark as Limited Edition</option>
                <option value="remove_limited">Remove Limited Edition</option>
                <option value="mark_recommended">Mark as Recommended</option>
                <option value="remove_recommended">Remove Recommended</option>
                <option value="mark_onsale">Mark as On Sale</option>
                <option value="remove_onsale">Remove On Sale</option>
              </select>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedIds(new Set())}
                className="h-8 text-xs text-zinc-400 hover:text-white"
              >
                Deselect All
              </Button>
            </div>
          ) : null}
        </div>

        {/* Merchandising Label Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="mr-1 text-[11px] uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1">
            <Filter className="h-3 w-3" /> Labels:
          </span>
          {labelFilters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setLabelFilter(filter.key)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-semibold transition-all cursor-pointer",
                labelFilter === filter.key
                  ? "bg-white text-black shadow-sm"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Select All Bar */}
      <div className="flex items-center justify-between px-2 text-xs text-zinc-400">
        <button
          type="button"
          onClick={toggleSelectAll}
          className="flex items-center gap-2 hover:text-white transition cursor-pointer font-medium"
        >
          {selectedIds.size === filteredProducts.length && filteredProducts.length > 0 ? (
            <CheckSquare className="h-4 w-4 text-amber-400" />
          ) : (
            <Square className="h-4 w-4 text-zinc-500" />
          )}
          Select All ({filteredProducts.length})
        </button>
        <span>Showing {filteredProducts.length} of {products.length} products</span>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {filteredProducts.map((product) => {
          const isSelected = selectedIds.has(product.id);

          return (
            <SectionCard
              key={product.id}
              className={cn(
                "transition-all duration-300 relative overflow-hidden",
                isSelected
                  ? "border-2 border-amber-400/80 bg-[radial-gradient(ellipse_at_top,rgba(217,119,6,0.18),transparent_60%),linear-gradient(180deg,#1c1813_0%,#111111_100%)] shadow-[0_0_30px_rgba(245,158,11,0.15)] text-[#f7f2eb]"
                  : "border border-white/10 bg-[#121212] text-[#f5efe7] hover:border-white/20",
              )}
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleSelectOne(product.id)}
                    className="mt-1 transition cursor-pointer shrink-0"
                    aria-label={`Select ${product.name}`}
                  >
                    {isSelected ? (
                      <CheckSquare className="h-5 w-5 text-amber-400 fill-amber-400/20 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                    ) : (
                      <Square className="h-5 w-5 text-zinc-500 hover:text-zinc-300" />
                    )}
                  </button>

                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f7f2eb]">
                        {product.name}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "uppercase tracking-wider text-[10px] font-bold px-2.5 py-0.5 border",
                          product.status === "active"
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                            : product.status === "draft"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
                        )}
                      >
                        {product.status}
                      </Badge>
                    </div>

                    {/* Active Merchandising Labels Badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold mr-1">
                        Labels:
                      </span>
                      {product.featured ? (
                        <Badge className="bg-indigo-600/30 text-indigo-200 border border-indigo-400/50 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                          Featured
                        </Badge>
                      ) : null}
                      {product.bestSeller ? (
                        <Badge className="bg-amber-600/30 text-amber-200 border border-amber-400/50 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                          Best Seller
                        </Badge>
                      ) : null}
                      {product.newArrival ? (
                        <Badge className="bg-emerald-600/30 text-emerald-200 border border-emerald-400/50 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                          New Arrival
                        </Badge>
                      ) : null}
                      {product.trending ? (
                        <Badge className="bg-orange-600/30 text-orange-200 border border-orange-400/50 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                          Trending
                        </Badge>
                      ) : null}
                      {product.limitedEdition ? (
                        <Badge className="bg-purple-600/30 text-purple-200 border border-purple-400/50 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                          Limited Edition
                        </Badge>
                      ) : null}
                      {product.recommended ? (
                        <Badge className="bg-sky-600/30 text-sky-200 border border-sky-400/50 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                          Recommended
                        </Badge>
                      ) : null}
                      {product.onSale ? (
                        <Badge className="bg-rose-600/30 text-rose-200 border border-rose-400/50 font-bold text-[10px] uppercase tracking-wider px-2 py-0.5">
                          On Sale
                        </Badge>
                      ) : null}
                      {!product.featured &&
                      !product.bestSeller &&
                      !product.newArrival &&
                      !product.trending &&
                      !product.limitedEdition &&
                      !product.recommended &&
                      !product.onSale ? (
                        <span className="text-xs text-zinc-500 italic">None</span>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
                      <span className="text-amber-300 font-bold text-base">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-zinc-300">{product.stock} units</span>
                      <span className="text-zinc-400">{product.variants.length} variants</span>
                      <span className="text-zinc-400 font-medium">
                        Collection: <span className="text-white font-semibold">{product.category.name ?? "Unassigned"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <ProductEditorDialog categories={collections} product={product} />
                  <Button
                    variant="secondary"
                    className="bg-white text-black font-bold hover:bg-zinc-200 shadow-sm"
                    onClick={() =>
                      void duplicateProductAction(product.id)
                        .then(() => {
                          toast.success("Product duplicated.");
                          router.refresh();
                        })
                        .catch((error) =>
                          toast.error(getErrorMessage(error, "Unable to duplicate product.")),
                        )
                    }
                  >
                    <Copy className="mr-2 h-4 w-4 text-black" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white font-bold hover:bg-white hover:text-black shadow-sm transition-all"
                    onClick={() =>
                      void archiveProductAction(product.id)
                        .then(() => {
                          toast.success("Product archived.");
                          router.refresh();
                        })
                        .catch((error) =>
                          toast.error(getErrorMessage(error, "Unable to archive product.")),
                        )
                    }
                  >
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Button>
                  <Button
                    variant="outline"
                    className="border-rose-500/40 bg-rose-500/15 text-rose-200 font-bold hover:bg-rose-600 hover:text-white shadow-sm transition-all"
                    onClick={() => {
                      if (!window.confirm(`Delete ${product.name}?`)) {
                        return;
                      }

                      void deleteProductAction(product.id)
                        .then(() => {
                          toast.success("Product deleted.");
                          router.refresh();
                        })
                        .catch((error) =>
                          toast.error(getErrorMessage(error, "Unable to delete product.")),
                        );
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>
    </div>
  );
}

export function ValtornAdminConsole({ data }: { data: AdminDashboardData }) {
  const router = useRouter();
  const [customerQuery, setCustomerQuery] = useState("");
  const [orderSavingId, setOrderSavingId] = useState<string | null>(null);
  const [orderStatuses, setOrderStatuses] = useState<Record<string, AdminOrderRecord["status"]>>(
    () =>
      Object.fromEntries(data.orders.map((order) => [order.id, order.status])),
  );

  const filteredCustomers = useMemo(() => {
    const query = customerQuery.trim().toLowerCase();

    if (!query) {
      return data.customers;
    }

    return data.customers.filter((customer) =>
      `${customer.name} ${customer.email} ${customer.status}`
        .toLowerCase()
        .includes(query),
    );
  }, [customerQuery, data.customers]);

  const maxRevenue = Math.max(...data.revenueSeries.map((point) => point.revenue), 1);
  const maxUnits = Math.max(...data.productPerformance.map((item) => item.unitsSold), 1);

  const handleOrderUpdate = (orderId: string) => {
    const nextStatus = orderStatuses[orderId];

    setOrderSavingId(orderId);
    void updateOrderStatusAction(orderId, { status: nextStatus })
      .then(() => {
        toast.success("Order status updated.");
        router.refresh();
      })
      .catch((error) =>
        toast.error(getErrorMessage(error, "Unable to update order.")),
      )
      .finally(() => setOrderSavingId(null));
  };

  return (
    <div className="space-y-8 text-[#f5efe7]">
      <section className="overflow-hidden rounded-[2.7rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(202,175,145,0.16),transparent_32%),linear-gradient(180deg,#161616_0%,#090909_100%)] p-6 shadow-[0_50px_180px_-90px_rgba(0,0,0,0.95)] sm:p-8">
        <div className="flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-5">
            <Badge className="bg-[#d8c0a1] text-black">VALTORN Control Center</Badge>
            <div className="space-y-4">
              <h1 className="max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-[#f7f2eb] sm:text-6xl">
                Dark luxury administration for premium streetwear operations.
              </h1>
              <p className="max-w-3xl text-sm leading-8 text-[#a69f94] sm:text-base">
                Authentication is role-gated for admins, sessions are synchronized on the server, and the panel is organized for catalog, orders, customers, media, and revenue visibility from one place.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:min-w-[420px]">
            <SectionCard className="bg-white/[0.04]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d867a]">
                Total Sales
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-[#f7f2eb]">
                {formatCurrency(data.revenueSummary.totalSales)}
              </p>
            </SectionCard>
            <SectionCard className="bg-white/[0.04]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d867a]">
                Orders
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-[#f7f2eb]">
                {data.orderSummary.total}
              </p>
            </SectionCard>
            <SectionCard className="bg-white/[0.04]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d867a]">
                Customers
              </p>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-[#f7f2eb]">
                {data.customerSummary.totalCustomers}
              </p>
            </SectionCard>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <SignOutButton
            variant="secondary"
            className="bg-white/[0.06] text-[#f5efe7] hover:bg-white hover:text-black"
          />
        </div>
      </section>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="h-auto flex-wrap gap-2 rounded-[1.8rem] border border-white/10 bg-[#121212] p-2">
          <TabsTrigger value="overview" className="text-zinc-400 hover:text-white data-[state=active]:bg-white data-[state=active]:text-black font-semibold">Overview</TabsTrigger>
          <TabsTrigger value="homepage" className="text-zinc-400 hover:text-white data-[state=active]:bg-white data-[state=active]:text-black font-semibold">Homepage & Hero</TabsTrigger>
          <TabsTrigger value="products" className="text-zinc-400 hover:text-white data-[state=active]:bg-white data-[state=active]:text-black font-semibold">Products</TabsTrigger>
          <TabsTrigger value="collections" className="text-zinc-400 hover:text-white data-[state=active]:bg-white data-[state=active]:text-black font-semibold">Collections</TabsTrigger>
          <TabsTrigger value="orders" className="text-zinc-400 hover:text-white data-[state=active]:bg-white data-[state=active]:text-black font-semibold">Orders</TabsTrigger>
          <TabsTrigger value="customers" className="text-zinc-400 hover:text-white data-[state=active]:bg-white data-[state=active]:text-black font-semibold">Customers</TabsTrigger>
          <TabsTrigger value="settings" className="text-zinc-400 hover:text-white data-[state=active]:bg-white data-[state=active]:text-black font-semibold">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage" className="space-y-6">
          <HomepageEditor sections={data.homepageSections || []} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-5 xl:grid-cols-4">
            {[
              { label: "Monthly Revenue", value: formatCurrency(data.revenueSummary.monthlyRevenue), icon: Activity },
              { label: "Weekly Revenue", value: formatCurrency(data.revenueSummary.weeklyRevenue), icon: ArrowUpRight },
              { label: "Daily Revenue", value: formatCurrency(data.revenueSummary.dailyRevenue), icon: ShoppingCart },
              { label: "Low Stock Products", value: String(data.productSummary.lowStockProducts), icon: PackageSearch },
            ].map((item) => (
              <SectionCard key={item.label}>
                <item.icon className="h-5 w-5 text-[#d8c0a1]" />
                <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d867a]">
                  {item.label}
                </p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[#f7f2eb]">
                  {item.value}
                </p>
              </SectionCard>
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <SectionCard>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d867a]">
                    Revenue Chart
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#f7f2eb]">
                    Paid revenue over the last 7 days
                  </h2>
                </div>
                <Badge variant="secondary" className="bg-white/[0.06] text-[#f5efe7] ring-white/10">
                  Live from orders
                </Badge>
              </div>

              <div className="mt-8 grid grid-cols-7 gap-3">
                {data.revenueSeries.map((point) => (
                  <motion.div
                    key={point.dateKey}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="flex h-56 w-full items-end rounded-[1.5rem] bg-white/[0.03] p-3">
                      <div
                        className="w-full rounded-[1rem] bg-[linear-gradient(180deg,#d8c0a1_0%,#8b6a48_100%)]"
                        style={{
                          height: `${Math.max((point.revenue / maxRevenue) * 100, point.revenue ? 12 : 4)}%`,
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f5efe7]">
                        {point.label}
                      </p>
                      <p className="mt-1 text-xs text-[#8d867a]">
                        {formatCurrency(point.revenue)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </SectionCard>

            <SectionCard>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d867a]">
                Product Performance
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[#f7f2eb]">
                Best-selling products
              </h2>

              <div className="mt-8 space-y-4">
                {data.productPerformance.map((item) => (
                  <div key={item.id} className="space-y-2 rounded-[1.4rem] bg-white/[0.03] p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-[#f7f2eb]">{item.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-[#8d867a]">
                          {item.unitsSold} units sold
                        </p>
                      </div>
                      <p className="text-sm font-medium text-[#d8c0a1]">
                        {formatCurrency(item.revenue)}
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-white/8">
                      <div
                        className="h-full rounded-full bg-[#d8c0a1]"
                        style={{ width: `${Math.max((item.unitsSold / maxUnits) * 100, 8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <SectionCard>
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-5 w-5 text-[#d8c0a1]" />
                <h2 className="text-2xl font-semibold tracking-tight text-[#f7f2eb]">
                  Recent Orders
                </h2>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-[11px] uppercase tracking-[0.22em] text-[#8d867a]">
                    <tr>
                      <th className="pb-3">Order</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Items</th>
                      <th className="pb-3">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/8">
                    {data.orders.slice(0, 6).map((order) => (
                      <tr key={order.id}>
                        <td className="py-4 text-[#f7f2eb]">{order.id.slice(0, 8)}</td>
                        <td className="py-4">
                          <p className="font-medium text-[#f7f2eb]">{order.customerName}</p>
                          <p className="text-xs text-[#8d867a]">{order.customerEmail}</p>
                        </td>
                        <td className="py-4">
                          <Badge variant="secondary" className="bg-white/[0.05] text-[#f5efe7] ring-white/10">
                            {order.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-[#d6cfc3]">{order.itemCount}</td>
                        <td className="py-4 text-[#f7f2eb]">{formatCurrency(order.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-[#d8c0a1]" />
                <h2 className="text-2xl font-semibold tracking-tight text-[#f7f2eb]">
                  Activity Feed
                </h2>
              </div>
              <div className="mt-6 space-y-4">
                {data.activityFeed.map((activity) => (
                  <div
                    key={activity.id}
                    className="rounded-[1.5rem] border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#f7f2eb]">{activity.title}</p>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "ring-0",
                          activity.tone === "warning" && "bg-amber-400/15 text-amber-200",
                          activity.tone === "success" && "bg-emerald-400/15 text-emerald-200",
                          activity.tone === "neutral" && "bg-white/[0.06] text-[#f5efe7]",
                        )}
                      >
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-7 text-[#a69f94]">
                      {activity.description}
                    </p>
                    <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[#7d766a]">
                      {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <ProductManagementTab products={data.products} collections={data.collections} />
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          <SectionCard>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d867a]">
                  Collection Management
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#f7f2eb]">
                  Curate the storefront structure for campaigns, categories, and featured edits.
                </h2>
              </div>
              <CollectionEditorDialog />
            </div>
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-2">
            {data.collections.map((collection) => (
              <SectionCard key={collection.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold tracking-tight text-[#f7f2eb]">
                      {collection.name}
                    </p>
                    <p className="mt-2 text-sm font-mono text-amber-200/80">/{collection.slug}</p>
                    <p className="mt-4 text-sm leading-7 text-zinc-300 font-medium">
                      {collection.productCount} mapped product{collection.productCount === 1 ? "" : "s"}.
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-white ring-1 ring-white/15 font-semibold">
                    {formatTimestamp(collection.createdAt)}
                  </Badge>
                </div>

                <div className="mt-6 flex gap-3">
                  <CollectionEditorDialog collection={collection} />
                  <Button
                    variant="outline"
                    className="border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500 hover:text-white font-bold"
                    onClick={() => {
                      if (!window.confirm(`Delete ${collection.name}?`)) {
                        return;
                      }

                      void deleteCategoryAction(collection.id)
                        .then(() => {
                          toast.success("Collection deleted.");
                          router.refresh();
                        })
                        .catch((error) =>
                          toast.error(
                            error instanceof Error
                              ? error.message
                              : "Unable to delete collection.",
                          ),
                        );
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </SectionCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <SectionCard>
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-[#d8c0a1]" />
              <h2 className="text-3xl font-semibold tracking-tight text-[#f7f2eb]">
                Order Management
              </h2>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-[0.22em] text-[#8d867a]">
                  <tr>
                    <th className="pb-3">Order</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Created</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/8">
                  {data.orders.map((order) => (
                    <tr key={order.id}>
                      <td className="py-4 text-[#f7f2eb]">{order.id.slice(0, 8)}</td>
                      <td className="py-4">
                        <p className="font-medium text-[#f7f2eb]">{order.customerName}</p>
                        <p className="text-xs text-[#8d867a]">{order.customerEmail}</p>
                      </td>
                      <td className="py-4 text-[#d6cfc3]">{formatTimestamp(order.createdAt)}</td>
                      <td className="py-4">
                        <Badge variant="secondary" className="bg-white/[0.06] text-[#f5efe7] ring-white/10">
                          {order.paymentStatus}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <select
                          value={orderStatuses[order.id] ?? order.status}
                          onChange={(event) =>
                            setOrderStatuses((current) => ({
                              ...current,
                              [order.id]: event.target.value as AdminOrderRecord["status"],
                            }))
                          }
                          className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none cursor-pointer"
                        >
                          {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(
                            (status) => (
                              <option key={status} value={status} className="bg-[#121212] text-[#f5efe7]">
                                {status}
                              </option>
                            ),
                          )}
                        </select>
                      </td>
                      <td className="py-4 text-[#f7f2eb]">{formatCurrency(order.total)}</td>
                      <td className="py-4">
                        <Button
                          size="sm"
                          onClick={() => handleOrderUpdate(order.id)}
                          disabled={orderSavingId === order.id}
                        >
                          {orderSavingId === order.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Save
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <SectionCard>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d867a]">
                  Customer Management
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#f7f2eb]">
                  Track customer history, spending, and loyalty behavior.
                </h2>
              </div>
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d867a]" />
                <Input
                  value={customerQuery}
                  onChange={(event) => setCustomerQuery(event.target.value)}
                  placeholder="Search customers"
                  className="border-white/10 bg-white/[0.04] pl-11 text-white"
                />
              </div>
            </div>
          </SectionCard>

          <div className="grid gap-4">
            {filteredCustomers.map((customer) => (
              <SectionCard key={customer.id}>
                <div className="grid gap-5 xl:grid-cols-[1fr_auto_auto_auto] xl:items-center">
                  <div>
                    <p className="text-lg font-semibold tracking-tight text-[#f7f2eb]">
                      {customer.name}
                    </p>
                    <p className="mt-2 text-sm text-[#8d867a]">{customer.email}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#8d867a]">
                      Spend
                    </p>
                    <p className="mt-2 text-sm text-[#f7f2eb]">
                      {formatCurrency(customer.spending)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-[#8d867a]">
                      Orders
                    </p>
                    <p className="mt-2 text-sm text-[#f7f2eb]">{customer.orderCount}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "ring-0",
                        customer.status === "vip" && "bg-[#d8c0a1] text-black",
                        customer.status === "returning" &&
                          "bg-emerald-400/15 text-emerald-200",
                        customer.status === "new" && "bg-white/[0.06] text-[#f5efe7]",
                      )}
                    >
                      {customer.status}
                    </Badge>
                    <p className="text-xs uppercase tracking-[0.2em] text-[#7d766a]">
                      {formatTimestamp(customer.lastOrderAt ?? customer.createdAt)}
                    </p>
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-3">
            <SectionCard>
              <div className="flex items-center gap-3">
                <Settings2 className="h-5 w-5 text-[#d8c0a1]" />
                <h2 className="text-2xl font-semibold tracking-tight text-[#f7f2eb]">
                  Brand Settings
                </h2>
              </div>
              <div className="mt-6 space-y-4 text-sm leading-7 text-[#a69f94]">
                <p>Brand: VALTORN</p>
                <p>Positioning: Men&apos;s luxury streetwear</p>
                <p>Design system: dark, minimal, premium enterprise dashboard</p>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center gap-3">
                <Layers3 className="h-5 w-5 text-[#d8c0a1]" />
                <h2 className="text-2xl font-semibold tracking-tight text-[#f7f2eb]">
                  Content Modules
                </h2>
              </div>
              <div className="mt-6 space-y-4 text-sm leading-7 text-[#a69f94]">
                <p>Hero headlines, collection promotions, banners, and homepage modules are ready to be layered into dedicated settings tables.</p>
                <p>The current admin rebuild prioritizes secure access, product operations, collections, orders, customers, and media workflows.</p>
              </div>
            </SectionCard>

            <SectionCard>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-[#d8c0a1]" />
                <h2 className="text-2xl font-semibold tracking-tight text-[#f7f2eb]">
                  Security
                </h2>
              </div>
              <div className="mt-6 space-y-4 text-sm leading-7 text-[#a69f94]">
                <p>Admin access is granted by role, not hardcoded credentials.</p>
                <p>Protected routes block unauthorized `/admin` pages and admin APIs.</p>
                <p>Session synchronization now persists Supabase auth cookies on the server response before redirect decisions are made.</p>
              </div>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
