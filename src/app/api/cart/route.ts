import { addCartItem, getCartItems } from "@/services/cart.service";
import { cartItemSchema } from "@/lib/validations/cart";
import { assertSameOrigin } from "@/lib/utils/security";
import { getRequestIp, jsonError, jsonSuccess } from "@/lib/utils/api";
import { enforceRateLimit } from "@/lib/utils/rate-limit";

export async function GET(request: Request) {
  try {
    enforceRateLimit({
      key: `cart:get:${getRequestIp(request)}`,
      limit: 60,
      windowMs: 60_000,
    });

    const cart = await getCartItems();
    return jsonSuccess(cart);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    enforceRateLimit({
      key: `cart:post:${getRequestIp(request)}`,
      limit: 30,
      windowMs: 60_000,
    });

    const payload = cartItemSchema.parse(await request.json());
    const cart = await addCartItem(payload);
    return jsonSuccess(cart, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
