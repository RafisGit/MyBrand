import crypto from "crypto";

export interface EmailProviderResult {
  success: boolean;
  provider: string;
  externalId?: string;
  message?: string;
  error?: unknown;
}

export interface EmailServiceProvider {
  name: string;
  syncSubscriber(
    email: string,
    source: string,
    metadata?: Record<string, unknown>
  ): Promise<EmailProviderResult>;
  sendWelcomeEmail?(
    email: string,
    metadata?: Record<string, unknown>
  ): Promise<EmailProviderResult>;
}

// ----------------------------------------------------------------------------
// 1. Resend Adapter
// ----------------------------------------------------------------------------
export class ResendAdapter implements EmailServiceProvider {
  name = "resend";

  constructor(private apiKey: string, private audienceId?: string) {}

  async syncSubscriber(
    email: string,
    source: string,
    metadata?: Record<string, unknown>
  ): Promise<EmailProviderResult> {
    try {
      if (!this.audienceId) {
        return {
          success: true,
          provider: this.name,
          message: "Resend configured without audience ID. Logged subscriber.",
        };
      }

      const res = await fetch(`https://api.resend.com/audiences/${this.audienceId}/contacts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          unsubscribed: false,
          data: { source, ...metadata },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          provider: this.name,
          message: errorData.message || "Failed to sync subscriber to Resend",
          error: errorData,
        };
      }

      const data = await res.json();
      return {
        success: true,
        provider: this.name,
        externalId: data.id,
      };
    } catch (err) {
      return {
        success: false,
        provider: this.name,
        message: "Resend connection error",
        error: err,
      };
    }
  }
}

// ----------------------------------------------------------------------------
// 2. Mailchimp Adapter
// ----------------------------------------------------------------------------
export class MailchimpAdapter implements EmailServiceProvider {
  name = "mailchimp";

  constructor(private apiKey: string, private listId?: string, private serverPrefix?: string) {}

  async syncSubscriber(
    email: string,
    source: string,
    metadata?: Record<string, unknown>
  ): Promise<EmailProviderResult> {
    try {
      const prefix = this.serverPrefix || this.apiKey.split("-")[1] || "us1";
      if (!this.listId) {
        return {
          success: true,
          provider: this.name,
          message: "Mailchimp configured without List ID.",
        };
      }

      const subscriberHash = crypto.createHash("md5").update(email.toLowerCase()).digest("hex");
      const url = `https://${prefix}.api.mailchimp.com/3.0/lists/${this.listId}/members/${subscriberHash}`;

      const res = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Basic ${Buffer.from(`anystring:${this.apiKey}`).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          status_if_new: "subscribed",
          merge_fields: { SOURCE: source, ...metadata },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          provider: this.name,
          message: errorData.detail || "Failed to sync subscriber to Mailchimp",
          error: errorData,
        };
      }

      const data = await res.json();
      return {
        success: true,
        provider: this.name,
        externalId: data.id,
      };
    } catch (err) {
      return {
        success: false,
        provider: this.name,
        message: "Mailchimp connection error",
        error: err,
      };
    }
  }
}

// ----------------------------------------------------------------------------
// 3. Brevo (Sendinblue) Adapter
// ----------------------------------------------------------------------------
export class BrevoAdapter implements EmailServiceProvider {
  name = "brevo";

  constructor(private apiKey: string) {}

  async syncSubscriber(
    email: string,
    source: string,
    metadata?: Record<string, unknown>
  ): Promise<EmailProviderResult> {
    try {
      const res = await fetch("https://api.brevo.com/v3/contacts", {
        method: "POST",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          updateEnabled: true,
          attributes: { SOURCE: source, ...metadata },
        }),
      });

      if (!res.ok && res.status !== 204) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          provider: this.name,
          message: errorData.message || "Failed to sync subscriber to Brevo",
          error: errorData,
        };
      }

      return {
        success: true,
        provider: this.name,
      };
    } catch (err) {
      return {
        success: false,
        provider: this.name,
        message: "Brevo connection error",
        error: err,
      };
    }
  }
}

