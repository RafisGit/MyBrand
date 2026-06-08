# MYBRAND Atelier

Luxury fashion eCommerce storefront built with Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn-style UI primitives, Supabase-ready services, Zustand cart state, Framer Motion, and payment scaffolding for Stripe plus SSLCommerz.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS
- shadcn UI patterns with Radix primitives
- Supabase Auth / Database / Storage ready services
- PostgreSQL via Supabase
- Framer Motion
- Zustand
- Stripe
- SSLCommerz
- Cloudinary or Supabase Storage compatible image pipeline

## What’s Included

- Cinematic luxury homepage with hero, featured collection, categories, brand story, best sellers, and social gallery
- Premium product listing page with responsive filters, sorting, search, hover image swap, and quick view
- Immersive product details page with gallery, sticky purchase panel, size/color/quantity controls, accordions, and related products
- Slide-out cart drawer with live subtotal, quantity editing, and mobile-ready interactions
- Checkout flow with shipping form, coupon support, order summary, and Stripe / SSLCommerz handoff routes
- Supabase Auth-ready login, registration, reset password, and Google sign-in hooks
- User dashboard for orders, addresses, and wishlist presentation
- Admin dashboard for analytics, products, orders, and user management overview
- Supabase SQL migration and seed template

## Project Structure

```text
src/
├── app/
├── components/
├── features/
├── hooks/
├── lib/
├── services/
├── store/
├── styles/
├── types/
└── utils/
```

## Environment

Copy `.env.example` to `.env.local` and fill in the values you want to enable:

```bash
cp .env.example .env.local
```

Key groups:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SSLCOMMERZ_STORE_ID`
- `SSLCOMMERZ_STORE_PASSWORD`
- `SSLCOMMERZ_IS_SANDBOX`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase Setup

1. Create a new Supabase project.
2. Add the values from Supabase to `.env.local`.
3. Run the SQL in [supabase/migrations/20260522000000_initial_schema.sql](supabase/migrations/20260522000000_initial_schema.sql).
4. Optionally run [supabase/seed.sql](supabase/seed.sql) to populate sample products.
5. Enable Google provider in Supabase Auth if you want social sign-in.

## Payments

- Stripe route: `POST /api/checkout/stripe`
- SSLCommerz route: `POST /api/checkout/sslcommerz`

The checkout UI is fully wired to these routes. Add credentials to move from scaffolded flow to live payments.

## Validation

The project was validated with:

```bash
npm run lint
npm run typecheck
npm run build
```

## Notes

- Wishlist is currently persisted locally with Zustand and can be synced to a Supabase table later if you want server-backed wishlists.
- Typography uses a resilient premium font stack to keep builds reliable in restricted environments. If you want hosted or self-hosted font assets, they can be swapped in without changing the design system.
