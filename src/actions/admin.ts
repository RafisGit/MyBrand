"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import {
  archiveProduct,
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  deleteMediaAsset,
  duplicateProduct,
  updateCategory,
  updateProduct,
} from "@/services/admin.service";
import { updateHomepageSection } from "@/services/cms.service";
import type { HomepageSection } from "@/types/cms";
import { updateOrderStatus } from "@/services/orders.service";
import { uploadAdminAsset } from "@/services/storage.service";
import { categorySchema, productMutationSchema } from "@/lib/validations/products";
import { orderStatusSchema } from "@/lib/validations/orders";
import { assertActionOrigin } from "@/lib/utils/security";

function revalidateAdmin() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/products");
  revalidateTag("homepage");
  revalidateTag("categories");
}

export async function createCategoryAction(input: {
  name: string;
  slug?: string;
}) {
  await assertActionOrigin();
  const payload = categorySchema.parse(input);
  const category = await createCategory(payload);
  revalidateAdmin();
  return category;
}

export async function updateCategoryAction(
  categoryId: string,
  input: { name: string; slug?: string },
) {
  await assertActionOrigin();
  const payload = categorySchema.parse(input);
  const category = await updateCategory(categoryId, payload);
  revalidateAdmin();
  return category;
}

export async function deleteCategoryAction(categoryId: string) {
  await assertActionOrigin();
  await deleteCategory(categoryId);
  revalidateAdmin();
}

export async function createProductAction(input: unknown) {
  await assertActionOrigin();
  const payload = productMutationSchema.parse(input);

  const product = await createProduct({
    ...payload,
    images: payload.images.map((image) => ({
      displayOrder: image.displayOrder,
      imageUrl: image.imageUrl,
      altText: image.altText ?? null,
      storagePath: image.storagePath ?? null,
      fileSize: image.fileSize ?? null,
    })),
    variants: payload.variants,
  });

  revalidateAdmin();
  return product;
}

export async function updateProductAction(productId: string, input: unknown) {
  await assertActionOrigin();
  const payload = productMutationSchema.parse(input);

  await updateProduct(productId, {
    ...payload,
    images: payload.images.map((image) => ({
      displayOrder: image.displayOrder,
      imageUrl: image.imageUrl,
      altText: image.altText ?? null,
      storagePath: image.storagePath ?? null,
      fileSize: image.fileSize ?? null,
    })),
    variants: payload.variants,
  });

  revalidateAdmin();
}

export async function deleteProductAction(productId: string) {
  await assertActionOrigin();
  await deleteProduct(productId);
  revalidateAdmin();
}

export async function duplicateProductAction(productId: string) {
  await assertActionOrigin();
  const product = await duplicateProduct(productId);
  revalidateAdmin();
  return product;
}

export async function archiveProductAction(productId: string) {
  await assertActionOrigin();
  const product = await archiveProduct(productId);
  revalidateAdmin();
  return product;
}

export async function updateOrderStatusAction(orderId: string, input: unknown) {
  await assertActionOrigin();
  const payload = orderStatusSchema.parse(input);
  const order = await updateOrderStatus(orderId, payload);
  revalidateAdmin();
  return order;
}

export async function uploadAdminAssetAction(input: {
  bucket: "products" | "banners";
  file: File;
  folder?: string;
}) {
  await assertActionOrigin();
  return uploadAdminAsset(input);
}

export async function updateHomepageSectionAction(
  sectionKey: string,
  payload: Partial<HomepageSection>
) {
  await assertActionOrigin();
  const updated = await updateHomepageSection(sectionKey, payload);
  revalidateAdmin();
  return updated;
}

export async function deleteMediaAssetAction(id: string, path: string, bucket = "products") {
  await assertActionOrigin();
  await deleteMediaAsset(id, path, bucket);
  revalidateAdmin();
}
