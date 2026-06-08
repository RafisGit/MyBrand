create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value numeric(12, 2) not null check (discount_value >= 0),
  minimum_order_value numeric(12, 2) default 0 check (minimum_order_value >= 0),
  usage_limit integer,
  usage_count integer not null default 0 check (usage_count >= 0),
  active boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.site_settings (
  id text primary key,
  category text not null,
  label text not null,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null check (bucket in ('products', 'banners', 'avatars')),
  path text not null unique,
  public_url text not null,
  folder text not null default 'uploads',
  alt_text text,
  tags text[] not null default '{}',
  created_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_coupons_code on public.coupons (code);
create index if not exists idx_coupons_active on public.coupons (active);
create index if not exists idx_site_settings_category on public.site_settings (category);
create index if not exists idx_media_assets_bucket on public.media_assets (bucket);
create index if not exists idx_media_assets_folder on public.media_assets (folder);
create index if not exists idx_media_assets_created_by on public.media_assets (created_by);

alter table public.coupons enable row level security;
alter table public.site_settings enable row level security;
alter table public.media_assets enable row level security;

drop policy if exists "Admins can manage coupons" on public.coupons;
create policy "Admins can manage coupons"
on public.coupons
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage site settings" on public.site_settings;
create policy "Admins can manage site settings"
on public.site_settings
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins can manage media assets" on public.media_assets;
create policy "Admins can manage media assets"
on public.media_assets
for all
using (public.is_admin())
with check (public.is_admin());

drop trigger if exists coupons_set_updated_at on public.coupons;
create trigger coupons_set_updated_at
before update on public.coupons
for each row execute procedure public.handle_updated_at();

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
before update on public.site_settings
for each row execute procedure public.handle_updated_at();
