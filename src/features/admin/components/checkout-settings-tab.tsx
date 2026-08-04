"use client";

import { useState } from "react";
import {
  Banknote,
  CreditCard,
  Percent,
  Save,
  Settings2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CheckoutSettingsTab() {
  const [dhakaShipping, setDhakaShipping] = useState("80");
  const [outsideShipping, setOutsideShipping] = useState("130");
  const [freeThreshold, setFreeThreshold] = useState("5000");
  const [defaultPayment, setDefaultPayment] = useState("cod");
  const [dhakaLeadTime, setDhakaLeadTime] = useState("1–2 Days");
  const [outsideLeadTime, setOutsideLeadTime] = useState("2–4 Days");
  const [vatRate, setVatRate] = useState("0");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("Checkout & Shipping settings saved successfully!");
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-[2.5rem] border border-white/10 bg-[#121212] p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400">
              <Settings2 className="h-4 w-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.28em]">
                System Controls
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#f7f2eb] sm:text-3xl">
              Checkout & Shipping Settings
            </h2>
            <p className="mt-1 text-xs text-[#8d867a]">
              Manage delivery charges, free shipping thresholds, payment ordering, and lead times.
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="h-11 rounded-xl bg-amber-500 text-black hover:bg-amber-400 font-bold text-xs uppercase tracking-wider px-6 shadow-lg shadow-amber-500/20"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Shipping Rates Configuration */}
        <div className="space-y-4 rounded-[2rem] border border-white/10 bg-[#121212] p-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <Truck className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#f7f2eb]">
              Bangladesh Shipping Costs
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#b5a898]">Inside Dhaka Shipping Fee (৳)</Label>
              <Input
                value={dhakaShipping}
                onChange={(e) => setDhakaShipping(e.target.value)}
                className="border-white/10 bg-white/[0.05] text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#b5a898]">Outside Dhaka Shipping Fee (৳)</Label>
              <Input
                value={outsideShipping}
                onChange={(e) => setOutsideShipping(e.target.value)}
                className="border-white/10 bg-white/[0.05] text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#b5a898]">Free Shipping Minimum Order (৳)</Label>
              <Input
                value={freeThreshold}
                onChange={(e) => setFreeThreshold(e.target.value)}
                className="border-white/10 bg-white/[0.05] text-white"
              />
            </div>
          </div>
        </div>

        {/* Payment Methods & Default Selection */}
        <div className="space-y-4 rounded-[2rem] border border-white/10 bg-[#121212] p-6">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <CreditCard className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#f7f2eb]">
              Payment Preferences
            </h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#b5a898]">Default Payment Method</Label>
              <select
                value={defaultPayment}
                onChange={(e) => setDefaultPayment(e.target.value)}
                className="h-10 w-full rounded-xl border border-white/10 bg-[#1a1a1a] px-3 text-xs font-bold text-white outline-none"
              >
                <option value="cod">Cash on Delivery (Recommended)</option>
                <option value="bkash">bKash Mobile Banking</option>
                <option value="nagad">Nagad Mobile Wallet</option>
                <option value="rocket">Rocket DBBL</option>
                <option value="sslcommerz">SSLCommerz Gateway</option>
                <option value="stripe">Stripe International</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#b5a898]">VAT / Tax Rate (%)</Label>
              <div className="relative">
                <Input
                  value={vatRate}
                  onChange={(e) => setVatRate(e.target.value)}
                  className="border-white/10 bg-white/[0.05] text-white pr-8"
                />
                <Percent className="absolute right-3 top-3 h-4 w-4 text-zinc-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Lead Times & Delivery Schedule */}
        <div className="space-y-4 rounded-[2rem] border border-white/10 bg-[#121212] p-6 md:col-span-2">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <Banknote className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#f7f2eb]">
              Delivery Lead Times & Messaging
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#b5a898]">Inside Dhaka Delivery Estimate</Label>
              <Input
                value={dhakaLeadTime}
                onChange={(e) => setDhakaLeadTime(e.target.value)}
                className="border-white/10 bg-white/[0.05] text-white"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-[#b5a898]">Outside Dhaka Delivery Estimate</Label>
              <Input
                value={outsideLeadTime}
                onChange={(e) => setOutsideLeadTime(e.target.value)}
                className="border-white/10 bg-white/[0.05] text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
