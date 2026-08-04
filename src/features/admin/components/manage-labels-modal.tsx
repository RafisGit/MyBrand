"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Minus, Tag } from "lucide-react";
import { toast } from "sonner";

import { bulkUpdateProductLabelsAction } from "@/actions/admin";
import type { CatalogProduct } from "@/types/backend";
import { cn } from "@/lib/utils";
import { PRODUCT_LABELS, type ProductLabelKey } from "@/lib/constants/product-labels";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Types ──────────────────────────────────────────────────────────────────────

type TriState = "on" | "off" | "mixed";

interface LabelToggleState {
  key: ProductLabelKey;
  initial: TriState;
  current: TriState;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function computeInitialState(
  products: CatalogProduct[],
  key: ProductLabelKey,
): TriState {
  if (products.length === 0) return "off";

  const onCount = products.filter((p) => p[key]).length;
  if (onCount === 0) return "off";
  if (onCount === products.length) return "on";
  return "mixed";
}

function cycleTriState(current: TriState): TriState {
  // mixed → on → off → on cycle
  if (current === "mixed") return "on";
  if (current === "on") return "off";
  return "on";
}

function getErrorMessage(error: unknown, defaultMessage = "An error occurred"): string {
  if (!error) return defaultMessage;
  if (typeof window !== "undefined" && error instanceof Event) return defaultMessage;
  if (typeof error === "string") {
    if (error.startsWith("[object ") || error.includes("[object Event]") || error.includes("[object Object]")) {
      return defaultMessage;
    }
    return error;
  }
  if (error instanceof Error) {
    if (error.message.startsWith("[object ") || error.message.includes("[object Event]")) {
      return defaultMessage;
    }
    return error.message;
  }
  return defaultMessage;
}

// ─── Toggle Switch Component ────────────────────────────────────────────────────

function TriStateToggle({
  state,
  onToggle,
  label,
  description,
  toggleColor,
  badgeClassName,
  selectedCount,
  totalCount,
  disabled,
}: {
  state: TriState;
  onToggle: () => void;
  label: string;
  description: string;
  toggleColor: string;
  badgeClassName: string;
  selectedCount: number;
  totalCount: number;
  disabled: boolean;
}) {
  const stateLabel = useMemo(() => {
    if (state === "on") return `Active on all ${totalCount} product${totalCount !== 1 ? "s" : ""}`;
    if (state === "off") return "Disabled";
    const onCount = selectedCount;
    return `Mixed (${onCount} of ${totalCount})`;
  }, [state, selectedCount, totalCount]);

  return (
    <button
      type="button"
      role="switch"
      aria-checked={state === "on" ? true : state === "off" ? false : "mixed"}
      aria-label={`${label}: ${stateLabel}`}
      disabled={disabled}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={cn(
        "group flex w-full items-center justify-between gap-4 rounded-xl border p-3.5 text-left transition-all duration-200 outline-none",
        "focus-visible:ring-2 focus-visible:ring-amber-400/60 focus-visible:ring-offset-1 focus-visible:ring-offset-[#121212]",
        disabled && "opacity-50 pointer-events-none",
        state === "on"
          ? "border-white/20 bg-white/[0.07] shadow-md"
          : state === "mixed"
            ? "border-amber-500/20 bg-amber-500/[0.04]"
            : "border-white/5 bg-white/[0.02] hover:bg-white/[0.04]",
      )}
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2.5">
          <span
            className={cn(
              "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
              badgeClassName,
            )}
          >
            {label}
          </span>
          <span
            className={cn(
              "text-[10px] font-semibold uppercase tracking-wider",
              state === "on"
                ? "text-emerald-400"
                : state === "mixed"
                  ? "text-amber-400"
                  : "text-zinc-500",
            )}
          >
            {stateLabel}
          </span>
        </div>
        <p className="text-[11px] text-[#a79f92] leading-relaxed">{description}</p>
      </div>

      {/* Toggle Track */}
      <div
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out",
          state === "on"
            ? toggleColor
            : state === "mixed"
              ? "bg-amber-500/60"
              : "bg-white/15",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 flex h-4 w-4 items-center justify-center rounded-full bg-white transition-all duration-200 ease-in-out shadow-sm",
            state === "on" && "translate-x-5",
            state === "mixed" && "translate-x-2.5",
          )}
        >
          {state === "on" && <Check className="h-2.5 w-2.5 text-zinc-800" strokeWidth={3} />}
          {state === "mixed" && <Minus className="h-2.5 w-2.5 text-amber-600" strokeWidth={3} />}
        </span>
      </div>
    </button>
  );
}

