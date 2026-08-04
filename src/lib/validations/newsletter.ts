import { z } from "zod";

export const newsletterSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Please enter your email." })
    .trim()
    .email({ message: "Enter a valid email address." })
    .max(255, { message: "Email is too long." })
    .transform((val) => val.toLowerCase()),
  source: z.enum(["homepage", "footer", "popup", "checkout", "admin", "other"]).default("homepage"),
  honeypot: z.string().optional(),
});

export type NewsletterFormValues = z.input<typeof newsletterSchema>;
export type NewsletterParsedValues = z.infer<typeof newsletterSchema>;

export function sanitizeEmailInput(email: string): string {
  if (!email) return "";
  // Strip HTML tags and control characters
  return email
    .replace(/<[^>]*>?/gm, "")
    .replace(/[\r\n\t]/g, "")
    .trim()
    .toLowerCase();
}
