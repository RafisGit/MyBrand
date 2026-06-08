"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { hasSupabasePublicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type AuthMode = "login" | "register" | "reset";

type AuthFormValues = {
  confirmPassword: string;
  email: string;
  name: string;
  password: string;
  rememberMe: boolean;
};

const rememberedEmailKey = "valtorn-remembered-email";

const modeCopy: Record<
  AuthMode,
  {
    eyebrow: string;
    heading: string;
    description: string;
    submitLabel: string;
  }
> = {
  login: {
    eyebrow: "Secure Access",
    heading: "Enter the VALTORN account space.",
    description:
      "Sign in to manage your orders, saved details, and private drop access with a clean luxury flow.",
    submitLabel: "Sign In",
  },
  register: {
    eyebrow: "Create Account",
    heading: "Join the collection before the next drop lands.",
    description:
      "Create a customer account for faster checkout, saved details, and a cleaner shopping experience.",
    submitLabel: "Create Account",
  },
  reset: {
    eyebrow: "Password Reset",
    heading: "Reset your access securely.",
    description:
      "We will send a secure recovery link through Supabase so you can set a fresh password safely.",
    submitLabel: "Send Reset Link",
  },
};

function getSchema(mode: AuthMode) {
  return z
    .object({
      confirmPassword: z.string(),
      email: z.string().email("Enter a valid email address."),
      name: z.string(),
      password: z.string(),
      rememberMe: z.boolean(),
    })
    .superRefine((values, context) => {
      if (mode === "register" && values.name.trim().length < 2) {
        context.addIssue({
          code: "custom",
          message: "Please enter your full name.",
          path: ["name"],
        });
      }

      if (mode !== "reset") {
        if (values.password.length < 8) {
          context.addIssue({
            code: "custom",
            message: "Password must be at least 8 characters.",
            path: ["password"],
          });
        }

        if (!/[a-zA-Z]/.test(values.password)) {
          context.addIssue({
            code: "custom",
            message: "Password must include a letter.",
            path: ["password"],
          });
        }

        if (!/[0-9]/.test(values.password)) {
          context.addIssue({
            code: "custom",
            message: "Password must include a number.",
            path: ["password"],
          });
        }
      }

      if (mode === "register" && values.confirmPassword.length < 8) {
        context.addIssue({
          code: "custom",
          message: "Please confirm your password.",
          path: ["confirmPassword"],
        });
      }

      if (mode === "register" && values.password !== values.confirmPassword) {
        context.addIssue({
          code: "custom",
          message: "Passwords do not match.",
          path: ["confirmPassword"],
        });
      }
    });
}

