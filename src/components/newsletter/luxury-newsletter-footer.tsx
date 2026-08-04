"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useNewsletter } from "@/hooks/use-newsletter";
import { cn } from "@/lib/utils";

export function LuxuryNewsletterFooter() {
  const { form, isSubmitting, isSuccess, handleSubmit } = useNewsletter({ source: "footer" });
  const emailError = form.formState.errors.email?.message;

  return (
    <div className="space-y-4 max-w-xl">
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-white backdrop-blur-md"
          >
            <CheckCircle2 className="h-6 w-6 text-emerald-400 shrink-0" />
            <div>
              <p className="text-sm font-medium">✓ Welcome to the Private List.</p>
              <p className="text-xs text-zinc-400">We&apos;ll notify you before everyone else.</p>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-2">
            <input
              type="text"
              {...form.register("honeypot")}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="email"
                  placeholder="Enter your email"
                  aria-invalid={Boolean(emailError)}
                  {...form.register("email")}
                  className={cn(
                    "h-[52px] w-full rounded-[1.3rem] border border-white/15 bg-white/5 px-5 text-sm text-white placeholder-zinc-500 backdrop-blur-md transition-all duration-300",
                    "focus:border-white focus:outline-none focus:ring-2 focus:ring-white/20",
                    emailError && "border-red-500/80 focus:border-red-500"
                  )}
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="h-[52px] w-full sm:w-auto px-7 rounded-[1.3rem] bg-white text-black font-medium text-sm flex items-center justify-center gap-2 transition hover:bg-zinc-200 disabled:opacity-60 shrink-0"
              >
                {isSubmitting ? (
                  "Subscribing..."
                ) : (
                  <>
                    <span>Join Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </motion.button>
            </div>

            {emailError && (
              <p className="text-xs text-red-400 pl-2 pt-1 font-medium">{emailError}</p>
            )}
          </form>
        )}
      </AnimatePresence>
    </div>
  );
}
