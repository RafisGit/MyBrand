import { z } from "zod";

export const checkoutAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().email(),
  phone: z.string().trim().min(6).max(40),
  addressLine1: z.string().trim().min(5).max(200),
  addressLine2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2).max(80),
  region: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(80),
  notes: z.string().trim().max(500).optional(),
});

export const checkoutPayloadSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        name: z.string().trim().min(1),
        slug: z.string().trim().min(1),
        image: z.string().url(),
        price: z.coerce.number().min(0),
        size: z.string().trim().min(1),
        color: z.string().trim().min(1),
        quantity: z.coerce.number().int().min(1).max(20),
      }),
    )
    .min(1),
  shippingAddress: checkoutAddressSchema,
  paymentMethod: z.enum(["stripe", "sslcommerz"]),
  subtotal: z.coerce.number().min(0),
  shippingCost: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
  total: z.coerce.number().min(0),
});

export const orderStatusSchema = z.object({
  status: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  paymentStatus: z.enum(["unpaid", "paid", "failed", "refunded"]).optional(),
});
