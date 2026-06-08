create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "unaccent";

do $$
begin
  create type public.app_role as enum ('customer', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.product_gender as enum ('men', 'women', 'unisex');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.product_status as enum ('draft', 'active', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.order_status as enum (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum ('unpaid', 'paid', 'failed', 'refunded');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_method as enum (
    'stripe',
    'sslcommerz',
    'cash_on_delivery'
  );
exception
  when duplicate_object then null;
end $$;

drop table if exists public.reviews cascade;
drop table if exists public.wishlist cascade;
drop table if exists public.cart_items cascade;
drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.product_variants cascade;
drop table if exists public.product_images cascade;
drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.users cascade;

drop function if exists public.get_sales_analytics(timestamptz, timestamptz);
drop function if exists public.search_products(
  text,
  text,
  numeric,
  numeric,
  text[],
  text[],
  boolean,
  public.product_gender,
  text,
  integer,
  integer
);
drop function if exists public.create_order(
  jsonb,
  jsonb,
  text,
  public.payment_method,
  text,
  public.payment_status
);
drop function if exists public.sync_product_stock();
drop function if exists public.handle_updated_at();
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.is_admin();

create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null unique,
  phone text,
  role public.app_role not null default 'customer',
  avatar_url text,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  price numeric(12, 2) not null check (price >= 0),
  discount_price numeric(12, 2) check (discount_price is null or discount_price >= 0),
  stock integer not null default 0 check (stock >= 0),
  category_id uuid references public.categories (id) on delete set null,
  gender public.product_gender default 'unisex',
  featured boolean not null default false,
  status public.product_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  search_document tsvector not null,
  constraint products_discount_lte_price
    check (discount_price is null or discount_price <= price)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  image_url text not null,
  display_order integer not null default 0,
  constraint product_images_display_order_unique unique (product_id, display_order)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  size text not null,
  color text not null,
  stock integer not null default 0 check (stock >= 0),
  sku text not null unique,
  constraint product_variants_unique_option unique (product_id, size, color)
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  product_variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  created_at timestamptz not null default timezone('utc', now()),
  constraint cart_items_unique_variant unique (user_id, product_variant_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete restrict,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'unpaid',
  total numeric(12, 2) not null default 0 check (total >= 0),
  shipping_address jsonb not null,
  phone text,
  payment_method public.payment_method not null,
  payment_reference text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_variant_id uuid not null references public.product_variants (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price numeric(12, 2) not null check (price >= 0)
);

create table public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  constraint wishlist_unique_product unique (user_id, product_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint reviews_unique_user_product unique (user_id, product_id)
);

create index idx_categories_slug on public.categories (slug);
create index idx_products_slug on public.products (slug);
create index idx_products_category_id on public.products (category_id);
create index idx_products_status on public.products (status);
create index idx_products_featured on public.products (featured);
create index idx_products_gender on public.products (gender);
create index idx_products_price on public.products (price);
create index idx_products_created_at on public.products (created_at desc);
create index idx_products_search_document on public.products using gin (search_document);
create index idx_products_name_trgm on public.products using gin (name gin_trgm_ops);
create index idx_product_images_product_id on public.product_images (product_id, display_order);
create index idx_product_variants_product_id on public.product_variants (product_id);
create index idx_product_variants_size on public.product_variants (size);
create index idx_product_variants_color on public.product_variants (color);
create index idx_cart_items_user_id on public.cart_items (user_id);
create index idx_orders_user_id on public.orders (user_id);
create index idx_orders_status on public.orders (status);
create index idx_orders_payment_status on public.orders (payment_status);
create index idx_orders_created_at on public.orders (created_at desc);
create index idx_orders_payment_reference on public.orders (payment_reference);
create index idx_order_items_order_id on public.order_items (order_id);
create index idx_order_items_variant_id on public.order_items (product_variant_id);
create index idx_wishlist_user_id on public.wishlist (user_id);
create index idx_reviews_product_id on public.reviews (product_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.refresh_product_search_document()
returns trigger
language plpgsql
as $$
begin
  new.search_document := to_tsvector(
    'simple',
    unaccent(
      coalesce(new.name, '') || ' ' ||
      coalesce(new.description, '') || ' ' ||
      coalesce(new.slug, '') || ' ' ||
      coalesce(new.gender::text, '')
    )
  );
  return new;
end;
$$;

create or replace function public.sync_product_stock()
returns trigger
language plpgsql
as $$
declare
  v_product_id uuid;
begin
  v_product_id := coalesce(new.product_id, old.product_id);

  update public.products
  set stock = coalesce(
    (
      select sum(stock)
      from public.product_variants
      where product_id = v_product_id
    ),
    0
  )
  where id = v_product_id;

  return coalesce(new, old);
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, email, role, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.email,
    'customer',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do update
  set
    full_name = excluded.full_name,
    email = excluded.email,
    avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url);

  return new;
end;
$$;

create or replace function public.search_products(
  p_query text default null,
  p_category_slug text default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_sizes text[] default null,
  p_colors text[] default null,
  p_featured_only boolean default false,
  p_gender public.product_gender default null,
  p_sort text default 'latest',
  p_page integer default 1,
  p_page_size integer default 12
)
returns table (
  id uuid,
  name text,
  slug text,
  description text,
  price numeric,
  discount_price numeric,
  featured boolean,
  status public.product_status,
  gender public.product_gender,
  category_id uuid,
  category_name text,
  category_slug text,
  primary_image text,
  image_urls text[],
  available_sizes text[],
  available_colors text[],
  total_stock bigint,
  created_at timestamptz,
  updated_at timestamptz,
  total_count bigint
)
language sql
stable
as $$
  with filtered_products as (
    select
      p.id,
      p.name,
      p.slug,
      p.description,
      p.price,
      p.discount_price,
      p.featured,
      p.status,
      p.gender,
      c.id as category_id,
      c.name as category_name,
      c.slug as category_slug,
      (
        select pi.image_url
        from public.product_images pi
        where pi.product_id = p.id
        order by pi.display_order asc
        limit 1
      ) as primary_image,
      coalesce(
        (
          select array_agg(pi.image_url order by pi.display_order asc)
          from public.product_images pi
          where pi.product_id = p.id
        ),
        array[]::text[]
      ) as image_urls,
      coalesce(
        (
          select array_agg(distinct pv.size order by pv.size)
          from public.product_variants pv
          where pv.product_id = p.id
            and pv.stock > 0
        ),
        array[]::text[]
      ) as available_sizes,
      coalesce(
        (
          select array_agg(distinct pv.color order by pv.color)
          from public.product_variants pv
          where pv.product_id = p.id
            and pv.stock > 0
        ),
        array[]::text[]
      ) as available_colors,
      (
        select coalesce(sum(pv.stock), 0)
        from public.product_variants pv
        where pv.product_id = p.id
      ) as total_stock,
      p.created_at,
      p.updated_at
    from public.products p
    left join public.categories c on c.id = p.category_id
    where p.status = 'active'
      and (
        p_query is null
        or trim(p_query) = ''
        or p.search_document @@ websearch_to_tsquery('simple', unaccent(p_query))
        or similarity(p.name, p_query) > 0.2
        or similarity(p.slug, p_query) > 0.2
      )
      and (p_category_slug is null or c.slug = p_category_slug)
      and (p_gender is null or p.gender = p_gender)
      and (
        not coalesce(p_featured_only, false)
        or p.featured = true
      )
      and (
        p_min_price is null
        or coalesce(p.discount_price, p.price) >= p_min_price
      )
      and (
        p_max_price is null
        or coalesce(p.discount_price, p.price) <= p_max_price
      )
      and (
        coalesce(array_length(p_sizes, 1), 0) = 0
        or exists (
          select 1
          from public.product_variants pv
          where pv.product_id = p.id
            and pv.stock > 0
            and pv.size = any (p_sizes)
        )
      )
      and (
        coalesce(array_length(p_colors, 1), 0) = 0
        or exists (
          select 1
          from public.product_variants pv
          where pv.product_id = p.id
            and pv.stock > 0
            and pv.color = any (p_colors)
        )
      )
  ),
  paged_products as (
    select
      filtered_products.*,
      count(*) over() as total_count
    from filtered_products
    order by
      case
        when coalesce(p_sort, 'latest') = 'featured'
          then case when featured then 0 else 1 end
        else 0
      end asc,
      case
        when coalesce(p_sort, 'latest') = 'price-asc'
          then coalesce(discount_price, price)
      end asc nulls last,
      case
        when coalesce(p_sort, 'latest') = 'price-desc'
          then coalesce(discount_price, price)
      end desc nulls last,
      case
        when coalesce(p_sort, 'latest') = 'latest'
          then created_at
      end desc nulls last,
      created_at desc
    limit greatest(coalesce(p_page_size, 12), 1)
    offset (greatest(coalesce(p_page, 1), 1) - 1) * greatest(coalesce(p_page_size, 12), 1)
  )
  select *
  from paged_products;
$$;

create or replace function public.get_sales_analytics(
  p_from timestamptz default timezone('utc', now()) - interval '30 days',
  p_to timestamptz default timezone('utc', now())
)
returns table (
  revenue numeric,
  conversion_orders bigint,
  average_order_value numeric
)
language sql
stable
as $$
  select
    coalesce(sum(total), 0) as revenue,
    count(*) as conversion_orders,
    coalesce(avg(total), 0) as average_order_value
  from public.orders
  where payment_status = 'paid'
    and created_at >= coalesce(p_from, timezone('utc', now()) - interval '30 days')
    and created_at <= coalesce(p_to, timezone('utc', now()));
$$;

create or replace function public.create_order(
  p_items jsonb,
  p_shipping_address jsonb,
  p_phone text,
  p_payment_method public.payment_method,
  p_payment_reference text default null,
  p_payment_status public.payment_status default 'unpaid'
)
returns setof public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_order public.orders%rowtype;
  v_item jsonb;
  v_variant_id uuid;
  v_quantity integer;
  v_product_id uuid;
  v_available_stock integer;
  v_unit_price numeric(12, 2);
  v_total numeric(12, 2) := 0;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Order items are required';
  end if;

  insert into public.orders (
    user_id,
    status,
    payment_status,
    shipping_address,
    phone,
    payment_method,
    payment_reference
  )
  values (
    v_user_id,
    case when p_payment_status = 'paid' then 'confirmed' else 'pending' end,
    coalesce(p_payment_status, 'unpaid'),
    p_shipping_address,
    p_phone,
    p_payment_method,
    p_payment_reference
  )
  returning * into v_order;

  for v_item in
    select value
    from jsonb_array_elements(p_items)
  loop
    v_variant_id := coalesce(
      nullif(v_item ->> 'product_variant_id', '')::uuid,
      nullif(v_item ->> 'productVariantId', '')::uuid
    );
    v_quantity := greatest(coalesce(nullif(v_item ->> 'quantity', '')::integer, 1), 1);

    if v_variant_id is null then
      raise exception 'Each order item must include product_variant_id';
    end if;

    select
      pv.product_id,
      pv.stock,
      coalesce(p.discount_price, p.price)
    into
      v_product_id,
      v_available_stock,
      v_unit_price
    from public.product_variants pv
    join public.products p on p.id = pv.product_id
    where pv.id = v_variant_id
      and p.status = 'active'
    for update of pv;

    if not found then
      raise exception 'Product variant not found or inactive';
    end if;

    if v_available_stock < v_quantity then
      raise exception 'Insufficient stock for variant %', v_variant_id;
    end if;

    update public.product_variants
    set stock = stock - v_quantity
    where id = v_variant_id;

    insert into public.order_items (
      order_id,
      product_variant_id,
      quantity,
      price
    )
    values (
      v_order.id,
      v_variant_id,
      v_quantity,
      v_unit_price
    );

    delete from public.cart_items
    where user_id = v_user_id
      and product_variant_id = v_variant_id;

    v_total := v_total + (v_unit_price * v_quantity);
  end loop;

  update public.orders
  set total = v_total
  where id = v_order.id
  returning * into v_order;

  return next v_order;
end;
$$;

create trigger products_refresh_search_document
before insert or update on public.products
for each row execute procedure public.refresh_product_search_document();

update public.products
set search_document = to_tsvector(
  'simple',
  unaccent(
    coalesce(name, '') || ' ' ||
    coalesce(description, '') || ' ' ||
    coalesce(slug, '') || ' ' ||
    coalesce(gender::text, '')
  )
)
where search_document is null;

create trigger products_set_updated_at
before update on public.products
for each row execute procedure public.handle_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute procedure public.handle_updated_at();

create trigger sync_product_stock_after_variant_change
after insert or update or delete on public.product_variants
for each row execute procedure public.sync_product_stock();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update on auth.users
for each row execute procedure public.handle_new_user();

alter table public.users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.wishlist enable row level security;
alter table public.reviews enable row level security;

create policy "Users can read their own profile"
on public.users
for select
using (auth.uid() = id or public.is_admin());

create policy "Users can update their own profile"
on public.users
for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

create policy "Public can read categories"
on public.categories
for select
using (true);

create policy "Admins can manage categories"
on public.categories
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read active products"
on public.products
for select
using (status = 'active' or public.is_admin());

create policy "Admins can manage products"
on public.products
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read active product images"
on public.product_images
for select
using (
  exists (
    select 1
    from public.products
    where id = product_id
      and (status = 'active' or public.is_admin())
  )
);

create policy "Admins can manage product images"
on public.product_images
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read active product variants"
on public.product_variants
for select
using (
  exists (
    select 1
    from public.products
    where id = product_id
      and (status = 'active' or public.is_admin())
  )
);

create policy "Admins can manage product variants"
on public.product_variants
for all
using (public.is_admin())
with check (public.is_admin());

create policy "Customers can manage their cart"
on public.cart_items
for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

create policy "Customers can read their own orders"
on public.orders
for select
using (auth.uid() = user_id or public.is_admin());

create policy "Customers can create their own orders"
on public.orders
for insert
with check (auth.uid() = user_id or public.is_admin());

create policy "Admins can update orders"
on public.orders
for update
using (public.is_admin())
with check (public.is_admin());

create policy "Customers can read their own order items"
on public.order_items
for select
using (
  exists (
    select 1
    from public.orders
    where id = order_id
      and (user_id = auth.uid() or public.is_admin())
  )
);

create policy "Customers can manage their wishlist"
on public.wishlist
for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

create policy "Public can read reviews"
on public.reviews
for select
using (true);

create policy "Customers can manage their own reviews"
on public.reviews
for all
using (auth.uid() = user_id or public.is_admin())
with check (auth.uid() = user_id or public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'products',
    'products',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  ),
  (
    'banners',
    'banners',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  ),
  (
    'avatars',
    'avatars',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view media assets" on storage.objects;
drop policy if exists "Admins can manage product and banner assets" on storage.objects;
drop policy if exists "Users can manage their avatar assets" on storage.objects;

create policy "Public can view media assets"
on storage.objects
for select
using (bucket_id in ('products', 'banners', 'avatars'));

create policy "Admins can manage product and banner assets"
on storage.objects
for all
using (
  bucket_id in ('products', 'banners')
  and public.is_admin()
)
with check (
  bucket_id in ('products', 'banners')
  and public.is_admin()
);

create policy "Users can manage their avatar assets"
on storage.objects
for all
using (
  bucket_id = 'avatars'
  and (
    public.is_admin()
    or auth.uid()::text = (storage.foldername(name))[1]
  )
)
with check (
  bucket_id = 'avatars'
  and (
    public.is_admin()
    or auth.uid()::text = (storage.foldername(name))[1]
  )
);
