import { z } from "zod";

export const storageUploadSchema = z.object({
  bucket: z.enum(["products", "banners", "avatars"]),
  fileName: z.string().trim().min(1).max(200),
  contentType: z
    .string()
    .trim()
    .regex(/^image\/(jpeg|png|webp|avif)$/),
});
