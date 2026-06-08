"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/validations/products";
import { uploadAvatarAsset } from "@/services/storage.service";
import { assertActionOrigin } from "@/lib/utils/security";

export async function toggleWishlistAction(productId: string) {
  await assertActionOrigin();

  const { profile, supabase } = await requireAuthenticatedUser();
  const { data: existing } = await supabase
    .from("wishlist")
    .select("id")
    .eq("user_id", profile.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlist").delete().eq("id", existing.id);
  } else {
    await supabase.from("wishlist").insert({
      user_id: profile.id,
      product_id: productId,
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/products");
}

export async function submitReviewAction(input: unknown) {
  await assertActionOrigin();
  const payload = reviewSchema.parse(input);
  const { profile } = await requireAuthenticatedUser();
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("reviews").upsert(
    {
      user_id: profile.id,
      product_id: payload.productId,
      rating: payload.rating,
      comment: payload.comment ?? null,
    },
    {
      onConflict: "user_id,product_id",
    },
  );

  if (error) {
    throw error;
  }

  revalidatePath(`/products`);
}

export async function uploadAvatarAction(file: File) {
  await assertActionOrigin();
  const avatarUrl = await uploadAvatarAsset(file);
  revalidatePath("/dashboard");
  return avatarUrl;
}