export function AuthExperience({
  compact = false,
  defaultMode = "login",
  nextPath = "/account",
  onSuccess,
}: {
  compact?: boolean;
  defaultMode?: AuthMode;
  nextPath?: string;
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [isLoading, setIsLoading] = useState(false);
  const schema = useMemo(() => getSchema(mode), [mode]);
  const copy = modeCopy[mode];

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      confirmPassword: "",
      email: "",
      name: "",
      password: "",
      rememberMe: true,
    },
  });

  const isSubmitting = form.formState.isSubmitting || isLoading;

  useEffect(() => {
    const rememberedEmail =
      typeof window === "undefined"
        ? ""
        : window.localStorage.getItem(rememberedEmailKey) ?? "";

    if (rememberedEmail) {
      form.setValue("email", rememberedEmail);
      form.setValue("rememberMe", true);
    }
  }, [form]);

  useEffect(() => {
    const values = form.getValues();

    form.reset({
      confirmPassword: "",
      email: values.email,
      name: values.name,
      password: "",
      rememberMe: values.rememberMe,
    });
  }, [form, mode]);

  async function syncSessionToServer(session: {
    access_token: string;
    refresh_token: string | null;
  }) {
    if (!session.access_token || !session.refresh_token) {
      throw new Error("Unable to persist authentication state.");
    }

    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        next: nextPath,
      }),
      credentials: "same-origin",
    });

    const text = await response.text();
    let data: { redirectPath?: string; error?: string } = {};

    try {
      if (text) {
        data = JSON.parse(text) as typeof data;
      }
    } catch {
      throw new Error("Unable to complete authentication.");
    }

    if (!response.ok) {
      throw new Error(data.error || "Unable to complete authentication.");
    }

    if (!data.redirectPath) {
      throw new Error("Unable to complete authentication.");
    }

    return data.redirectPath;
  }

  async function onSubmit(values: AuthFormValues) {
    if (!hasSupabasePublicEnv) {
      toast.error("Connect Supabase credentials to enable authentication.");
      return;
    }

    const supabase = createClient();

    if (mode === "login") {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        const session = data.session ?? (await supabase.auth.getSession()).data.session;

        if (!session) {
          toast.error("Authentication failed. Please try again.");
          return;
        }

        if (typeof window !== "undefined") {
          if (values.rememberMe) {
            window.localStorage.setItem(rememberedEmailKey, values.email);
          } else {
            window.localStorage.removeItem(rememberedEmailKey);
          }
        }

        const redirectPath = await syncSessionToServer(session);
        toast.success("Welcome back.");
        onSuccess?.();
        window.location.assign(redirectPath);
        return;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
        return;
      } finally {
        setIsLoading(false);
      }
    }

    if (mode === "register") {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              full_name: values.name,
            },
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(nextPath)}`,
          },
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (typeof window !== "undefined" && values.rememberMe) {
          window.localStorage.setItem(rememberedEmailKey, values.email);
        }

        toast.success("Account created. Check your email to confirm your session.");
        if (data.session) {
          const redirectPath = await syncSessionToServer(data.session);
          onSuccess?.();
          window.location.assign(redirectPath);
          return;
        }

        setMode("login");
        return;
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        }
        return;
      } finally {
        setIsLoading(false);
      }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Reset instructions sent.");
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-[2.6rem] border border-white/10 bg-[#0d0d0d] text-[#f5efe7] shadow-[0_45px_140px_-80px_rgba(0,0,0,0.92)]",
        compact ? "w-full" : "mx-auto max-w-5xl",
      )}
      style={{
        fontFamily:
          '"Inter","Neue Montreal","General Sans","Satoshi","Helvetica Neue",system-ui,sans-serif',
      }}
    >
      <div className={cn("grid min-h-[680px]", compact ? "lg:grid-cols-1" : "lg:grid-cols-[0.88fr_1.12fr]")}>
        {!compact ? (
          <div className="relative hidden overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_top,rgba(205,183,158,0.16),transparent_28%),linear-gradient(180deg,#181818_0%,#0a0a0a_100%)] p-8 lg:flex lg:flex-col lg:justify-between">
            <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.34em] text-[#cdb79e]">
              VALTORN ACCESS
            </div>

            <div className="space-y-6">
              <h2 className="max-w-md text-5xl font-semibold tracking-[-0.08em] text-[#f7f2eb]">
                Minimal access for a premium streetwear experience.
              </h2>
              <p className="max-w-md text-sm leading-8 text-[#b8b0a4]">
                Secure checkout access, saved preferences, order tracking, and a clean route into future drops.
              </p>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.03] p-5">
                <ShieldCheck className="h-5 w-5 text-[#cdb79e]" />
                <p className="mt-4 text-sm font-semibold uppercase tracking-[0.24em] text-[#f5efe7]">
                  Protected Session
                </p>
                <p className="mt-2 text-sm leading-7 text-[#9d978d]">
                  Supabase-powered authentication with secure validation and protected customer routes.
                </p>
              </div>
              <div className="rounded-[1.8rem] border border-white/10 bg-black/30 p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#f5efe7]">
                  Admin Access
                </p>
                <p className="mt-2 text-sm leading-7 text-[#9d978d]">
                  Admin permissions are granted securely on the server after successful authentication.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <div className="mb-8 space-y-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-[#cdb79e]">
              {copy.eyebrow}
            </p>
            <h1 className="max-w-xl text-3xl font-semibold tracking-[-0.06em] text-[#f7f2eb] sm:text-4xl">
              {copy.heading}
            </h1>
            <p className="max-w-xl text-sm leading-7 text-[#a8a093]">{copy.description}</p>
          </div>

          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as AuthMode)}
            className="space-y-6"
          >
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-[1.6rem] bg-white/[0.05] p-2">
              <TabsTrigger value="login" className="bg-transparent data-[state=active]:bg-[#f5efe7] data-[state=active]:text-black">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="bg-transparent data-[state=active]:bg-[#f5efe7] data-[state=active]:text-black">
                Register
              </TabsTrigger>
              <TabsTrigger value="reset" className="bg-transparent data-[state=active]:bg-[#f5efe7] data-[state=active]:text-black">
                Forgot Password
              </TabsTrigger>
            </TabsList>

            <TabsContent value={mode} className="mt-0">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                {mode === "register" ? (
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#f5efe7]">
                      Full Name
                    </Label>
                    <div className="relative">
                      <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f877b]" />
                      <Input
                        id="name"
                        {...form.register("name")}
                        className="h-[52px] rounded-[1.4rem] border-white/10 bg-white/[0.04] pl-11 text-[#f5efe7] placeholder:text-[#7f786d]"
                        placeholder="Your full name"
                      />
                    </div>
                    <p className="text-xs text-red-400">{form.formState.errors.name?.message}</p>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#f5efe7]">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f877b]" />
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      className="h-[52px] rounded-[1.4rem] border-white/10 bg-white/[0.04] pl-11 text-[#f5efe7] placeholder:text-[#7f786d]"
                      placeholder="name@email.com"
                    />
                  </div>
                  <p className="text-xs text-red-400">{form.formState.errors.email?.message}</p>
                </div>

                {mode !== "reset" ? (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[#f5efe7]">
                      Password
                    </Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8f877b]" />
                      <Input
                        id="password"
                        type="password"
                        {...form.register("password")}
                        className="h-[52px] rounded-[1.4rem] border-white/10 bg-white/[0.04] pl-11 text-[#f5efe7] placeholder:text-[#7f786d]"
                        placeholder="Enter your password"
                      />
                    </div>
                    <p className="text-xs text-red-400">{form.formState.errors.password?.message}</p>
                  </div>
                ) : null}

                {mode === "register" ? (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[#f5efe7]">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...form.register("confirmPassword")}
                      className="h-[52px] rounded-[1.4rem] border-white/10 bg-white/[0.04] text-[#f5efe7] placeholder:text-[#7f786d]"
                      placeholder="Confirm your password"
                    />
                    <p className="text-xs text-red-400">
                      {form.formState.errors.confirmPassword?.message}
                    </p>
                  </div>
                ) : null}

                {mode === "login" ? (
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <label className="flex items-center gap-3 text-sm text-[#b1aa9e]">
                      <input
                        type="checkbox"
                        checked={form.watch("rememberMe")}
                        onChange={(event) => form.setValue("rememberMe", event.target.checked)}
                        className="h-4 w-4 rounded border-white/15 bg-transparent accent-[#f5efe7]"
                      />
                      Remember me
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode("reset")}
                      className="text-left text-xs font-semibold uppercase tracking-[0.22em] text-[#cdb79e] transition hover:text-[#f5efe7]"
                    >
                      Forgot password
                    </button>
                  </div>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting}
                  className="h-14 w-full bg-[#f5efe7] text-black hover:bg-[#d8c7b0]"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {copy.submitLabel}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex flex-wrap gap-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8d877c]">
            <Link href="/auth/login">Dedicated Login Page</Link>
            <Link href="/auth/register">Register Page</Link>
            <Link href={nextPath}>Return Path</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
