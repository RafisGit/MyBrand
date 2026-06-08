import { removeCartItem, updateCartItemQuantity } from "@/services/cart.service";
import { cartQuantitySchema } from "@/lib/validations/cart";
import { assertSameOrigin } from "@/lib/utils/security";
import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";
import { enforceRateLimit } from "@/lib/utils/rate-limit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    assertSameOrigin(request);
    enforceRateLimit({
      key: `cart:patch:${getRequestIp(request)}`,
      limit: 30,
      windowMs: 60_000,
    });

    const payload = cartQuantitySchema.parse(await request.json());
    const { id } = await params;
    const cart = await updateCartItemQuantity(id, payload.quantity);

    return jsonSuccess(cart);
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
      key: `cart:delete:${getRequestIp(request)}`,
      limit: 30,
      windowMs: 60_000,
    });

    const { id } = await params;
    const cart = await removeCartItem(id);

    return jsonSuccess(cart);
  } catch (error) {
    return jsonError(error);
  }
}
