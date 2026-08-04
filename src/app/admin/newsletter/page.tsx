import type { Metadata } from "next";
import { requireAdminUserOrRedirect } from "@/lib/auth";
import { NewsletterAdminManager } from "@/features/admin/components/newsletter-admin-manager";

export const metadata: Metadata = {
  title: "VALTORN Admin - Newsletter Subscribers",
  description: "Manage private list subscribers, access channels, statuses, and export data.",
};

export default async function AdminNewsletterPage() {
  await requireAdminUserOrRedirect("/admin/newsletter");

  return (
    <main className="min-h-screen bg-[#0A0A0A] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <NewsletterAdminManager />
      </div>
    </main>
  );
}
