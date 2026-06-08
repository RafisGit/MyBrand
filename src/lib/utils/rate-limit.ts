import { AppError } from "@/lib/utils/errors";

type RateLimitState = {
  count: number;
  resetAt: number;
};

const globalStore = globalThis as typeof globalThis & {
  __mybrandRateLimitStore__?: Map<string, RateLimitState>;
};

const rateLimitStore =
  globalStore.__mybrandRateLimitStore__ ??
  (globalStore.__mybrandRateLimitStore__ = new Map<string, RateLimitState>());

export function enforceRateLimit({
  key,
  limit,
  windowMs,
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();
  const state = rateLimitStore.get(key);

  if (!state || state.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return;
  }

  if (state.count >= limit) {
    throw new AppError("Too many requests. Please try again shortly.", 429);
  }

  state.count += 1;
  rateLimitStore.set(key, state);
}
