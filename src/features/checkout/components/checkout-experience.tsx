"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { startTransition, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Loader2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { publicEnv } from "@/lib/env";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { CheckoutPayload, PaymentMethod } from "@/types";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  email: z.string().email("Enter a valid email."),
  phone: z.string().min(6, "Phone number is required."),
  addressLine1: z.string().min(5, "Address is required."),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required."),
  region: z.string().min(2, "State / region is required."),
  postalCode: z.string().min(2, "Postal code is required."),
  country: z.string().min(2, "Country is required."),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const couponMap: Record<string, number> = {
  ATELIER10: 0.1,
  FIRSTLIGHT: 0.15,
};

export function CheckoutExperience() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const [coupon, setCoupon] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("stripe");
  const [discountRate, setDiscountRate] = useState(0);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      region: "",
      postalCode: "",
      country: paymentMethod === "sslcommerz" ? "Bangladesh" : "United States",
      notes: "",
    },
  });

  const shippingCost = useMemo(() => (subtotal > 300 ? 0 : 25), [subtotal]);
  const discount = useMemo(
    () => Math.round(subtotal * discountRate),
    [discountRate, subtotal],
  );
  const total = useMemo(
    () => Math.max(0, subtotal + shippingCost - discount),
    [discount, shippingCost, subtotal],
  );

  async function onSubmit(values: CheckoutFormValues) {
    if (!items.length) {
      toast.error("Your cart is empty.");
      return;
    }

    setIsRedirecting(true);

    const payload: CheckoutPayload = {
      items,
      shippingAddress: {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2,
        city: values.city,
        region: values.region,
        postalCode: values.postalCode,
        country: values.country,
      },
      paymentMethod,
      subtotal,
      shippingCost,
      discount,
      total,
    };

    try {
      const response = await fetch(`/api/checkout/${paymentMethod}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !result.url) {
        toast.error(result.error ?? "Unable to start checkout.");
        return;
      }

      window.location.href = result.url;
    } catch {
      toast.error("Checkout could not be started.");
    } finally {
      setIsRedirecting(false);
    }
  }

  const applyCoupon = () => {
    const normalizedCoupon = coupon.trim().toUpperCase();
    const matchedDiscount = couponMap[normalizedCoupon];

    if (!matchedDiscount) {
      toast.error("That coupon code is not active.");
      return;
    }

    setDiscountRate(matchedDiscount);
    toast.success(`Coupon ${normalizedCoupon} applied.`);
  };

  if (!items.length) {
    return (
      <div className="rounded-[2.5rem] border border-dashed border-black/15 bg-white px-6 py-20 text-center">
        <p className="text-2xl font-semibold tracking-tight text-black">
          Your cart is waiting for a few pieces.
        </p>
        <p className="mt-3 text-sm leading-7 text-zinc-600">
          Add products to the cart drawer to see the full checkout experience here.
        </p>
        <Button asChild className="mt-8">
          <Link href="/products">Return to collection</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 rounded-[2.5rem] border border-black/10 bg-white p-6 sm:p-8"
      >
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Secure Checkout
          </p>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-black">
            Shipping and payment in one calm, premium flow.
          </h1>
        </div>

        <Tabs
          value={paymentMethod}
          onValueChange={(value) =>
            startTransition(() => setPaymentMethod(value as PaymentMethod))
          }
        >
          <TabsList>
            <TabsTrigger value="stripe">Stripe</TabsTrigger>
            <TabsTrigger value="sslcommerz">SSLCommerz</TabsTrigger>
          </TabsList>

          <TabsContent value="stripe">
            <p className="text-sm leading-7 text-zinc-600">
              Use Stripe for international card payments and a streamlined hosted checkout handoff.
            </p>
          </TabsContent>
          <TabsContent value="sslcommerz">
            <p className="text-sm leading-7 text-zinc-600">
              Use SSLCommerz for Bangladesh-focused payment options and local gateway routing.
            </p>
          </TabsContent>
        </Tabs>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" {...form.register("fullName")} />
            <p className="text-xs text-red-500">{form.formState.errors.fullName?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...form.register("email")} />
            <p className="text-xs text-red-500">{form.formState.errors.email?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...form.register("phone")} />
            <p className="text-xs text-red-500">{form.formState.errors.phone?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...form.register("country")} />
            <p className="text-xs text-red-500">{form.formState.errors.country?.message}</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input id="addressLine1" {...form.register("addressLine1")} />
            <p className="text-xs text-red-500">{form.formState.errors.addressLine1?.message}</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input id="addressLine2" {...form.register("addressLine2")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...form.register("city")} />
            <p className="text-xs text-red-500">{form.formState.errors.city?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">State / Region</Label>
            <Input id="region" {...form.register("region")} />
            <p className="text-xs text-red-500">{form.formState.errors.region?.message}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input id="postalCode" {...form.register("postalCode")} />
            <p className="text-xs text-red-500">{form.formState.errors.postalCode?.message}</p>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Delivery Notes</Label>
            <Textarea
              id="notes"
              placeholder="Building access, preferred timing, or any delivery details."
              {...form.register("notes")}
            />
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={form.formState.isSubmitting || isRedirecting}
        >
          {form.formState.isSubmitting || isRedirecting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LockKeyhole className="mr-2 h-4 w-4" />
          )}
          Continue to {paymentMethod === "stripe" ? "Stripe" : "SSLCommerz"}
        </Button>
      </form>

      <aside className="space-y-6 rounded-[2.5rem] border border-black/10 bg-white p-6 sm:p-8 xl:sticky xl:top-28 xl:self-start">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
            Order Summary
          </p>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="flex items-center justify-between gap-4 rounded-[1.5rem] bg-[#f8f5f0] px-4 py-4"
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-black">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.18em] text-zinc-500">
                    {item.color} / {item.size} / Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-semibold text-black">
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[1.75rem] border border-black/10 bg-[#f8f5f0] p-5">
          <div className="flex gap-3">
            <Input
              value={coupon}
              onChange={(event) => setCoupon(event.target.value)}
              placeholder="Coupon code"
              className="bg-white"
            />
            <Button type="button" variant="secondary" onClick={applyCoupon}>
              Apply
            </Button>
          </div>
          <p className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">
            Try: ATELIER10 or FIRSTLIGHT
          </p>
        </div>

        <div className="space-y-4 rounded-[1.75rem] border border-black/10 bg-[#111111] p-6 text-white">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Subtotal</span>
            <span className="text-white">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Shipping</span>
            <span className="text-white">
              {shippingCost === 0 ? "Free" : formatCurrency(shippingCost)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Discount</span>
            <span className="text-white">
              {discount ? `- ${formatCurrency(discount)}` : "$0"}
            </span>
          </div>
          <div className="border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.24em] text-zinc-500">
                Total
              </span>
              <span className="text-2xl font-semibold tracking-tight text-white">
                {formatCurrency(total)}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm leading-7 text-zinc-600">
          Currency: {publicEnv.currency}. The route handlers are ready for live gateway credentials when you connect your environment variables.
        </p>
      </aside>
    </div>
  );
}
