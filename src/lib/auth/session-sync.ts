import "server-only";

import { z } from "zod";
import { NextResponse } from "next/server";

import {
  normalizePostAuthPath,
  resolvePostAuthRedirectPath,
  synchronizeUserRole,
} from "@/lib/admin-access";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const authSessionPayloadSchema = z.object({
  access_token: z.string().min(1).optional(),
  accessToken: z.string().min(1).optional(),
  refresh_token: z.string().min(1).optional(),
  refreshToken: z.string().min(1).optional(),
  next: z.string().optional(),
});

export async function synchronizeAuthSession(request: Request) {
  const rawBody = await request.json().catch(() => null);
  const parsedBody = authSessionPayloadSchema.safeParse(rawBody);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: "Invalid authentication payload." },
      { status: 400 },
    );
  }

  const accessToken =
    parsedBody.data.access_token ?? parsedBody.data.accessToken ?? "";
  const refreshToken =
    parsedBody.data.refresh_token ?? parsedBody.data.refreshToken ?? "";
  const nextPath = normalizePostAuthPath(parsedBody.data.next);

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Missing authentication tokens." }, { status: 400 });
  }

  const cookieResponse = NextResponse.next();

  try {
    const supabase = await createSupabaseServerClient({ response: cookieResponse });
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      return NextResponse.json(
        { error: sessionError.message },
        { status: 400 },
      );
    }

    const user =
      sessionData.user ??
      (await supabase.auth.getUser()).data.user;

    if (!user) {
      return NextResponse.json(
        { error: "Unable to verify authenticated user." },
        { status: 400 },
      );
    }

    const role = await synchronizeUserRole(user, supabase);
    const redirectPath = resolvePostAuthRedirectPath(nextPath, role);

    const response = NextResponse.json(
      {
        success: true,
        redirectPath,
        role,
      },
      { status: 200 },
    );

    // Copy Set-Cookie headers exactly to preserve all options (httpOnly, path, secure, maxAge, etc.)
    if (typeof cookieResponse.headers.getSetCookie === "function") {
      cookieResponse.headers.getSetCookie().forEach((cookieStr) => {
        response.headers.append("Set-Cookie", cookieStr);
      });
    } else {
      const setCookie = cookieResponse.headers.get("Set-Cookie");
      if (setCookie) {
        response.headers.set("Set-Cookie", setCookie);
      }
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to synchronize authentication session.",
      },
      { status: 500 },
    );
  }
}

