"use client";

import React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useNewsletter } from "@/hooks/use-newsletter";
import { cn } from "@/lib/utils";

interface LuxuryNewsletterSectionProps {
  source?: "homepage" | "footer" | "popup" | "checkout" | "admin" | "other";
  className?: string;
}

export function LuxuryNewsletterSection({
  source = "homepage",
  className,
}: LuxuryNewsletterSectionProps) {
  const { form, isSubmitting, isSuccess, handleSubmit } = useNewsletter({ source });

  const emailError = form.formState.errors.email?.message;

  return (
    <section
      aria-labelledby="newsletter-heading"
      className={cn(
        "relative overflow-hidden rounded-[1.8rem] sm:rounded-[2.6rem] border border-white/8 bg-[#121212] text-white py-12 sm:py-28 px-4 sm:px-6 lg:px-8 shadow-[0_45px_140px_-70px_rgba(0,0,0,1)]",
        className
      )}
    >
      {/* Premium Hero / Featured Drop Textured Dark Background Image */}
      <Image
        src="https://images.pexels.com/photos/4862951/pexels-photo-4862951.jpeg?cs=srgb&dl=pexels-karolina-grabowska-4862951.jpg&fm=jpg"
        alt="Featured dark fabric texture background"
        fill
        className="object-cover object-center opacity-40 pointer-events-none"
        sizes="100vw"
      />

      {/* Hero Section Gradient Overlays for dark contrast & luxury warmth */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(205,183,158,0.14),transparent_34%),linear-gradient(180deg,rgba(18,18,18,0.85)_0%,rgba(6,6,6,0.94)_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.06),transparent_24%)]"
        aria-hidden="true"
      />

      {/* Main Newsletter Content Layer */}
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        {/* Animated Main Container */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Small label: PRIVATE MEMBERS */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-zinc-400" />
            <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.25em] text-zinc-300 uppercase">
              PRIVATE MEMBERS
            </span>
          </div>

          {/* Large heading */}
          <h2
            id="newsletter-heading"
            className="text-2xl font-light tracking-tight text-white sm:text-5xl lg:text-6xl uppercase font-serif leading-[1.15]"
          >
            Join the Private List for{" "}
            <span className="block italic text-zinc-300 font-normal">Capsule Drops,</span>
            <span className="block">Early Access,</span>
            <span className="block text-zinc-400 font-sans font-light text-xl sm:text-4xl lg:text-5xl mt-1.5 tracking-normal lowercase first-letter:uppercase">
              and exclusive releases.
            </span>
          </h2>

          {/* Short description */}
          <p className="mx-auto max-w-xl text-xs sm:text-lg text-zinc-400 font-light leading-relaxed">
            Be the first to discover limited collections, exclusive offers, editorial stories, and members-only product launches.
          </p>

          {/* Form / Success State Container */}
          <div className="mx-auto mt-10 max-w-md sm:max-w-lg">
            <AnimatePresence mode="wait">
              {isSuccess ? (
                /* SUCCESS STATE ANIMATION */
                <motion.div
                  key="success-message"
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  role="status"
                  aria-live="polite"
                  className="rounded-3xl border border-white/15 bg-white/[0.04] p-8 backdrop-blur-xl text-center shadow-2xl space-y-4"
                >
                  {/* Animated Path-Drawing Checkmark */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-lg"
                  >
                    <svg
                      className="h-7 w-7 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                    >
                      <motion.path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                      />
                    </svg>
                  </motion.div>

                  <h3 className="text-xl font-medium text-white tracking-wide">
                    ✓ Welcome to the Private List.
                  </h3>
                  <p className="text-sm text-zinc-400 font-light">
                    We&apos;ll notify you before everyone else.
                  </p>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 uppercase tracking-widest">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Priority Access Confirmed
                    </span>
                  </div>
                </motion.div>
              ) : (
                /* SUBSCRIPTION FORM */
                <form
                  key="subscription-form"
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-3"
                >
                  {/* Honeypot field for bot trap */}
                  <input
                    type="text"
                    {...form.register("honeypot")}
                    className="hidden"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />

                  <div className="relative flex flex-col sm:flex-row items-center gap-3">
                    {/* Large Email Input */}
                    <div className="relative w-full flex-1">
                      <label htmlFor="newsletter-email" className="sr-only">
                        Enter your email address
                      </label>
                      <input
                        id="newsletter-email"
                        type="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        aria-invalid={Boolean(emailError)}
                        aria-describedby={emailError ? "email-error" : undefined}
                        {...form.register("email")}
                        className={cn(
                          "w-full rounded-full border border-white/15 bg-white/[0.05] px-6 py-4 text-base text-white placeholder-zinc-500 backdrop-blur-md transition-all duration-300",
                          "focus:border-white focus:bg-white/[0.08] focus:outline-none focus:ring-4 focus:ring-white/10",
                          "hover:border-white/30",
                          emailError && "border-red-500/80 focus:border-red-500 focus:ring-red-500/20"
                        )}
                      />
                    </div>

                    {/* Large rounded Subscribe button */}
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className={cn(
                        "group w-full sm:w-auto min-w-[140px] flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-medium text-black transition-all duration-300 shadow-lg",
                        "hover:bg-zinc-200 hover:shadow-white/10 hover:shadow-xl",
                        "focus:outline-none focus:ring-4 focus:ring-white/30",
                        "disabled:opacity-60 disabled:cursor-not-allowed"
                      )}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="h-4 w-4 animate-spin text-black"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Joining...
                        </span>
                      ) : (
                        <>
                          <span>Join Now</span>
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Elegant Inline Error Messages */}
                  <AnimatePresence>
                    {emailError && (
                      <motion.p
                        id="email-error"
                        role="alert"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="text-left text-sm font-medium text-red-400 pl-4 pt-1"
                      >
                        {emailError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>
              )}
            </AnimatePresence>
          </div>

          {/* Luxury reassuring copy */}
          <div className="pt-6 text-xs text-zinc-500 font-light flex items-center justify-center gap-4 flex-wrap">
            <span>No spam</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>Only meaningful updates</span>
            <span className="h-1 w-1 rounded-full bg-zinc-700" />
            <span>Unsubscribe anytime</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
