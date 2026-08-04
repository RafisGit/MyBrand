import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { newsletterSchema, type NewsletterFormValues } from "@/lib/validations/newsletter";

export interface UseNewsletterOptions {
  source?: "homepage" | "footer" | "popup" | "checkout" | "admin" | "other";
  onSuccess?: () => void;
}

export function useNewsletter(options: UseNewsletterOptions = {}) {
  const source = options.source || "homepage";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
      source,
      honeypot: "",
    },
    mode: "onSubmit",
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          source: values.source || source,
          honeypot: values.honeypot || "",
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorMsg = data.message || "Something went wrong. Please try again.";
        setServerError(errorMsg);
        form.setError("email", {
          type: "manual",
          message: errorMsg,
        });
        setIsSubmitting(false);
        return;
      }

      // Success
      setIsSuccess(true);
      form.reset({ email: "", source, honeypot: "" });
      if (options.onSuccess) {
        options.onSuccess();
      }
    } catch (err) {
      console.error("Newsletter submission error:", err);
      const networkError = "Network error. Please check your connection and try again.";
      setServerError(networkError);
      form.setError("email", {
        type: "manual",
        message: networkError,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  const resetForm = () => {
    setIsSuccess(false);
    setServerError(null);
    form.reset({ email: "", source, honeypot: "" });
  };

  return {
    form,
    isSubmitting,
    isSuccess,
    serverError,
    handleSubmit,
    resetForm,
  };
}