// ─── Main Modal Component ───────────────────────────────────────────────────────

export function ManageLabelsModal({
  open,
  onOpenChange,
  selectedProducts,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProducts: CatalogProduct[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Build initial label state from selected products
  const initialStates = useMemo(
    () =>
      PRODUCT_LABELS.map((def) => ({
        key: def.key,
        initial: computeInitialState(selectedProducts, def.key),
        current: computeInitialState(selectedProducts, def.key),
      })),
    [selectedProducts],
  );

  const [labelStates, setLabelStates] = useState<LabelToggleState[]>(initialStates);

  // Sync label states when selectedProducts change
  useEffect(() => {
    setLabelStates(initialStates);
  }, [initialStates]);

  // Count how many products have each label ON
  const onCounts = useMemo(() => {
    const map = new Map<ProductLabelKey, number>();
    for (const def of PRODUCT_LABELS) {
      map.set(def.key, selectedProducts.filter((p) => p[def.key]).length);
    }
    return map;
  }, [selectedProducts]);

  const handleToggle = useCallback((key: ProductLabelKey) => {
    setLabelStates((prev) =>
      prev.map((s) =>
        s.key === key ? { ...s, current: cycleTriState(s.current) } : s,
      ),
    );
  }, []);

  // Check if any labels have been changed
  const hasChanges = useMemo(
    () => labelStates.some((s) => s.current !== s.initial),
    [labelStates],
  );

  const changedCount = useMemo(
    () => labelStates.filter((s) => s.current !== s.initial).length,
    [labelStates],
  );

  const handleReset = useCallback(() => {
    setLabelStates(initialStates);
  }, [initialStates]);

  const handleApply = useCallback(() => {
    if (!hasChanges) return;

    const updates: Record<string, boolean> = {};
    for (const state of labelStates) {
      if (state.current !== state.initial && state.current !== "mixed") {
        updates[state.key] = state.current === "on";
      }
    }

    if (Object.keys(updates).length === 0) {
      toast.info("No label changes to apply.");
      return;
    }

    const productIds = selectedProducts.map((p) => p.id);

    startTransition(async () => {
      try {
        await bulkUpdateProductLabelsAction(productIds, updates);
        toast.success(
          `Updated ${Object.keys(updates).length} label(s) across ${productIds.length} product(s).`,
        );
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to update labels."));
      }
    });
  }, [hasChanges, labelStates, selectedProducts, startTransition, onOpenChange, router]);

  // Keyboard: Escape to close
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-hidden border-white/10 bg-[#0f0f0f] p-0 shadow-2xl sm:max-w-lg",
          "rounded-2xl",
        )}
      >
        <DialogHeader className="border-b border-white/10 px-5 pt-5 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25">
              <Tag className="h-4.5 w-4.5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-[#f7f2eb]">
                Manage Labels
              </DialogTitle>
              <DialogDescription className="text-xs text-[#8d867a]">
                {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Label Toggles */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] px-5 py-4">
          <div className="space-y-2.5">
            {PRODUCT_LABELS.map((def) => {
              const state = labelStates.find((s) => s.key === def.key);
              if (!state) return null;

              return (
                <TriStateToggle
                  key={def.key}
                  state={state.current}
                  onToggle={() => handleToggle(def.key)}
                  label={def.label}
                  description={def.description}
                  toggleColor={def.toggleColor}
                  badgeClassName={def.badgeClassName}
                  selectedCount={onCounts.get(def.key) ?? 0}
                  totalCount={selectedProducts.length}
                  disabled={isPending}
                />
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-white/10 px-5 py-4 flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-500">
            {hasChanges ? (
              <span className="text-amber-400 font-medium">
                {changedCount} label{changedCount !== 1 ? "s" : ""} changed
              </span>
            ) : (
              <span>No changes</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={isPending}
                className="h-8 text-xs text-zinc-400 hover:text-white"
              >
                Reset
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="h-8 text-xs text-zinc-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={!hasChanges || isPending}
              className={cn(
                "h-8 text-xs font-bold transition-all",
                hasChanges
                  ? "bg-amber-500 text-black hover:bg-amber-400 shadow-lg shadow-amber-500/20"
                  : "bg-white/10 text-zinc-500",
              )}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-1.5 h-3.5 w-3.5" />
                  Apply Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
