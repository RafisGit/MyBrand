import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Legacy dashboard route that redirects into the customer account experience.",
};

export default async function DashboardPage() {
  redirect("/account");
}
