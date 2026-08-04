import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/auth";
import {
  getAdminNewsletterSubscribers,
  updateSubscriberStatus,
  deleteSubscriber,
  subscribeToNewsletter,
  exportNewsletterSubscribersCSV,
} from "@/services/newsletter.service";
import type { NewsletterStatus, NewsletterSource } from "@/types/newsletter";

export async function GET(req: NextRequest) {
  try {
    await requireAdminUser();

    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get("format");

    if (format === "csv") {
      const csvData = await exportNewsletterSubscribersCSV();
      return new NextResponse(csvData, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="valtorn_newsletter_subscribers_${Date.now()}.csv"`,
        },
      });
    }

    const search = searchParams.get("search") || "";
    const status = (searchParams.get("status") || "all") as NewsletterStatus | "all";
    const source = (searchParams.get("source") || "all") as NewsletterSource | "all";
    const sortBy = (searchParams.get("sortBy") || "newest") as "newest" | "oldest" | "email_asc" | "email_desc";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const result = await getAdminNewsletterSubscribers({
      search,
      status,
      source,
      sortBy,
      page,
      pageSize,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (err: unknown) {
    console.error("[NEWSLETTER ADMIN API GET ERROR]", err);
    const errorObj = err as { message?: string; status?: number };
    return NextResponse.json(
      { success: false, message: errorObj.message || "Unauthorized access." },
      { status: errorObj.status || 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdminUser();

    const body = await req.json();
    const { email, source = "admin" } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Valid email is required." },
        { status: 400 }
      );
    }

    const result = await subscribeToNewsletter({ email, source });
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Subscriber added successfully.", subscriber: result.subscriber },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorObj = err as { message?: string; status?: number };
    return NextResponse.json(
      { success: false, message: errorObj.message || "Unauthorized access." },
      { status: errorObj.status || 401 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminUser();

    const body = await req.json();
    const { id, status } = body;

    if (!id || !["active", "unsubscribed", "deactivated"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Invalid payload parameters." },
        { status: 400 }
      );
    }

    const ok = await updateSubscriberStatus(id, status);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Failed to update subscriber status." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: `Status updated to ${status}.` });
  } catch (err: unknown) {
    const errorObj = err as { message?: string; status?: number };
    return NextResponse.json(
      { success: false, message: errorObj.message || "Unauthorized access." },
      { status: errorObj.status || 401 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdminUser();

    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "Subscriber ID is required." },
        { status: 400 }
      );
    }

    const ok = await deleteSubscriber(id);
    if (!ok) {
      return NextResponse.json(
        { success: false, message: "Failed to delete subscriber." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: "Subscriber deleted successfully." });
  } catch (err: unknown) {
    const errorObj = err as { message?: string; status?: number };
    return NextResponse.json(
      { success: false, message: errorObj.message || "Unauthorized access." },
      { status: errorObj.status || 401 }
    );
  }
}
