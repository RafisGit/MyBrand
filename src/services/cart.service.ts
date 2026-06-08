import "server-only";

import { requireAuthenticatedUser } from "@/lib/auth";
import type { CartLineItem } from "@/types/backend";
import { AppError } from "@/lib/utils/errors";

type CartQueryRecord = {
  created_at: string;
  id: string;
  quantity: number;
  product_variants: {
    color: string;
    id: string;
    size: string;
    sku: string;
    stock: number;
    products: {
      discount_price: number | null;
      id: string;
      name: string;
      price: number;
      slug: string;
      stock: number;
      product_images: { display_order: number; image_url: string }[] | null;
    } | null;
  } | null;
};

const CART_SELECT = `
  id,
  quantity,
  created_at,
  product_variants (
    id,
    size,
    color,
    stock,
    sku,
    products (
      id,
      name,
      slug,
      price,
      discount_price,
      stock,
      product_images ( image_url, display_order )
    )
  )
`;

function mapCartItem(record: CartQueryRecord): CartLineItem {
  if (!record.product_variants?.products) {
    throw new AppError("Cart item product is unavailable.", 409);
  }

  const images = [...(record.product_variants.products.product_images ?? [])].sort(
    (left, right) => left.display_order - right.display_order,
  );

  return {
    id: record.id,
    quantity: record.quantity,
    createdAt: record.created_at,
    variant: {
      id: record.product_variants.id,
      size: record.product_variants.size,
      color: record.product_variants.color,
      stock: record.product_variants.stock,
      sku: record.product_variants.sku,
      product: {
        id: record.product_variants.products.id,
        name: record.product_variants.products.name,
        slug: record.product_variants.products.slug,
        price: Number(record.product_variants.products.price),
        discountPrice:
          record.product_variants.products.discount_price === null
            ? null
            : Number(record.product_variants.products.discount_price),
        stock: record.product_variants.products.stock,
        images: images.map((image) => image.image_url),
        primaryImage: images[0]?.image_url ?? null,
      },
    },
  };
}

export async function getCartItems() {
  const { profile, supabase } = await requireAuthenticatedUser();
  const { data, error } = await supabase
    .from("cart_items")
    .select(CART_SELECT)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => mapCartItem(item as CartQueryRecord));
}

export async function addCartItem(input: {
  productVariantId: string;
  quantity: number;
}) {
  const { profile, supabase } = await requireAuthenticatedUser();

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", profile.id)
    .eq("product_variant_id", input.productVariantId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("cart_items")
      .update({
        quantity: existing.quantity + input.quantity,
      })
      .eq("id", existing.id);

    if (error) {
      throw error;
    }
  } else {
    const { error } = await supabase.from("cart_items").insert({
      user_id: profile.id,
      product_variant_id: input.productVariantId,
      quantity: input.quantity,
    });

    if (error) {
      throw error;
    }
  }

  return getCartItems();
}

export async function updateCartItemQuantity(cartItemId: string, quantity: number) {
  const { profile, supabase } = await requireAuthenticatedUser();
  const { error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .eq("user_id", profile.id);

  if (error) {
    throw error;
  }

  return getCartItems();
}

export async function removeCartItem(cartItemId: string) {
  const { profile, supabase } = await requireAuthenticatedUser();
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", cartItemId)
    .eq("user_id", profile.id);

  if (error) {
    throw error;
  }

  return getCartItems();
}

export async function mergeGuestCart(
  items: { color: string; productId: string; quantity: number; size: string }[],
) {
  const { supabase } = await requireAuthenticatedUser();

  const productIds = Array.from(new Set(items.map((item) => item.productId)));
  const { data: products, error } = await supabase
    .from("products")
    .select("id, product_variants ( id, size, color )")
    .in("id", productIds);

  if (error) {
    throw error;
  }

  const matchedItems = items
    .map((item) => {
      const product = (products ?? []).find((candidate) => candidate.id === item.productId);
      const variant = product?.product_variants?.find(
        (candidate) =>
          candidate.size.toLowerCase() === item.size.toLowerCase() &&
          candidate.color.toLowerCase() === item.color.toLowerCase(),
      );

      if (!variant) {
        return null;
      }

      return {
        productVariantId: variant.id,
        quantity: item.quantity,
      };
    })
    .filter(Boolean) as { productVariantId: string; quantity: number }[];

  for (const item of matchedItems) {
    await addCartItem(item);
  }

  return getCartItems();
}
