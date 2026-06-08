import { NextResponse } from "next/server";
import { ZodError } from "zod";

import type { PaginationMeta } from "@/types/backend";
import { AppError } from "@/lib/utils/errors";

export function createPaginationMeta(
  page: number,
  pageSize: number,
  total: number,
): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export function jsonSuccess<T>(
  data: T,
  init?: ResponseInit,
  meta?: PaginationMeta,
) {
  return NextResponse.json(meta ? { data, meta } : { data }, init);
}

export function jsonError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        issues: error.issues.map((issue) => ({
          message: issue.message,
          path: issue.path.join("."),
        })),
      },
      { status: 422 },
    );
  }

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: error.exposeMessage ? error.message : "Request failed.",
      },
      { status: error.statusCode },
    );
  }

  console.error(error);

  return NextResponse.json(
    {
      error: "Internal server error.",
    },
    { status: 500 },
  );
}

export function getRequestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "127.0.0.1"
  );
}
