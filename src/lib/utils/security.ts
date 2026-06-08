import { headers } from "next/headers";

import { AppError } from "@/lib/utils/errors";

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");

  if (!origin) {
    return;
  }

  const requestUrl = new URL(request.url);
  const originUrl = new URL(origin);

  if (requestUrl.host !== originUrl.host) {
    throw new AppError("Invalid request origin.", 403);
  }
}

export async function assertActionOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!origin || !host) {
    return;
  }

  if (new URL(origin).host !== host) {
    throw new AppError("Invalid action origin.", 403);
  }
}
