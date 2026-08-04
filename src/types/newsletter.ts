export type NewsletterStatus = 'active' | 'unsubscribed' | 'deactivated';
export type NewsletterSource = 'homepage' | 'footer' | 'popup' | 'checkout' | 'admin' | 'other';

export interface NewsletterSubscriber {
  id: string;
  email: string;
  status: NewsletterStatus | string;
  source: NewsletterSource | string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface NewsletterSubscriptionInput {
  email: string;
  source?: NewsletterSource | string;
  honeypot?: string;
}

export interface NewsletterSubscriptionResponse {
  success: boolean;
  message: string;
  subscriber?: NewsletterSubscriber;
}

export interface NewsletterAdminQueryFilters {
  search?: string;
  status?: NewsletterStatus | 'all';
  source?: NewsletterSource | 'all';
  sortBy?: 'newest' | 'oldest' | 'email_asc' | 'email_desc';
  page?: number;
  pageSize?: number;
}

export interface NewsletterAdminListResponse {
  subscribers: NewsletterSubscriber[];
  total: number;
  activeCount: number;
  unsubscribedCount: number;
  deactivatedCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
