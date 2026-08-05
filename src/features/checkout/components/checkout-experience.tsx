"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronRight,
  Clock,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Package,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Tag,
  Truck,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { formatCurrency } from "@/lib/utils";
import {
  BANGLADESH_DIVISIONS,
  getDistrictsForDivision,
  getUpazilasForDistrict,
  lookupPostalCode,
} from "@/lib/constants/bangladesh-locations";
import { useCartStore } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CheckoutPayload, PaymentMethod } from "@/types";

// ─── Form Validation Schema ───────────────────────────────────────────────────

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required."),
  phone: z
    .string()
    .min(11, "Valid Bangladeshi mobile number required (e.g. 01712345678).")
    .max(15, "Phone number is too long."),
  email: z.string().email("Enter a valid email address.").or(z.literal("")),
  division: z.string().min(1, "Select your Division."),
  district: z.string().min(1, "Select your District."),
  upazila: z.string().min(1, "Select your Upazila / Thana."),
  area: z.string().min(3, "Enter your House / Road / Area details."),
  fullAddress: z.string().min(5, "Enter complete delivery address."),
  landmark: z.string().optional(),
  postalCode: z.string().min(2, "Postal code is required."),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

// ─── Available Offers & Coupons ───────────────────────────────────────────────

interface CouponOffer {
  code: string;
  type: "percent" | "fixed" | "freeship";
  value: number;
  label: string;
  description: string;
}

