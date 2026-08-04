import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getEmailServiceProvider } from "@/lib/newsletter/email-provider";
import type { Json } from "@/lib/supabase/database.types";
import type {
  NewsletterAdminQueryFilters,
  NewsletterAdminListResponse,
  NewsletterSubscriber,
  NewsletterSubscriptionInput,
  NewsletterSubscriptionResponse,
} from "@/types/newsletter";

// In-memory fallback mock storage if Supabase credentials are missing or database connection fails
const mockSubscriberStore: Map<string, NewsletterSubscriber> = new Map([
  [
    "vip.client@valtorn.com",
    {
      id: "sub-1001",
      email: "vip.client@valtorn.com",
      status: "active",
      source: "homepage",
      metadata: { ipHash: "127.0.0.1", initialSource: "homepage" },
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ],
  [
    "atelier@maison.com",
    {
      id: "sub-1002",
      email: "atelier@maison.com",
      status: "active",
      source: "footer",
      metadata: { ipHash: "127.0.0.1", initialSource: "footer" },
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ],
  [
    "editor@vogue.fr",
    {
      id: "sub-1003",
      email: "editor@vogue.fr",
      status: "active",
      source: "popup",
      metadata: { ipHash: "127.0.0.1", initialSource: "popup" },
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ],
]);

/**
 * Check if a subscriber already exists by email
 */
export async function findSubscriberByEmail(email: string): Promise<NewsletterSubscriber | null> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (!error && data) {
      return data as NewsletterSubscriber;
    }
  } catch (err) {
    console.warn("Supabase query failed, falling back to mock subscriber store:", err);
  }

  // Fallback to mock store
  return mockSubscriberStore.get(normalizedEmail) || null;
}

/**
 * Subscribe a new email to the newsletter
 */
export async function subscribeToNewsletter(
  input: NewsletterSubscriptionInput,
  clientMetadata: Record<string, unknown> = {}
): Promise<NewsletterSubscriptionResponse> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const source = input.source || "homepage";

  // Check for duplicate
  const existing = await findSubscriberByEmail(normalizedEmail);
  if (existing) {
    if (existing.status === "active") {
      return {
        success: false,
        message: "You're already on the list.",
      };
    }

    // Reactivate if unsubscribed or deactivated
    return reactivateSubscriberStatus(existing.id, normalizedEmail);
  }

  const newRecord: NewsletterSubscriber = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `sub-${Date.now()}`,
    email: normalizedEmail,
    status: "active",
    source,
    metadata: clientMetadata,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  let savedSubscriber: NewsletterSubscriber = newRecord;
  let savedInDb = false;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert({
        email: normalizedEmail,
        status: "active",
        source,
        metadata: clientMetadata as unknown as Json,
      })
      .select("*")
      .single();

    if (!error && data) {
      savedSubscriber = data as NewsletterSubscriber;
      savedInDb = true;
    } else if (error) {
      if (error.code === "23505") {
        // Postgres unique violation error
        return {
          success: false,
          message: "You're already on the list.",
        };
      }
      console.warn("Supabase insert warning:", error.message);
    }
  } catch (err) {
    console.warn("Supabase client unavailable, saving to mock store:", err);
  }

  if (!savedInDb) {
    mockSubscriberStore.set(normalizedEmail, newRecord);
  }

  // Notify third-party email provider via abstraction layer
  const provider = getEmailServiceProvider();
  await provider.syncSubscriber(normalizedEmail, source, clientMetadata).catch((e) => {
    console.error(`Email provider (${provider.name}) sync warning:`, e);
  });

  return {
    success: true,
    message: "✓ Welcome to the Private List.\nWe'll notify you before everyone else.",
    subscriber: savedSubscriber,
  };
}

/**
 * Reactivate an existing subscriber
 */
async function reactivateSubscriberStatus(
  id: string,
  email: string
): Promise<NewsletterSubscriptionResponse> {
  let updatedSubscriber: NewsletterSubscriber | null = null;

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .update({ status: "active", updated_at: new Date().toISOString() })
      .eq("email", email)
      .select("*")
      .single();

    if (!error && data) {
      updatedSubscriber = data as NewsletterSubscriber;
    }
  } catch (err) {
    console.warn("Supabase update error:", err);
  }

  if (!updatedSubscriber) {
    const mock = mockSubscriberStore.get(email);
    if (mock) {
      mock.status = "active";
      mock.updated_at = new Date().toISOString();
      mockSubscriberStore.set(email, mock);
      updatedSubscriber = mock;
    }
  }

  return {
    success: true,
    message: "✓ Welcome back to the Private List.\nWe'll notify you before everyone else.",
    subscriber: updatedSubscriber || undefined,
  };
}

