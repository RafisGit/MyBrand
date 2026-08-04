export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly exposeMessage = true,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function getErrorMessage(error: unknown, fallbackMessage = "An error occurred"): string {
  if (!error) return fallbackMessage;

  // Handle browser DOM Event objects (like SyntheticEvent, ErrorEvent, etc.)
  if (typeof window !== "undefined" && error instanceof Event) {
    return fallbackMessage;
  }

  if (typeof error === "string") {
    const trimmed = error.trim();
    if (trimmed.startsWith("[object ") || trimmed.includes("[object Event]") || trimmed.includes("[object Object]")) {
      return fallbackMessage;
    }
    return trimmed || fallbackMessage;
  }

  if (error instanceof Error) {
    const msg = error.message?.trim();
    if (!msg || msg.startsWith("[object ") || msg.includes("[object Event]") || msg.includes("[object Object]")) {
      return fallbackMessage;
    }
    return msg;
  }

  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.message === "string" && errObj.message.trim()) {
      const msg = errObj.message.trim();
      if (!msg.startsWith("[object ")) return msg;
    }
    if (typeof errObj.details === "string" && errObj.details.trim()) {
      const details = errObj.details.trim();
      if (!details.startsWith("[object ")) return details;
    }
  }

  return fallbackMessage;
}

export function toAppError(error: unknown, fallbackMessage = "An error occurred"): AppError {
  if (error instanceof AppError) return error;
  const cleanMsg = getErrorMessage(error, fallbackMessage);
  return new AppError(cleanMsg);
}
