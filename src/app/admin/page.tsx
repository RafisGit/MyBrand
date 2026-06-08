import type { Metadata } from "next";

import { requireAdminUserOrRedirect } from "@/lib/auth";
import { ValtornAdminConsole } from "@/features/admin/components/valtorn-admin-console";
import { getAdminDashboardData } from "@/services/admin-dashboard.service";

export const metadata: Metadata = {
  title: "VALTORN Admin",
  description:
    "Dark luxury enterprise dashboard for VALTORN catalog, orders, customers, and media operations.",
};

export default async function AdminPage() {
  await requireAdminUserOrRedirect("/admin");
  const data = await getAdminDashboardData();

  return (
    <div className="page-shell">
      <ValtornAdminConsole data={data} />
    </div>
  );
}
