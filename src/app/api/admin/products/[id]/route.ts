import { deleteProduct, updateProduct } from "@/services/admin.service";
import { productMutationSchema } from "@/lib/validations/products";
import { assertSameOrigin } from "@/lib/utils/security";
import { enforceRateLimit } from "@/lib/utils/rate-limit";
import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    enforceRateLimit({
      key: `admin-products:patch:${getRequestIp(request)}`,
      limit: 20,
      windowMs: 60_000,
    });

    const payload = productMutationSchema.parse(await request.json());
    const { id } = await params;

    await updateProduct(id, {
      ...payload,
      images: payload.images.map((image) => ({
        displayOrder: image.displayOrder,
        imageUrl: image.imageUrl,
      })),
      variants: payload.variants,
    });

    return jsonSuccess({ id });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    enforceRateLimit({
      key: `admin-products:delete:${getRequestIp(request)}`,
      limit: 20,
      windowMs: 60_000,
    });

    const { id } = await params;
    await deleteProduct(id);
    return jsonSuccess({ id });
  } catch (error) {
    return jsonError(error);
  }
}
