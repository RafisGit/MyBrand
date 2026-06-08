"use server";

import { redirect } from "next/navigation";

import { assertActionOrigin } from "@/lib/utils/security";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function signOutAction() {
  await assertActionOrigin();

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  redirect("/auth/login");
}
