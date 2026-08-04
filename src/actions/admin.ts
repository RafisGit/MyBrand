"use server";

import { handleActionError, revalidateAdmin } from "@/lib/server/action-helpers";
import {
  archiveProduct,
  bulkDeleteProducts,
  bulkUpdateProductLabels,
  bulkUpdateProductStatus,
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

export async function createCategoryAction(input: {
  name: string;
  slug?: string;
}) {
  try {
    await assertActionOrigin();
    const payload = categorySchema.parse(input);
    const category = await createCategory(payload);
    revalidateAdmin();
    return category;
  } catch (error) {
    handleActionError(error, "Failed to create collection.");
  }
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
  try {
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
  } catch (error) {
    handleActionError(error, "Failed to create product.");
  }
}

export async function updateProductAction(productId: string, input: unknown) {
  try {
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
  } catch (error) {
    handleActionError(error, "Failed to update product.");
  }
}

export async function deleteProductAction(productId: string) {
  try {
    await assertActionOrigin();
    await deleteProduct(productId);
    revalidateAdmin();
  } catch (error) {
    handleActionError(error, "Failed to delete product.");
  }
}

export async function duplicateProductAction(productId: string) {
  try {
    await assertActionOrigin();
    const product = await duplicateProduct(productId);
    revalidateAdmin();
    return product;
  } catch (error) {
    handleActionError(error, "Failed to duplicate product.");
  }
}

export async function archiveProductAction(productId: string) {
  try {
    await assertActionOrigin();
    const product = await archiveProduct(productId);
    revalidateAdmin();
    return product;
  } catch (error) {
    handleActionError(error, "Failed to archive product.");
  }
}

export async function updateOrderStatusAction(orderId: string, input: unknown) {
  try {
    await assertActionOrigin();
    const payload = orderStatusSchema.parse(input);
    const order = await updateOrderStatus(orderId, payload);
    revalidateAdmin();
    return order;
  } catch (error) {
    handleActionError(error, "Failed to update order status.");
  }
}

export async function uploadAdminAssetAction(input: {
  bucket: "products" | "banners";
  file: File;
  folder?: string;
}) {
  try {
    await assertActionOrigin();
    return uploadAdminAsset(input);
  } catch (error) {
    handleActionError(error, "Failed to upload asset.");
  }
}

export async function updateHomepageSectionAction(
  sectionKey: string,
  payload: Partial<HomepageSection>
) {
  try {
    await assertActionOrigin();
    const updated = await updateHomepageSection(sectionKey, payload);
    revalidateAdmin();
    return updated;
  } catch (error) {
    handleActionError(error, "Failed to update homepage section.");
  }
}

export async function deleteMediaAssetAction(id: string, path: string, bucket = "products") {
  try {
    await assertActionOrigin();
    await deleteMediaAsset(id, path, bucket);
    revalidateAdmin();
  } catch (error) {
    handleActionError(error, "Failed to delete media asset.");
  }
}

export async function bulkUpdateProductLabelsAction(
  productIds: string[],
  updates: {
    featured?: boolean;
    newArrival?: boolean;
    bestSeller?: boolean;
    trending?: boolean;
    limitedEdition?: boolean;
    recommended?: boolean;
    onSale?: boolean;
  },
) {
  try {
    await assertActionOrigin();
    await bulkUpdateProductLabels(productIds, updates);
    revalidateAdmin();
  } catch (error) {
    handleActionError(error, "Failed to execute bulk label update.");
  }
}

export async function bulkUpdateProductStatusAction(
  productIds: string[],
  status: "draft" | "active" | "archived",
) {
  try {
    await assertActionOrigin();
    await bulkUpdateProductStatus(productIds, status);
    revalidateAdmin();
  } catch (error) {
    handleActionError(error, "Failed to execute bulk status update.");
  }
}

export async function bulkDeleteProductsAction(productIds: string[]) {
  try {
    await assertActionOrigin();
    await bulkDeleteProducts(productIds);
    revalidateAdmin();
  } catch (error) {
    handleActionError(error, "Failed to execute bulk delete.");
  }
}
