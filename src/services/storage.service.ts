import "server-only";

import { requireAdminUser, requireAuthenticatedUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { AppError } from "@/lib/utils/errors";

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

export function getStoragePublicUrl(
  bucket: "products" | "banners" | "avatars",
  path: string,
  options?: {
    height?: number;
    quality?: number;
    width?: number;
  },
) {
  const adminClient = createSupabaseAdminClient();

  return adminClient.storage.from(bucket).getPublicUrl(path, {
    transform: options,
  }).data.publicUrl;
}

export async function uploadAdminAsset(input: {
  bucket: "products" | "banners";
  file: File;
  folder?: string;
}) {
  const adminClient = createSupabaseAdminClient();
  await requireAdminUser();

  const filePath = `${input.folder ?? "uploads"}/${Date.now()}-${sanitizeFileName(
    input.file.name,
  )}`;

  const { error } = await adminClient.storage
    .from(input.bucket)
    .upload(filePath, await input.file.arrayBuffer(), {
      contentType: input.file.type,
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    throw error;
  }

  return {
    path: filePath,
    publicUrl: getStoragePublicUrl(input.bucket, filePath, {
      quality: 80,
      width: 1600,
    }),
  };
}

export async function uploadAvatarAsset(file: File) {
  const adminClient = createSupabaseAdminClient();
  const { profile } = await requireAuthenticatedUser();
  const filePath = `${profile.id}/${Date.now()}-${sanitizeFileName(file.name)}`;

  const { error } = await adminClient.storage
    .from("avatars")
    .upload(filePath, await file.arrayBuffer(), {
      contentType: file.type,
      upsert: true,
      cacheControl: "3600",
    });

  if (error) {
    throw error;
  }

  const avatarUrl = getStoragePublicUrl("avatars", filePath, {
    height: 256,
    quality: 80,
    width: 256,
  });

  const { error: updateError } = await adminClient
    .from("users")
    .update({ avatar_url: avatarUrl })
    .eq("id", profile.id);

  if (updateError) {
    throw updateError;
  }

  return avatarUrl;
}

export async function deleteAdminAsset(
  bucket: "products" | "banners" | "avatars",
  path: string,
) {
  const adminClient = createSupabaseAdminClient();

  if (bucket === "avatars") {
    await requireAuthenticatedUser();
  } else {
    await requireAdminUser();
  }

  const { error } = await adminClient.storage.from(bucket).remove([path]);

  if (error) {
    throw new AppError(error.message, 400);
  }
}
