import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import { resolvePostAuthRedirectPath, synchronizeUserRole } from "@/lib/admin-access";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/account";

  if (tokenHash && type) {
    try {
      const response = NextResponse.next();
      const supabase = await createClient({ response });
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });

      if (!error) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          return NextResponse.redirect(new URL(next, request.url));
        }

        const role = await synchronizeUserRole(user, supabase);
        const redirectPath = resolvePostAuthRedirectPath(next, role);
        const finalResponse = NextResponse.redirect(new URL(redirectPath, request.url));
        response.headers.forEach((value, key) => finalResponse.headers.append(key, value));

        return finalResponse;
      }
    } catch {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.redirect(new URL("/auth/login", request.url));
}

