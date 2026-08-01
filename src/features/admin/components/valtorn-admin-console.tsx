"use client";

import { useMemo, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Activity,
  Archive,
  ArrowUpRight,
  Copy,
  Layers3,
  Loader2,
  PackageSearch,
  Search,
  Settings2,
  ShieldCheck,
  ShoppingCart,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import {
  archiveProductAction,
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
import { MediaLibraryManager } from "./media-library-manager";


type ProductFormState = {
  categoryId: string;
  description: string;
  discountPrice: string;
  featured: boolean;
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
        "rounded-[1.9rem] border border-white/10 bg-white/[0.03] p-5 shadow-[0_24px_100px_-60px_rgba(0,0,0,0.85)] backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
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
        const payload = {
          categoryId: formState.categoryId || null,
          description: formState.description,
          discountPrice: formState.discountPrice
            ? Number(formState.discountPrice)
            : null,
          featured: formState.featured,
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
        let msg = "Unable to save product.";
        if (error instanceof Error) {
          try {
            const parsed = JSON.parse(error.message);
            if (Array.isArray(parsed) && parsed[0]?.message) {
              msg = parsed
                .map(
                  (item: { path?: Array<string | number>; message: string }) =>
                    `${item.path?.join(".") || "Field"}: ${item.message}`,
                )
                .join(" | ");
            } else {
              msg = error.message;
            }
          } catch {
            msg = error.message;
          }
        }
        toast.error(msg);
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
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none"
                >
                  <option value="">Unassigned</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
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
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
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
                  className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none"
                >
                  <option value="unisex">Unisex</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 text-sm text-[#d3ccbf]">
              <input
                type="checkbox"
                checked={formState.featured}
                onChange={(event) =>
                  setFormState((current) => ({
                    ...current,
                    featured: event.target.checked,
                  }))
                }
                className="h-4 w-4 accent-white"
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

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={isPending || isUploading || hasErrors}>
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
        toast.error(
          error instanceof Error ? error.message : "Unable to save collection.",
        );
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

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEditing ? "Save Changes" : "Create Collection"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
        toast.error(error instanceof Error ? error.message : "Unable to update order."),
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
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="homepage">Homepage & Hero</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="media">Media Library</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="homepage" className="space-y-6">
          <HomepageEditor sections={[]} />
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
          <SectionCard>
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#8d867a]">
                  Product Management
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#f7f2eb]">
                  Create, edit, duplicate, archive, and delete catalog products.
                </h2>
              </div>
              <ProductEditorDialog categories={data.collections} />
            </div>
          </SectionCard>

          <div className="space-y-4">
            {data.products.map((product) => (
              <SectionCard key={product.id}>
                <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-semibold tracking-tight text-[#f7f2eb]">
                        {product.name}
                      </h3>
                      <Badge variant="secondary" className="bg-white/[0.06] text-[#f5efe7] ring-white/10">
                        {product.status}
                      </Badge>
                      {product.featured ? (
                        <Badge className="bg-[#d8c0a1] text-black">Featured</Badge>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-5 text-sm text-[#d7d0c5]">
                      <span>{formatCurrency(product.price)}</span>
                      <span>{product.stock} units</span>
                      <span>{product.variants.length} variants</span>
                      <span>{product.category.name ?? "No collection"}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <ProductEditorDialog categories={data.collections} product={product} />
                    <Button
                      variant="secondary"
                      onClick={() =>
                        void duplicateProductAction(product.id)
                          .then(() => {
                            toast.success("Product duplicated.");
                            router.refresh();
                          })
                          .catch((error) =>
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : "Unable to duplicate product.",
                            ),
                          )
                      }
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        void archiveProductAction(product.id)
                          .then(() => {
                            toast.success("Product archived.");
                            router.refresh();
                          })
                          .catch((error) =>
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : "Unable to archive product.",
                            ),
                          )
                      }
                    >
                      <Archive className="mr-2 h-4 w-4" />
                      Archive
                    </Button>
                    <Button
                      variant="outline"
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
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : "Unable to delete product.",
                            ),
                          );
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </SectionCard>
            ))}
          </div>
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
                    <p className="mt-2 text-sm text-[#8d867a]">/{collection.slug}</p>
                    <p className="mt-4 text-sm leading-7 text-[#a69f94]">
                      {collection.productCount} mapped product{collection.productCount === 1 ? "" : "s"}.
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-white/[0.06] text-[#f5efe7] ring-white/10">
                    {formatTimestamp(collection.createdAt)}
                  </Badge>
                </div>

                <div className="mt-6 flex gap-3">
                  <CollectionEditorDialog collection={collection} />
                  <Button
                    variant="outline"
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
                          className="h-10 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none"
                        >
                          {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map(
                            (status) => (
                              <option key={status} value={status}>
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

        <TabsContent value="media" className="space-y-6">
          <MediaLibraryManager initialAssets={[]} />
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
