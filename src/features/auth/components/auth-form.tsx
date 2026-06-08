"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";
import { hasSupabasePublicEnv } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "login" | "register" | "reset";

function getSchema(mode: AuthMode) {
  return z.object({
    name:
      mode === "register"
        ? z.string().min(2, "Name is required.")
        : z.string().optional(),
    email: z.string().email("Enter a valid email."),
    password:
      mode === "reset"
        ? z.string().optional()
        : z.string().min(8, "Password must be at least 8 characters."),
  });
}

export function AuthForm({
  mode,
  title,
  description,
}: {
  mode: AuthMode;
  title: string;
  description: string;
}) {
  const router = useRouter();
  const schema = useMemo(() => getSchema(mode), [mode]);

  const form = useForm<z.infer<ReturnType<typeof getSchema>>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<ReturnType<typeof getSchema>>) {
    if (!hasSupabasePublicEnv) {
      toast.error("Connect Supabase credentials to enable authentication.");
      return;
    }

    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password ?? "",
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Welcome back.");
      router.push("/dashboard");
      router.refresh();
      return;
    }

    if (mode === "register") {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password ?? "",
        options: {
          data: {
            full_name: values.name,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Account created. Check your email to confirm your session.");
      router.push("/dashboard");
      return;
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

  async function handleGoogleLogin() {
    if (!hasSupabasePublicEnv) {
      toast.error("Connect Supabase credentials to enable Google sign-in.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-[2.5rem] border border-black/10 bg-white p-6 sm:p-8">
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Supabase Auth
        </p>
        <h1 className="text-4xl font-semibold tracking-[-0.05em] text-black">
          {title}
        </h1>
        <p className="text-sm leading-7 text-zinc-600">{description}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
        {mode === "register" ? (
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...form.register("name")} />
            <p className="text-xs text-red-500">{form.formState.errors.name?.message}</p>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
          <p className="text-xs text-red-500">{form.formState.errors.email?.message}</p>
        </div>

        {mode !== "reset" ? (
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...form.register("password")} />
            <p className="text-xs text-red-500">{form.formState.errors.password?.message}</p>
          </div>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {mode === "login"
            ? "Sign In"
            : mode === "register"
              ? "Create Account"
              : "Send Reset Link"}
        </Button>
      </form>

      {mode !== "reset" ? (
        <>
          <div className="my-6 h-px bg-black/10" />
          <Button
            type="button"
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={handleGoogleLogin}
          >
            Continue with Google
          </Button>
        </>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {mode !== "login" ? <Link href="/auth/login">Sign In</Link> : null}
        {mode !== "register" ? <Link href="/auth/register">Create Account</Link> : null}
        {mode !== "reset" ? <Link href="/auth/reset-password">Reset Password</Link> : null}
      </div>
    </div>
  );
}