const AVAILABLE_OFFERS: CouponOffer[] = [
  {
    code: "WELCOME10",
    type: "percent",
    value: 0.1,
    label: "10% OFF",
    description: "10% discount on your first VALTORN piece",
  },
  {
    code: "FIRSTORDER",
    type: "percent",
    value: 0.15,
    label: "15% OFF",
    description: "15% discount for new customers",
  },
  {
    code: "FREESHIP",
    type: "freeship",
    value: 1,
    label: "FREE SHIPPING",
    description: "Complimentary delivery anywhere in Bangladesh",
  },
  {
    code: "EID2026",
    type: "fixed",
    value: 200,
    label: "৳200 OFF",
    description: "Flat ৳200 discount on luxury streetwear",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export function CheckoutExperience() {
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponOffer | null>(null);

  const [isRedirecting, setIsRedirecting] = useState(false);

  // Form initialization
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      division: "Dhaka",
      district: "Dhaka",
      upazila: "Dhanmondi",
      area: "",
      fullAddress: "",
      landmark: "",
      postalCode: "1209",
      notes: "",
    },
  });

  const selectedDivision = form.watch("division");
  const selectedDistrict = form.watch("district");
  const selectedUpazila = form.watch("upazila");
  const currentArea = form.watch("area");
  const currentLandmark = form.watch("landmark");

  // Dynamic dropdown lists
  const districts = useMemo(
    () => getDistrictsForDivision(selectedDivision),
    [selectedDivision],
  );

  const upazilas = useMemo(
    () => getUpazilasForDistrict(selectedDivision, selectedDistrict),
    [selectedDivision, selectedDistrict],
  );

  // Reset district & upazila when division changes
  useEffect(() => {
    const validDistricts = getDistrictsForDivision(selectedDivision);
    if (!validDistricts.includes(selectedDistrict)) {
      const firstDistrict = validDistricts[0] ?? "";
      form.setValue("district", firstDistrict);
      const validUpazilas = getUpazilasForDistrict(selectedDivision, firstDistrict);
      const firstUpazila = validUpazilas[0] ?? "";
      form.setValue("upazila", firstUpazila);
      form.setValue("postalCode", lookupPostalCode(firstUpazila));
    }
  }, [selectedDivision, selectedDistrict, form]);

  // Reset upazila & postal code when district changes
  useEffect(() => {
    const validUpazilas = getUpazilasForDistrict(selectedDivision, selectedDistrict);
    if (!validUpazilas.includes(selectedUpazila)) {
      const firstUpazila = validUpazilas[0] ?? "";
      form.setValue("upazila", firstUpazila);
      form.setValue("postalCode", lookupPostalCode(firstUpazila));
    }
  }, [selectedDivision, selectedDistrict, selectedUpazila, form]);

  // Auto-fill postal code when upazila changes
  useEffect(() => {
    if (selectedUpazila) {
      form.setValue("postalCode", lookupPostalCode(selectedUpazila));
    }
  }, [selectedUpazila, form]);

  // Auto-compose full address text
  useEffect(() => {
    const parts = [
      currentArea,
      selectedUpazila,
      selectedDistrict,
      selectedDivision,
      currentLandmark ? `Landmark: ${currentLandmark}` : "",
    ].filter(Boolean);

    if (parts.length > 0) {
      form.setValue("fullAddress", parts.join(", "));
    }
  }, [currentArea, selectedUpazila, selectedDistrict, selectedDivision, currentLandmark, form]);

  // ─── Shipping Calculation ───────────────────────────────────────────────────

  const isDhakaDivision = selectedDivision.toLowerCase() === "dhaka";
  const baseShippingCost = isDhakaDivision ? 80 : 130;
  const isFreeShippingByCoupon = appliedCoupon?.type === "freeship";
  const isFreeShippingThreshold = subtotal >= 5000;

  const shippingCost = useMemo(() => {
    if (isFreeShippingByCoupon || isFreeShippingThreshold) return 0;
    return baseShippingCost;
  }, [baseShippingCost, isFreeShippingByCoupon, isFreeShippingThreshold]);

  // ─── Discount Calculation ───────────────────────────────────────────────────

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === "percent") {
      return Math.round(subtotal * appliedCoupon.value);
    }
    if (appliedCoupon.type === "fixed") {
      return Math.min(subtotal, appliedCoupon.value);
    }
    return 0;
  }, [appliedCoupon, subtotal]);

  const total = useMemo(
    () => Math.max(0, subtotal + shippingCost - discountAmount),
    [subtotal, shippingCost, discountAmount],
  );

  // ─── Coupon Actions ─────────────────────────────────────────────────────────

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply ?? couponCode).trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code.");
      return;
    }

    const matched = AVAILABLE_OFFERS.find((o) => o.code === code);
    if (!matched) {
      toast.error("Invalid coupon code. Try WELCOME10 or EID2026.");
      return;
    }

    setAppliedCoupon(matched);
    setCouponCode(matched.code);
    toast.success(`Offer ${matched.code} applied successfully!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon code removed.");
  };

  // ─── Submit Order ────────────────────────────────────────────────────────────

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
        email: values.email || `${values.phone}@valtorn.customer`,
        phone: values.phone,
        addressLine1: values.fullAddress || values.area,
        addressLine2: values.landmark ?? "",
        city: values.district,
        region: values.division,
        postalCode: values.postalCode,
        country: "Bangladesh",
        division: values.division,
        district: values.district,
        upazila: values.upazila,
        area: values.area,
        landmark: values.landmark,
        fullAddress: values.fullAddress,
      },
      paymentMethod,
      subtotal,
      shippingCost,
      discount: discountAmount,
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
        toast.error(result.error ?? "Unable to process order. Please try again.");
        return;
      }

      window.location.href = result.url;
    } catch {
      toast.error("Checkout process failed. Please check connection.");
    } finally {
      setIsRedirecting(false);
    }
  }

  if (!items.length) {
    return (
      <div className="rounded-[2.5rem] border border-dashed border-black/15 bg-white px-6 py-20 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <Package className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-black sm:text-3xl">
          Your cart is currently empty.
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 max-w-md mx-auto">
          Explore our heavyweight streetwear collections and add luxury items to start your checkout.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-full px-8 font-semibold">
          <Link href="/products">
            Browse VALTORN Pieces <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative pb-24 lg:pb-0">
      {/* ─── Top Trust Banner ───────────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-[#171411] via-[#1c1815] to-[#171411] px-5 py-3.5 text-xs text-[#d8c0a1]">
        <div className="flex items-center gap-2 font-medium">
          <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0" />
          <span>VALTORN Direct Guarantee: 100% Original Heavyweight Streetwear</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold tracking-wider text-amber-300/80">
          <span className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-amber-400" /> Fast Delivery (2-4 Days)
          </span>
          <span className="flex items-center gap-1">
            <RotateCcw className="h-3.5 w-3.5 text-amber-400" /> Easy 7-Day Returns
          </span>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        {/* ─── LEFT COLUMN: Form & Payment Methods ────────────────────────────── */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 rounded-[2.5rem] border border-black/10 bg-white p-5 sm:p-8 shadow-sm"
        >
          {/* Header */}
          <div className="space-y-2 border-b border-zinc-100 pb-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
                <BadgeCheck className="h-3.5 w-3.5 text-amber-600" />
                Bangladesh Checkout (BDT ৳)
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-black sm:text-3xl">
              Express Delivery & Payment
            </h1>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Complete your order with Cash on Delivery or Mobile Banking in a secure flow.
            </p>
          </div>

          {/* Section 1: Customer Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
              <User className="h-4 w-4 text-black" />
              <span>1. Customer Details</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="fullName" className="text-xs font-semibold text-zinc-700">
                  Full Name <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="fullName"
                    placeholder="e.g. Tanvir Ahmed"
                    className="pl-10 h-10 rounded-xl text-xs sm:text-sm"
                    {...form.register("fullName")}
                  />
                </div>
                {form.formState.errors.fullName && (
                  <p className="text-[11px] text-rose-500 font-medium">{form.formState.errors.fullName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-zinc-700">
                  Mobile Number <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="phone"
                    placeholder="01712345678"
                    className="pl-10 h-10 rounded-xl text-xs sm:text-sm font-medium"
                    {...form.register("phone")}
                  />
                </div>
                {form.formState.errors.phone && (
                  <p className="text-[11px] text-rose-500 font-medium">{form.formState.errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-zinc-700">
                  Email Address <span className="text-zinc-400 font-normal">(Optional)</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="tanvir@example.com"
                    className="pl-10 h-10 rounded-xl text-xs sm:text-sm"
                    {...form.register("email")}
                  />
                </div>
                {form.formState.errors.email && (
                  <p className="text-[11px] text-rose-500 font-medium">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Address */}
          <div className="space-y-4 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
                <MapPin className="h-4 w-4 text-black" />
                <span>2. Delivery Address</span>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                {isDhakaDivision ? "Inside Dhaka (৳80)" : "Outside Dhaka (৳130)"}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Division Dropdown */}
              <div className="space-y-1.5">
                <Label htmlFor="division" className="text-xs font-semibold text-zinc-700">
                  Division <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="division"
                  className="h-12 sm:h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium outline-none focus:border-black transition-all appearance-none cursor-pointer"
                  {...form.register("division")}
                >
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div.name} value={div.name}>
                      {div.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.division && (
                  <p className="text-[11px] text-rose-500 font-medium">{form.formState.errors.division.message}</p>
                )}
              </div>

              {/* District Dropdown */}
              <div className="space-y-1.5">
                <Label htmlFor="district" className="text-xs font-semibold text-zinc-700">
                  District <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="district"
                  className="h-12 sm:h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium outline-none focus:border-black transition-all appearance-none cursor-pointer"
                  {...form.register("district")}
                >
                  {districts.map((dst) => (
                    <option key={dst} value={dst}>
                      {dst}
                    </option>
                  ))}
                </select>
                {form.formState.errors.district && (
                  <p className="text-[11px] text-rose-500 font-medium">{form.formState.errors.district.message}</p>
                )}
              </div>

              {/* Upazila / Thana Dropdown */}
              <div className="space-y-1.5">
                <Label htmlFor="upazila" className="text-xs font-semibold text-zinc-700">
                  Upazila / Thana <span className="text-rose-500">*</span>
                </Label>
                <select
                  id="upazila"
                  className="h-12 sm:h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium outline-none focus:border-black transition-all appearance-none cursor-pointer"
                  {...form.register("upazila")}
                >
                  {upazilas.map((upz) => (
                    <option key={upz} value={upz}>
                      {upz}
                    </option>
                  ))}
                </select>
                {form.formState.errors.upazila && (
                  <p className="text-[11px] text-rose-500 font-medium">{form.formState.errors.upazila.message}</p>
                )}
              </div>

              {/* Area / Road / House */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="area" className="text-xs font-semibold text-zinc-700">
                  House / Road / Area / Sector <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="area"
                  placeholder="e.g. House 42, Road 11, Block D"
                  className="h-12 sm:h-10 rounded-xl text-sm"
                  {...form.register("area")}
                />
                {form.formState.errors.area && (
                  <p className="text-[11px] text-rose-500 font-medium">{form.formState.errors.area.message}</p>
                )}
              </div>

              {/* Postal Code */}
              <div className="space-y-1.5">
                <Label htmlFor="postalCode" className="text-xs font-semibold text-zinc-700">
                  Postal Code <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="postalCode"
                  placeholder="1209"
                  className="h-12 sm:h-10 rounded-xl text-sm font-medium"
                  {...form.register("postalCode")}
                />
                {form.formState.errors.postalCode && (
                  <p className="text-[11px] text-rose-500 font-medium">{form.formState.errors.postalCode.message}</p>
                )}
              </div>

              {/* Full Address Textarea */}
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="fullAddress" className="text-xs font-semibold text-zinc-700">
                  Full Delivery Address <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="fullAddress"
                  rows={2}
                  placeholder="Detailed address for courier delivery rider"
                  className="rounded-xl text-sm min-h-[52px]"
                  {...form.register("fullAddress")}
                />
                {form.formState.errors.fullAddress && (
                  <p className="text-[11px] text-rose-500 font-medium">{form.formState.errors.fullAddress.message}</p>
                )}
              </div>

              {/* Landmark (Optional) */}
              <div className="space-y-1.5 sm:col-span-3">
                <Label htmlFor="landmark" className="text-xs font-semibold text-zinc-700">
                  Landmark / Special Instructions <span className="text-zinc-400 font-normal">(Optional)</span>
                </Label>
                <Input
                  id="landmark"
                  placeholder="e.g. Near Bashundhara Gate / Opposite Jamuna Future Park"
                  className="h-12 sm:h-10 rounded-xl text-sm"
                  {...form.register("landmark")}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Payment Options */}
          <div className="space-y-4 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-600">
                <Wallet className="h-4 w-4 text-black" />
                <span>3. Preferred Payment Method</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* 1. Cash on Delivery (Recommended & Default) */}
              <label
                onClick={() => setPaymentMethod("cod")}
                className={`group relative flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all duration-200 ${
                  paymentMethod === "cod"
                    ? "border-amber-500 bg-amber-500/[0.04] shadow-md ring-1 ring-amber-500"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs transition-colors ${
                      paymentMethod === "cod"
                        ? "bg-amber-500 text-black shadow"
                        : "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    COD
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-black">Cash on Delivery</span>
                      <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wider">
                        Recommended
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Pay when your order is delivered to your doorstep. No prepayment required.
                    </p>
                  </div>
                </div>
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                    paymentMethod === "cod"
                      ? "border-amber-600 bg-amber-600 text-white"
                      : "border-zinc-300 bg-white"
                  }`}
                >
                  {paymentMethod === "cod" && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </label>

              {/* 2. bKash */}
              <label
                onClick={() => setPaymentMethod("bkash")}
                className={`group relative flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all duration-200 ${
                  paymentMethod === "bkash"
                    ? "border-[#D12053] bg-[#D12053]/[0.04] shadow-md ring-1 ring-[#D12053]"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D12053] font-bold text-white shadow text-xs">
                    bKash
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-black">bKash Mobile Banking</span>
                      <span className="rounded-full bg-[#D12053]/10 text-[#D12053] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Instant Confirmation
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Secure instant payment using your bKash wallet or QR code.
                    </p>
                  </div>
                </div>
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                    paymentMethod === "bkash"
                      ? "border-[#D12053] bg-[#D12053] text-white"
                      : "border-zinc-300 bg-white"
                  }`}
                >
                  {paymentMethod === "bkash" && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </label>

              {/* 3. Nagad */}
              <label
                onClick={() => setPaymentMethod("nagad")}
                className={`group relative flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all duration-200 ${
                  paymentMethod === "nagad"
                    ? "border-[#F7931E] bg-[#F7931E]/[0.04] shadow-md ring-1 ring-[#F7931E]"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F7931E] font-bold text-white shadow text-xs">
                    Nagad
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-black">Nagad Mobile Wallet</span>
                      <span className="rounded-full bg-[#F7931E]/10 text-[#e07f0d] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Zero Convenience Fee
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Pay quickly with Nagad app or USSD gateway.
                    </p>
                  </div>
                </div>
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                    paymentMethod === "nagad"
                      ? "border-[#F7931E] bg-[#F7931E] text-white"
                      : "border-zinc-300 bg-white"
                  }`}
                >
                  {paymentMethod === "nagad" && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </label>

              {/* 4. Rocket */}
              <label
                onClick={() => setPaymentMethod("rocket")}
                className={`group relative flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all duration-200 ${
                  paymentMethod === "rocket"
                    ? "border-[#8C3494] bg-[#8C3494]/[0.04] shadow-md ring-1 ring-[#8C3494]"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#8C3494] font-bold text-white shadow text-xs">
                    Rocket
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-black">DBBL Rocket</span>
                      <span className="rounded-full bg-[#8C3494]/10 text-[#8C3494] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                        Dutch-Bangla Gateway
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Pay directly through Dutch-Bangla Bank Rocket mobile banking.
                    </p>
                  </div>
                </div>
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                    paymentMethod === "rocket"
                      ? "border-[#8C3494] bg-[#8C3494] text-white"
                      : "border-zinc-300 bg-white"
                  }`}
                >
                  {paymentMethod === "rocket" && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </label>

              {/* 5. SSLCommerz */}
              <label
                onClick={() => setPaymentMethod("sslcommerz")}
                className={`group relative flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all duration-200 ${
                  paymentMethod === "sslcommerz"
                    ? "border-sky-600 bg-sky-600/[0.04] shadow-md ring-1 ring-sky-600"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 font-bold text-white shadow text-[10px] uppercase tracking-wider">
                    Cards
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-black">SSLCommerz Payment Gateway</span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      Supports Visa, Mastercard, AMEX, bKash, Nagad, Rocket & Internet Banking.
                    </p>
                  </div>
                </div>
                <div
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                    paymentMethod === "sslcommerz"
                      ? "border-sky-600 bg-sky-600 text-white"
                      : "border-zinc-300 bg-white"
                  }`}
                >
                  {paymentMethod === "sslcommerz" && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
              </label>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              className="w-full h-14 rounded-2xl bg-black text-white hover:bg-zinc-800 text-base font-bold tracking-wide shadow-xl transition-all"
              disabled={form.formState.isSubmitting || isRedirecting}
            >
              {form.formState.isSubmitting || isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  <LockKeyhole className="mr-2.5 h-5 w-5 text-amber-400" />
                  Confirm Order ({formatCurrency(total)})
                </>
              )}
            </Button>
            <p className="mt-2 text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1">
              <LockKeyhole className="h-3 w-3 text-zinc-400" /> Encrypted 256-Bit SSL Checkout Connection
            </p>
          </div>
        </form>

        {/* ─── RIGHT COLUMN: Order Summary, Coupons & Timeline ──────────────────── */}
        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          {/* Order Items Summary */}
          <div className="space-y-5 rounded-[2.5rem] border border-black/10 bg-white p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-black" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black">
                  Order Summary
                </h3>
              </div>
              <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-bold text-zinc-700">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {/* Items List */}
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-[#f9f7f4] p-3.5 transition-all hover:bg-[#f3efe8]"
                >
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-zinc-200 border border-black/5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-black line-clamp-1">
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-zinc-500 font-medium">
                        {item.color} / {item.size} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-black shrink-0">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            {/* Coupons & Promo Codes */}
            <div className="rounded-2xl border border-zinc-200 bg-[#f9f7f4] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-amber-600" /> Coupon / Promo Code
                </span>
                {appliedCoupon && (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] font-bold text-rose-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="flex gap-2">
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter promo code"
                  className="h-9 rounded-xl bg-white text-xs font-medium uppercase tracking-wider uppercase placeholder:normal-case"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleApplyCoupon()}
                  className="h-9 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-bold px-4 shrink-0"
                >
                  Apply
                </Button>
              </div>

              {/* One-Click Available Offers */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-amber-500" /> Available Offers (Click to apply):
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {AVAILABLE_OFFERS.map((offer) => {
                    const isSelected = appliedCoupon?.code === offer.code;
                    return (
                      <button
                        key={offer.code}
                        type="button"
                        onClick={() => handleApplyCoupon(offer.code)}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] font-bold transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-500 text-black shadow-sm"
                            : "border-zinc-200 bg-white text-zinc-700 hover:border-amber-400 hover:bg-amber-50"
                        }`}
                      >
                        <span>{offer.code}</span>
                        <span className="opacity-75">({offer.label})</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Detailed Totals Box */}
            <div className="space-y-3 rounded-2xl border border-black/10 bg-[#121212] p-5 text-white shadow-xl">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>Subtotal</span>
                <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  Shipping Fee ({isDhakaDivision ? "Dhaka" : "Outside Dhaka"})
                </span>
                <span className="font-semibold text-white">
                  {shippingCost === 0 ? (
                    <span className="text-emerald-400 font-bold">FREE</span>
                  ) : (
                    formatCurrency(shippingCost)
                  )}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-xs text-emerald-400">
                  <span>Promo Discount ({appliedCoupon?.code})</span>
                  <span className="font-bold">- {formatCurrency(discountAmount)}</span>
                </div>
              )}

              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 block">
                      Grand Total
                    </span>
                    <span className="text-[10px] text-zinc-500">Includes all applicable taxes & shipping</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold tracking-tight text-white block">
                      {formatCurrency(total)}
                    </span>
                    {discountAmount > 0 && (
                      <span className="inline-block rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 mt-0.5">
                        You save {formatCurrency(discountAmount)}!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Delivery Note */}
            <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-3.5 text-xs text-amber-900">
              <Clock className="h-5 w-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold">Estimated Delivery Time</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  {isDhakaDivision ? "1–2 Business Days (Inside Dhaka Express)" : "2–4 Business Days (Outside Dhaka Courier)"}
                </p>
              </div>
            </div>
          </div>

          {/* Order Timeline Widget */}
          <div className="space-y-4 rounded-[2.5rem] border border-black/10 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Truck className="h-4 w-4 text-black" />
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-black">
                Delivery Timeline Tracker
              </h4>
            </div>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200">
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white text-[10px] font-bold">
                  1
                </div>
                <div>
                  <p className="text-xs font-bold text-black">Order Placed</p>
                  <p className="text-[11px] text-zinc-500">Instant confirmation via SMS / Email</p>
                </div>
              </div>

              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 text-[10px] font-bold">
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-700">Packed in Studio</p>
                  <p className="text-[11px] text-zinc-500">Quality check & luxury custom packaging</p>
                </div>
              </div>

              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 text-[10px] font-bold">
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-700">Out for Delivery</p>
                  <p className="text-[11px] text-zinc-500">Handed to courier rider in your area</p>
                </div>
              </div>

              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 text-[10px] font-bold">
                  4
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-700">Doorstep Delivery</p>
                  <p className="text-[11px] text-zinc-500">Inspect parcel & pay cash or mobile wallet</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* ─── STICKY MOBILE BOTTOM BAR ─────────────────────────────────────────── */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 p-3.5 backdrop-blur-md lg:hidden shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold block">
              Total ({items.length} items)
            </span>
            <span className="text-xl font-bold tracking-tight text-black">
              {formatCurrency(total)}
            </span>
          </div>
          <Button
            type="button"
            onClick={() => {
              const el = document.getElementById("fullName");
              if (el) el.focus();
              form.handleSubmit(onSubmit)();
            }}
            disabled={form.formState.isSubmitting || isRedirecting}
            className="h-12 rounded-xl bg-black text-white px-6 font-bold text-xs uppercase tracking-wider shadow-lg"
          >
            {form.formState.isSubmitting || isRedirecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Confirm Order <ChevronRight className="ml-1 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
