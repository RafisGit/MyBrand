import { deleteCategory, updateCategory } from "@/services/admin.service";
import { categorySchema } from "@/lib/validations/products";
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
      key: `admin-categories:patch:${getRequestIp(request)}`,
      limit: 20,
      windowMs: 60_000,
    });

    const payload = categorySchema.parse(await request.json());
    const { id } = await params;
    const category = await updateCategory(id, payload);

    return jsonSuccess(category);
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
      key: `admin-categories:delete:${getRequestIp(request)}`,
      limit: 20,
      windowMs: 60_000,
    });

    const { id } = await params;
    await deleteCategory(id);

    return jsonSuccess({ id });
  } catch (error) {
    return jsonError(error);
  }
}
