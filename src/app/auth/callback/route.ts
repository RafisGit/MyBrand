import { NextResponse } from "next/server";

import { resolvePostAuthRedirectPath, synchronizeUserRole } from "@/lib/admin-access";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/account";

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const response = NextResponse.next();
  const supabase = await createClient({ response });
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  const role = await synchronizeUserRole(user, supabase);
  const redirectPath = resolvePostAuthRedirectPath(next, role);
  const finalResponse = NextResponse.redirect(new URL(redirectPath, request.url));
  response.headers.forEach((value, key) => finalResponse.headers.append(key, value));

  return finalResponse;
}