// ----------------------------------------------------------------------------
// 4. Klaviyo Adapter
// ----------------------------------------------------------------------------
export class KlaviyoAdapter implements EmailServiceProvider {
  name = "klaviyo";

  constructor(private apiKey: string, private listId?: string) {}

  async syncSubscriber(
    email: string,
    source: string,
    metadata?: Record<string, unknown>
  ): Promise<EmailProviderResult> {
    try {
      const res = await fetch("https://a.klaviyo.com/api/profiles/", {
        method: "POST",
        headers: {
          Authorization: `Klaviyo-API-Key ${this.apiKey}`,
          accept: "application/json",
          "content-type": "application/json",
          revision: "2024-02-15",
        },
        body: JSON.stringify({
          data: {
            type: "profile",
            attributes: {
              email,
              properties: { source, listId: this.listId, ...metadata },
            },
          },
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          provider: this.name,
          message: "Failed to sync subscriber to Klaviyo",
          error: errorData,
        };
      }

      const data = await res.json();
      return {
        success: true,
        provider: this.name,
        externalId: data.data?.id,
      };
    } catch (err) {
      return {
        success: false,
        provider: this.name,
        message: "Klaviyo connection error",
        error: err,
      };
    }
  }
}

// ----------------------------------------------------------------------------
// 5. SendGrid Adapter
// ----------------------------------------------------------------------------
export class SendGridAdapter implements EmailServiceProvider {
  name = "sendgrid";

  constructor(private apiKey: string) {}

  async syncSubscriber(
    email: string,
    source: string,
    metadata?: Record<string, unknown>
  ): Promise<EmailProviderResult> {
    try {
      const res = await fetch("https://api.sendgrid.com/v3/marketing/contacts", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contacts: [
            {
              email,
              custom_fields: { source: String(source), ...metadata },
            },
          ],
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          success: false,
          provider: this.name,
          message: "Failed to sync subscriber to SendGrid",
          error: errorData,
        };
      }

      return {
        success: true,
        provider: this.name,
      };
    } catch (err) {
      return {
        success: false,
        provider: this.name,
        message: "SendGrid connection error",
        error: err,
      };
    }
  }
}

// ----------------------------------------------------------------------------
// 6. Fallback / Mock Adapter (Default in Dev)
// ----------------------------------------------------------------------------
export class MockAdapter implements EmailServiceProvider {
  name = "mock";

  async syncSubscriber(
    email: string,
    source: string,
    metadata?: Record<string, unknown>
  ): Promise<EmailProviderResult> {
    console.log(`[NEWSLETTER MOCK PROVIDER] Synced ${email} (source: ${source})`, metadata);
    return {
      success: true,
      provider: this.name,
      message: "Mock subscription recorded successfully.",
    };
  }
}

// ----------------------------------------------------------------------------
// Factory Method to Resolve Configured Email Provider
// ----------------------------------------------------------------------------
export function getEmailServiceProvider(): EmailServiceProvider {
  const providerName = (process.env.NEWSLETTER_EMAIL_PROVIDER || "mock").toLowerCase();

  switch (providerName) {
    case "resend": {
      const apiKey = process.env.RESEND_API_KEY;
      if (apiKey) return new ResendAdapter(apiKey, process.env.RESEND_AUDIENCE_ID);
      break;
    }
    case "mailchimp": {
      const apiKey = process.env.MAILCHIMP_API_KEY;
      if (apiKey) return new MailchimpAdapter(apiKey, process.env.MAILCHIMP_LIST_ID, process.env.MAILCHIMP_SERVER_PREFIX);
      break;
    }
    case "brevo": {
      const apiKey = process.env.BREVO_API_KEY;
      if (apiKey) return new BrevoAdapter(apiKey);
      break;
    }
    case "klaviyo": {
      const apiKey = process.env.KLAVIYO_API_KEY;
      if (apiKey) return new KlaviyoAdapter(apiKey, process.env.KLAVIYO_LIST_ID);
      break;
    }
    case "sendgrid": {
      const apiKey = process.env.SENDGRID_API_KEY;
      if (apiKey) return new SendGridAdapter(apiKey);
      break;
    }
  }

  // Fallback to Mock Adapter if no provider configured or keys missing
  return new MockAdapter();
}