/**
 * Admin: Get paginated list of subscribers with search & filters
 */
export async function getAdminNewsletterSubscribers(
  filters: NewsletterAdminQueryFilters = {}
): Promise<NewsletterAdminListResponse> {
  const {
    search = "",
    status = "all",
    source = "all",
    sortBy = "newest",
    page = 1,
    pageSize = 10,
  } = filters;

  try {
    const supabase = createSupabaseAdminClient();

    let query = supabase.from("newsletter_subscribers").select("*", { count: "exact" });

    // Apply search filter
    if (search.trim()) {
      query = query.ilike("email", `%${search.trim()}%`);
    }

    // Apply status filter
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Apply source filter
    if (source && source !== "all") {
      query = query.eq("source", source);
    }

    // Apply sorting
    switch (sortBy) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "email_asc":
        query = query.order("email", { ascending: true });
        break;
      case "email_desc":
        query = query.order("email", { ascending: false });
        break;
      case "newest":
      default:
        query = query.order("created_at", { ascending: false });
        break;
    }

    // Apply pagination range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, count, error } = await query;

    // Aggregate overall counts
    const { count: totalActive } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { count: totalUnsub } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("status", "unsubscribed");

    const { count: totalDeact } = await supabase
      .from("newsletter_subscribers")
      .select("*", { count: "exact", head: true })
      .eq("status", "deactivated");

    if (!error && data) {
      const totalCount = count || 0;
      return {
        subscribers: data as NewsletterSubscriber[],
        total: totalCount,
        activeCount: totalActive || 0,
        unsubscribedCount: totalUnsub || 0,
        deactivatedCount: totalDeact || 0,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      };
    }
  } catch (err) {
    console.warn("Supabase admin query failed, returning filtered mock data:", err);
  }

  // Fallback Mock Query Processing
  let items = Array.from(mockSubscriberStore.values());

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    items = items.filter((s) => s.email.toLowerCase().includes(q));
  }

  if (status && status !== "all") {
    items = items.filter((s) => s.status === status);
  }

  if (source && source !== "all") {
    items = items.filter((s) => s.source === source);
  }

  if (sortBy === "oldest") {
    items.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  } else if (sortBy === "email_asc") {
    items.sort((a, b) => a.email.localeCompare(b.email));
  } else if (sortBy === "email_desc") {
    items.sort((a, b) => b.email.localeCompare(a.email));
  } else {
    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  const activeCount = items.filter((i) => i.status === "active").length;
  const unsubscribedCount = items.filter((i) => i.status === "unsubscribed").length;
  const deactivatedCount = items.filter((i) => i.status === "deactivated").length;

  const total = items.length;
  const fromIndex = (page - 1) * pageSize;
  const pagedItems = items.slice(fromIndex, fromIndex + pageSize);

  return {
    subscribers: pagedItems,
    total,
    activeCount,
    unsubscribedCount,
    deactivatedCount,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Admin: Update subscriber status
 */
export async function updateSubscriberStatus(
  id: string,
  newStatus: "active" | "unsubscribed" | "deactivated"
): Promise<boolean> {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) return true;
  } catch (err) {
    console.warn("Supabase updateSubscriberStatus failed:", err);
  }

  // Update in mock store
  for (const [email, sub] of mockSubscriberStore.entries()) {
    if (sub.id === id) {
      sub.status = newStatus;
      sub.updated_at = new Date().toISOString();
      mockSubscriberStore.set(email, sub);
      return true;
    }
  }

  return false;
}

/**
 * Admin: Delete subscriber
 */
export async function deleteSubscriber(id: string): Promise<boolean> {
  try {
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);

    if (!error) return true;
  } catch (err) {
    console.warn("Supabase deleteSubscriber failed:", err);
  }

  // Delete from mock store
  for (const [email, sub] of mockSubscriberStore.entries()) {
    if (sub.id === id) {
      mockSubscriberStore.delete(email);
      return true;
    }
  }

  return false;
}

/**
 * Admin: Generate CSV string of subscribers
 */
export async function exportNewsletterSubscribersCSV(): Promise<string> {
  const result = await getAdminNewsletterSubscribers({ pageSize: 10000 });
  const headers = ["ID", "Email", "Status", "Source", "Subscribed At", "Updated At"];

  const rows = result.subscribers.map((sub) => [
    `"${sub.id}"`,
    `"${sub.email.replace(/"/g, '""')}"`,
    `"${sub.status}"`,
    `"${sub.source}"`,
    `"${new Date(sub.created_at).toISOString()}"`,
    `"${new Date(sub.updated_at).toISOString()}"`,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
