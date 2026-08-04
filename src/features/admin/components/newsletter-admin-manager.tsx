"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Users,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download,
  Trash2,
  XCircle,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import type {
  NewsletterSubscriber,
  NewsletterStatus,
  NewsletterSource,
  NewsletterAdminListResponse,
} from "@/types/newsletter";
import { cn } from "@/lib/utils";

export function NewsletterAdminManager() {
  const [data, setData] = useState<NewsletterAdminListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<NewsletterStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<NewsletterSource | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "email_asc" | "email_desc">("newest");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modals state
  const [deleteTarget, setDeleteTarget] = useState<NewsletterSubscriber | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newEmailInput, setNewEmailInput] = useState("");
  const [newSourceInput, setNewSourceInput] = useState<NewsletterSource>("admin");
  const [isAdding, setIsAdding] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search query
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch subscribers from Admin API
  const fetchSubscribers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        search: debouncedSearch,
        status: statusFilter,
        source: sourceFilter,
        sortBy,
        page: String(page),
        pageSize: String(pageSize),
      });

      const res = await fetch(`/api/newsletter/admin?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setData(json.data);
      } else {
        toast.error(json.message || "Failed to load subscribers.");
      }
    } catch (err) {
      console.error("Admin fetch error:", err);
      toast.error("Failed to connect to administrative server.");
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, statusFilter, sourceFilter, sortBy, page]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  // Toggle subscriber status (active <-> deactivated/unsubscribed)
  const handleToggleStatus = async (subscriber: NewsletterSubscriber, targetStatus: NewsletterStatus) => {
    setActionLoadingId(subscriber.id);
    try {
      const res = await fetch("/api/newsletter/admin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: subscriber.id, status: targetStatus }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`Subscriber ${subscriber.email} updated to ${targetStatus}.`);
        fetchSubscribers();
      } else {
        toast.error(json.message || "Failed to update status.");
      }
    } catch (err) {
      console.error("Status update error:", err);
      toast.error("Network error while updating status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete subscriber
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/newsletter/admin?id=${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`Subscriber ${deleteTarget.email} deleted successfully.`);
        setDeleteTarget(null);
        fetchSubscribers();
      } else {
        toast.error(json.message || "Failed to delete subscriber.");
      }
    } catch (err) {
      console.error("Delete subscriber error:", err);
      toast.error("Network error while deleting subscriber.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Add Manual Subscriber
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmailInput.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/newsletter/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmailInput.trim(), source: newSourceInput }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`Added ${newEmailInput} to subscribers list.`);
        setNewEmailInput("");
        setIsAddOpen(false);
        fetchSubscribers();
      } else {
        toast.error(json.message || "Failed to add subscriber.");
      }
    } catch (err) {
      console.error("Add subscriber error:", err);
      toast.error("Network error while adding subscriber.");
    } finally {
      setIsAdding(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    window.open("/api/newsletter/admin?format=csv", "_blank");
    toast.success("CSV export initiated.");
  };

  return (
    <div className="space-y-8 text-zinc-100 font-sans">
      {/* Header & Title */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-amber-400">
            <Sparkles className="h-3 w-3" />
            VALTORN VIP SUBSCRIBERS
          </div>
          <h1 className="mt-2 text-3xl font-light tracking-tight text-white font-serif uppercase">
            Newsletter Subscribers
          </h1>
          <p className="mt-1 text-sm text-zinc-400 font-light">
            Manage private list members, access sources, subscription statuses, and automated export feeds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchSubscribers}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-white/10"
            title="Refresh List"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-white transition hover:bg-white/10 hover:border-white/20"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-zinc-200 shadow-md"
          >
            <Plus className="h-4 w-4" />
            Add Subscriber
          </button>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Subscribers */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Total List Size</span>
            <Users className="h-5 w-5 text-white/60" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-light text-white font-serif">
              {data ? data.total.toLocaleString() : "..."}
            </span>
            <span className="text-xs text-zinc-500">subscribers</span>
          </div>
        </div>

        {/* Active Members */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium text-emerald-400">
              Active VIP Members
            </span>
            <UserCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-light text-white font-serif">
              {data ? data.activeCount.toLocaleString() : "..."}
            </span>
            <span className="text-xs text-emerald-400/80">
              {data && data.total > 0
                ? `${Math.round((data.activeCount / data.total) * 100)}% active`
                : "active"}
            </span>
          </div>
        </div>

        {/* Unsubscribed */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Unsubscribed</span>
            <UserX className="h-5 w-5 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-light text-white font-serif">
              {data ? data.unsubscribedCount.toLocaleString() : "..."}
            </span>
            <span className="text-xs text-zinc-500">users</span>
          </div>
        </div>

        {/* Deactivated */}
        <div className="rounded-2xl border border-white/10 bg-[#121212] p-5 shadow-xl">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs uppercase tracking-wider font-medium">Deactivated</span>
            <XCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-light text-white font-serif">
              {data ? data.deactivatedCount.toLocaleString() : "..."}
            </span>
            <span className="text-xs text-zinc-500">records</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl border border-white/10 bg-[#121212] p-4">
        {/* Search input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscribers by email..."
            className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/10"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-zinc-400" />
            <span className="text-xs text-zinc-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as NewsletterStatus | "all");
                setPage(1);
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-white focus:outline-none bg-[#121212]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>

          {/* Source Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value as NewsletterSource | "all");
                setPage(1);
              }}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-white focus:outline-none bg-[#121212]"
            >
              <option value="all">All Sources</option>
              <option value="homepage">Homepage</option>
              <option value="footer">Footer</option>
              <option value="popup">Popup</option>
              <option value="checkout">Checkout</option>
              <option value="admin">Admin Added</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "newest" | "oldest" | "email_asc" | "email_desc"
                )
              }
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white focus:border-white focus:outline-none bg-[#121212]"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="email_asc">Email (A - Z)</option>
              <option value="email_desc">Email (Z - A)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121212] shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.03] text-zinc-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-4 font-semibold">Subscriber Email</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Source</th>
                <th className="px-6 py-4 font-semibold">Subscribed Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                /* Skeleton Loader Rows */
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="h-4 w-48 rounded bg-white/10" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-5 w-20 rounded-full bg-white/10" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-24 rounded bg-white/10" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 rounded bg-white/10" />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="ml-auto h-6 w-20 rounded bg-white/10" />
                    </td>
                  </tr>
                ))
              ) : !data || data.subscribers.length === 0 ? (
                /* Empty State */
                <tr>
                  <td colSpan={5} className="py-16 text-center text-zinc-400">
                    <Mail className="mx-auto h-10 w-10 text-zinc-600 mb-3" />
                    <p className="text-base font-medium text-white">No subscribers found</p>
                    <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                      No subscriber records matching your search or filters. Try resetting search query.
                    </p>
                  </td>
                </tr>
              ) : (
                /* Data Rows */
                data.subscribers.map((subscriber) => {
                  const isActionLoading = actionLoadingId === subscriber.id;

                  return (
                    <tr
                      key={subscriber.id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      {/* Email */}
                      <td className="px-6 py-4 font-medium text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-zinc-300 border border-white/10 font-mono text-xs">
                            {subscriber.email.charAt(0).toUpperCase()}
                          </div>
                          <span>{subscriber.email}</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider",
                            subscriber.status === "active" &&
                              "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                            subscriber.status === "unsubscribed" &&
                              "bg-amber-500/10 text-amber-400 border border-amber-500/20",
                            subscriber.status === "deactivated" &&
                              "bg-red-500/10 text-red-400 border border-red-500/20"
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              subscriber.status === "active" && "bg-emerald-400",
                              subscriber.status === "unsubscribed" && "bg-amber-400",
                              subscriber.status === "deactivated" && "bg-red-400"
                            )}
                          />
                          {subscriber.status}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="px-6 py-4 text-zinc-400 capitalize">
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px]">
                          {subscriber.source}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-4 text-zinc-400 font-mono text-[11px]">
                        {new Date(subscriber.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Toggle Active / Deactivated */}
                          {subscriber.status === "active" ? (
                            <button
                              disabled={isActionLoading}
                              onClick={() => handleToggleStatus(subscriber, "deactivated")}
                              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20 transition disabled:opacity-50"
                            >
                              Deactivate
                            </button>
                          ) : (
                            <button
                              disabled={isActionLoading}
                              onClick={() => handleToggleStatus(subscriber, "active")}
                              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition disabled:opacity-50"
                            >
                              Reactivate
                            </button>
                          )}

                          {/* Delete Trigger */}
                          <button
                            disabled={isActionLoading}
                            onClick={() => setDeleteTarget(subscriber)}
                            className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                            title="Delete Subscriber"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-white/10 bg-white/[0.02] px-6 py-3 text-xs text-zinc-400">
            <div>
              Showing page <span className="font-semibold text-white">{data.page}</span> of{" "}
              <span className="font-semibold text-white">{data.totalPages}</span> ({data.total}{" "}
              total records)
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 transition hover:bg-white/10 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Previous
              </button>
              <button
                disabled={page >= data.totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 transition hover:bg-white/10 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#121212] p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Delete Subscriber</h3>
                <p className="text-xs text-zinc-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300">
              Are you sure you want to remove{" "}
              <strong className="text-white font-mono">{deleteTarget.email}</strong> from the
              VALTORN Private Members database?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500 shadow-lg"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SUBSCRIBER MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#121212] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Add Private Subscriber</h3>
              <button
                onClick={() => setIsAddOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="client@maison.com"
                  value={newEmailInput}
                  onChange={(e) => setNewEmailInput(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Subscription Source
                </label>
                <select
                  value={newSourceInput}
                  onChange={(e) => setNewSourceInput(e.target.value as NewsletterSource)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs text-white focus:border-white focus:outline-none bg-[#121212]"
                >
                  <option value="admin">Admin Dashboard</option>
                  <option value="homepage">Homepage</option>
                  <option value="footer">Footer</option>
                  <option value="popup">Popup</option>
                  <option value="checkout">Checkout</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  disabled={isAdding}
                  onClick={() => setIsAddOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="rounded-xl bg-white px-5 py-2 text-xs font-semibold text-black transition hover:bg-zinc-200"
                >
                  {isAdding ? "Saving..." : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
