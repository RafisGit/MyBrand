import { NextRequest, NextResponse } from "next/server";
import { newsletterSchema, sanitizeEmailInput } from "@/lib/validations/newsletter";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { subscribeToNewsletter } from "@/services/newsletter.service";

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Check
    const rateLimit = checkRateLimit(req, "newsletter_subscribe", {
      windowMs: 60 * 1000, // 1 minute window
      maxRequests: 5, // max 5 attempts per minute
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many subscription attempts. Please wait a minute and try again.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.resetSeconds),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
          },
        }
      );
    }

    // 2. Parse request JSON body safely
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid request payload." },
        { status: 400 }
      );
    }

    // 3. Honeypot check (Anti-spam measure for silent bot rejection)
    if (body.honeypot && String(body.honeypot).trim().length > 0) {
      console.warn("[NEWSLETTER SECURITY] Honeypot field triggered by bot subscriber.");
      // Return synthetic success response to fool spam bots
      return NextResponse.json(
        {
          success: true,
          message: "✓ Welcome to the Private List.\nWe'll notify you before everyone else.",
        },
        { status: 200 }
      );
    }

    // 4. Sanitize raw email input
    const sanitizedEmail = sanitizeEmailInput(body.email || "");

    // 5. Zod schema validation
    const validationResult = newsletterSchema.safeParse({
      email: sanitizedEmail,
      source: body.source || "homepage",
      honeypot: body.honeypot,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]?.message || "Enter a valid email address.";
      return NextResponse.json(
        {
          success: false,
          message: firstError,
          errors: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { email, source } = validationResult.data;

    // 6. Gather client metadata for audit & security logs
    const clientMetadata = {
      ipHash: req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1",
      userAgent: req.headers.get("user-agent") || "unknown",
      referer: req.headers.get("referer") || "direct",
    };

    // 7. Subscribe user via service layer
    const result = await subscribeToNewsletter({ email, source }, clientMetadata);

    if (!result.success) {
      const isDuplicate = result.message.includes("already on the list");
      return NextResponse.json(
        { success: false, message: result.message },
        { status: isDuplicate ? 409 : 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        subscriber: result.subscriber,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[NEWSLETTER API ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      },
      { status: 500 }
    );
  }
}
