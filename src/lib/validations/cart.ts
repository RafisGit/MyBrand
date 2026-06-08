import { z } from "zod";

export const cartItemSchema = z.object({
  productVariantId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(20),
});

export const cartQuantitySchema = z.object({
  quantity: z.coerce.number().int().min(1).max(20),
});

export const guestCartMergeSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.coerce.number().int().min(1).max(20),
        size: z.string().trim().min(1),
        color: z.string().trim().min(1),
      }),
    )
    .max(50),
});
