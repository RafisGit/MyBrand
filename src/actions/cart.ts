"use server";

import {
  addCartItem,
  mergeGuestCart,
  removeCartItem,
  updateCartItemQuantity,
} from "@/services/cart.service";
import { cartItemSchema, cartQuantitySchema, guestCartMergeSchema } from "@/lib/validations/cart";
import { assertActionOrigin } from "@/lib/utils/security";

import { revalidateCartSurfaces } from "@/lib/server/action-helpers";

export async function addCartItemAction(input: {
  productVariantId: string;
  quantity: number;
}) {
  await assertActionOrigin();
  const payload = cartItemSchema.parse(input);
  const cart = await addCartItem(payload);
  revalidateCartSurfaces();
  return cart;
}

export async function updateCartItemQuantityAction(
  cartItemId: string,
  input: { quantity: number },
) {
  await assertActionOrigin();
  const payload = cartQuantitySchema.parse(input);
  const cart = await updateCartItemQuantity(cartItemId, payload.quantity);
  revalidateCartSurfaces();
  return cart;
}

export async function removeCartItemAction(cartItemId: string) {
  await assertActionOrigin();
  const cart = await removeCartItem(cartItemId);
  revalidateCartSurfaces();
  return cart;
}

export async function mergeGuestCartAction(input: {
  items: { color: string; productId: string; quantity: number; size: string }[];
}) {
  await assertActionOrigin();
  const payload = guestCartMergeSchema.parse(input);
  const cart = await mergeGuestCart(payload.items);
  revalidateCartSurfaces();
  return cart;
}
