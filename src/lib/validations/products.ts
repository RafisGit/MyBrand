import { z } from "zod";

import { toSlug } from "@/lib/utils/slug";

const uuidSchema = z.string().uuid();

export const productSearchSchema = z.object({
  query: z.string().trim().min(1).optional(),
  category: z.string().trim().min(1).optional(),
  featured: z.coerce.boolean().optional(),
  gender: z.enum(["men", "women", "unisex"]).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sizes: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) =>
      !value ? undefined : Array.isArray(value) ? value : value.split(","),
    ),
  colors: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((value) =>
      !value ? undefined : Array.isArray(value) ? value : value.split(","),
    ),
  sort: z.enum(["latest", "price-asc", "price-desc", "featured"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(12),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .optional()
    .transform((value) => (value ? toSlug(value) : undefined)),
});

export const productVariantSchema = z.object({
  id: uuidSchema.optional(),
  size: z.string().trim().min(1).max(20),
  color: z.string().trim().min(1).max(40),
  stock: z.coerce.number().int().min(0),
  sku: z
    .string()
    .trim()
    .optional()
    .transform((val) => (val && val.length >= 3 ? val : `VAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)),
});

export const productImageSchema = z.object({
  id: uuidSchema.optional(),
  imageUrl: z.string().url(),
  displayOrder: z.coerce.number().int().min(0).default(0),
  altText: z.string().trim().max(200).optional().nullable(),
  storagePath: z.string().trim().max(500).optional().nullable(),
  fileSize: z.coerce.number().int().min(0).optional().nullable(),
});

export const productMutationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .optional()
    .transform((value) => (value ? toSlug(value) : undefined)),
  description: z.string().trim().max(5000).optional().default(""),
  price: z.coerce.number().min(0),
  discountPrice: z.coerce.number().min(0).nullable().optional(),
  categoryId: uuidSchema.nullable().optional(),
  collectionId: uuidSchema.nullable().optional(),
  gender: z.enum(["men", "women", "unisex"]).default("unisex"),
  featured: z.coerce.boolean().default(false),
  status: z.enum(["draft", "active", "archived"]).default("active"),
  images: z.array(productImageSchema).min(3, "At least 3 images are required").max(10, "A maximum of 10 images is allowed"),
  variants: z.array(productVariantSchema).min(1),
});

export const reviewSchema = z.object({
  productId: uuidSchema,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1200).optional(),
});
