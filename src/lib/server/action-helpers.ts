import { revalidatePath, revalidateTag } from "next/cache";

export function revalidateAdmin() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/products");
  revalidateTag("homepage");
  revalidateTag("categories");
}

export function revalidateCartSurfaces() {
  revalidatePath("/checkout");
  revalidatePath("/dashboard");
}

export function handleActionError(error: unknown, fallbackMessage: string): never {
  if (error instanceof Error) {
    const msg = error.message;
    if (msg.includes("message:")) {
      const match = msg.match(/message:\s*["']?([^,}]+)["']?/i);
      if (match && match[1]) {
        const clean = match[1].replace(/["'}]/g, "").trim();
        if (clean && clean !== "..." && clean.toLowerCase() !== "null") {
          throw new Error(clean);
        }
      }
    }
    if (msg.includes("code:") || msg.includes("details:") || msg.startsWith("{")) {
      throw new Error(fallbackMessage);
    }
    throw error;
  }
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    if (typeof err.message === "string" && err.message && err.message !== "...") {
      throw new Error(err.message);
    }
  }
  throw new Error(fallbackMessage);
}
