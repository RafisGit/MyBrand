-- SQL Migration: 20260730000000_full_cms_ecommerce.sql
-- Full CMS & Dynamic Admin E-Commerce Schema Extension

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- 2. Enums
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'editor', 'staff', 'viewer', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.image_type AS ENUM (
    'featured', 'hover', 'gallery', 'zoom', 'thumbnail', 'lifestyle', 'detail', 'fabric', 'size_chart', '360'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3. Collections Table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  collection_cover TEXT,
  collection_banner TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_homepage BOOLEAN NOT NULL DEFAULT false,
  is_landing BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  visibility BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at TIMESTAMPTZ
);

-- 4. Enhance Products Table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS trending BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS new_arrival BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS best_seller BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS recommended BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS limited_edition BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ DEFAULT timezone('utc', now());
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- 5. Enhance Product Images Table
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS image_type public.image_type NOT NULL DEFAULT 'gallery';
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS width INTEGER;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS height INTEGER;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc', now());
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc', now());

-- 6. Enhance Product Variants Table
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS barcode TEXT;
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS price NUMERIC(12, 2);
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS sale_price NUMERIC(12, 2);
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS discount NUMERIC(5, 2);
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS availability BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived'));
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc', now());
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc', now());

-- 7. Homepage Sections Table
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  button_text TEXT,
  button_link TEXT,
  images JSONB NOT NULL DEFAULT '{}'::jsonb,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  visibility BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ DEFAULT timezone('utc', now()),
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at TIMESTAMPTZ
);

-- 8. Hero Cards Table
CREATE TABLE IF NOT EXISTS public.hero_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.homepage_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  tag TEXT,
  image_url TEXT NOT NULL,
  link TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at TIMESTAMPTZ
);

-- 9. Banners Table
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banner_type TEXT NOT NULL CHECK (banner_type IN ('hero', 'promotional', 'lifestyle', 'footer', 'popup')),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  button_text TEXT,
  button_link TEXT,
  visibility BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at TIMESTAMPTZ
);

-- 10. Unified Media Library Table
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket TEXT NOT NULL DEFAULT 'products',
  path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  folder TEXT NOT NULL DEFAULT 'root',
  file_size INTEGER,
  width INTEGER,
  height INTEGER,
  mime_type TEXT,
  alt_text TEXT,
  caption TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  deleted_at TIMESTAMPTZ
);

-- 11. SEO & Metadata Table
CREATE TABLE IF NOT EXISTS public.seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('page', 'product', 'category', 'collection')),
  entity_id TEXT NOT NULL,
  meta_title TEXT NOT NULL,
  meta_description TEXT,
  keywords TEXT[],
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  canonical_url TEXT,
  json_ld JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 12. Roles & Permissions (RBAC)
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name public.app_role NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 13. Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 14. Inventory Tracking Table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  warehouse_location TEXT NOT NULL DEFAULT 'Main Warehouse',
  quantity_on_hand INTEGER NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
  quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 15. Site Configuration Table
CREATE TABLE IF NOT EXISTS public.site_configuration (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_visibility ON public.collections(visibility);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_key ON public.homepage_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_order ON public.homepage_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_hero_cards_section ON public.hero_cards(section_id, display_order);
CREATE INDEX IF NOT EXISTS idx_banners_type ON public.banners(banner_type);
CREATE INDEX IF NOT EXISTS idx_media_library_folder ON public.media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_library_bucket ON public.media_library(bucket);
CREATE INDEX IF NOT EXISTS idx_seo_entity ON public.seo(entity_type, entity_id);

-- RLS Enablement
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_configuration ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public Read Policies
DROP POLICY IF EXISTS "Public can view published collections" ON public.collections;
CREATE POLICY "Public can view published collections" ON public.collections FOR SELECT USING (visibility = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Public can view published homepage sections" ON public.homepage_sections;
CREATE POLICY "Public can view published homepage sections" ON public.homepage_sections FOR SELECT USING (visibility = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Public can view hero cards" ON public.hero_cards;
CREATE POLICY "Public can view hero cards" ON public.hero_cards FOR SELECT USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "Public can view banners" ON public.banners;
CREATE POLICY "Public can view banners" ON public.banners FOR SELECT USING (visibility = true AND deleted_at IS NULL);

DROP POLICY IF EXISTS "Public can view site config" ON public.site_configuration;
CREATE POLICY "Public can view site config" ON public.site_configuration FOR SELECT USING (true);

-- Admin Full Access Policies
DROP POLICY IF EXISTS "Admins can manage collections" ON public.collections;
CREATE POLICY "Admins can manage collections" ON public.collections FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage homepage sections" ON public.homepage_sections;
CREATE POLICY "Admins can manage homepage sections" ON public.homepage_sections FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage hero cards" ON public.hero_cards;
CREATE POLICY "Admins can manage hero cards" ON public.hero_cards FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage banners" ON public.banners;
CREATE POLICY "Admins can manage banners" ON public.banners FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage media library" ON public.media_library;
CREATE POLICY "Admins can manage media library" ON public.media_library FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage seo" ON public.seo;
CREATE POLICY "Admins can manage seo" ON public.seo FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage site config" ON public.site_configuration;
CREATE POLICY "Admins can manage site config" ON public.site_configuration FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage activity logs" ON public.activity_logs;
CREATE POLICY "Admins can manage activity logs" ON public.activity_logs FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Atomic Transactional RPC for Creating/Updating Products
CREATE OR REPLACE FUNCTION public.save_product_transactional(p_payload JSONB)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_product_id UUID;
  v_name TEXT;
  v_slug TEXT;
  v_description TEXT;
  v_price NUMERIC;
  v_discount_price NUMERIC;
  v_category_id UUID;
  v_collection_id UUID;
  v_gender public.product_gender;
  v_featured BOOLEAN;
  v_trending BOOLEAN;
  v_new_arrival BOOLEAN;
  v_best_seller BOOLEAN;
  v_recommended BOOLEAN;
  v_limited_edition BOOLEAN;
  v_status public.product_status;
  v_total_stock INT := 0;
BEGIN
  -- Extract variables from payload JSON
  v_product_id := (p_payload->>'id')::UUID;
  v_name := p_payload->>'name';
  v_slug := COALESCE(p_payload->>'slug', lower(regexp_replace(v_name, '[^a-zA-Z0-9]+', '-', 'g')));
  v_description := p_payload->>'description';
  v_price := (p_payload->>'price')::NUMERIC;
  v_discount_price := (p_payload->>'discountPrice')::NUMERIC;
  v_category_id := (p_payload->>'categoryId')::UUID;
  v_collection_id := (p_payload->>'collectionId')::UUID;
  v_gender := COALESCE((p_payload->>'gender')::public.product_gender, 'unisex'::public.product_gender);
  v_featured := COALESCE((p_payload->>'featured')::BOOLEAN, false);
  v_trending := COALESCE((p_payload->>'trending')::BOOLEAN, false);
  v_new_arrival := COALESCE((p_payload->>'newArrival')::BOOLEAN, true);
  v_best_seller := COALESCE((p_payload->>'bestSeller')::BOOLEAN, false);
  v_recommended := COALESCE((p_payload->>'recommended')::BOOLEAN, false);
  v_limited_edition := COALESCE((p_payload->>'limitedEdition')::BOOLEAN, false);
  v_status := COALESCE((p_payload->>'status')::public.product_status, 'active'::public.product_status);

  -- Calculate total stock from variants
  SELECT COALESCE(SUM((v->>'stock')::INT), 0) INTO v_total_stock
  FROM jsonb_array_elements(COALESCE(p_payload->'variants', '[]'::jsonb)) AS v;

  IF v_product_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.products WHERE id = v_product_id) THEN
    -- Update existing product
    UPDATE public.products SET
      name = v_name,
      slug = v_slug,
      description = v_description,
      price = v_price,
      discount_price = v_discount_price,
      stock = v_total_stock,
      category_id = v_category_id,
      collection_id = v_collection_id,
      gender = v_gender,
      featured = v_featured,
      trending = v_trending,
      new_arrival = v_new_arrival,
      best_seller = v_best_seller,
      recommended = v_recommended,
      limited_edition = v_limited_edition,
      status = v_status,
      updated_at = timezone('utc', now())
    WHERE id = v_product_id;
  ELSE
    -- Insert new product
    INSERT INTO public.products (
      id, name, slug, description, price, discount_price, stock, category_id, collection_id,
      gender, featured, trending, new_arrival, best_seller, recommended, limited_edition, status
    ) VALUES (
      COALESCE(v_product_id, gen_random_uuid()), v_name, v_slug, v_description, v_price, v_discount_price, v_total_stock,
      v_category_id, v_collection_id, v_gender, v_featured, v_trending, v_new_arrival, v_best_seller, v_recommended, v_limited_edition, v_status
    )
    RETURNING id INTO v_product_id;
  END IF;

  -- Refresh Images: Delete old ones and insert new payload images
  DELETE FROM public.product_images WHERE product_id = v_product_id;

  INSERT INTO public.product_images (
    product_id, image_url, display_order, alt_text, caption, image_type, storage_path, file_size
  )
  SELECT
    v_product_id,
    img->>'imageUrl',
    COALESCE((img->>'displayOrder')::INT, (ordinality - 1)::INT),
    img->>'altText',
    img->>'caption',
    COALESCE((img->>'imageType')::public.image_type, 'gallery'::public.image_type),
    img->>'storagePath',
    (img->>'fileSize')::INT
  FROM jsonb_array_elements(COALESCE(p_payload->'images', '[]'::jsonb)) WITH ORDINALITY AS img;

  -- Refresh Variants: Delete old ones and insert new payload variants
  DELETE FROM public.product_variants WHERE product_id = v_product_id;

  INSERT INTO public.product_variants (
    product_id, size, color, stock, sku, barcode, price, sale_price
  )
  SELECT
    v_product_id,
    var->>'size',
    var->>'color',
    (var->>'stock')::INT,
    var->>'sku',
    var->>'barcode',
    (var->>'price')::NUMERIC,
    (var->>'salePrice')::NUMERIC
  FROM jsonb_array_elements(COALESCE(p_payload->'variants', '[]'::jsonb)) AS var;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_product_id,
    'slug', v_slug
  );
EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'Failed to save product transaction: %', SQLERRM;
END;
$$;

GRANT EXECUTE ON FUNCTION public.save_product_transactional(JSONB) TO authenticated, service_role;

-- Seed Default Homepage Sections
INSERT INTO public.homepage_sections (section_key, title, subtitle, description, button_text, button_link, images, config, display_order)
VALUES 
(
  'hero',
  'ARCHITECTURAL SILHOUETTES FOR THE MODERN ICON.',
  'EST. 2026 / HIGH-DENSITY COTTON & TAILORED DRAPE',
  'VALTORN engineers heavyweight minimalist streetwear crafted with precision drape, structural longevity, and quiet luxury tones.',
  'EXPLORE COLLECTION',
  '/products',
  '{"primary": "https://images.pexels.com/photos/35625406/pexels-photo-35625406.jpeg", "fabric": "https://images.pexels.com/photos/7717491/pexels-photo-7717491.jpeg", "trousers": "https://images.pexels.com/photos/20094389/pexels-photo-20094389.jpeg", "editorial": "https://images.pexels.com/photos/35586905/pexels-photo-35586905.jpeg"}'::jsonb,
  '{"badge": "SPRING / SUMMER 2026 DROP", "launchDate": "2026-08-01"}'::jsonb,
  0
),
(
  'featured_collection',
  'ESSENTIAL ROTATION',
  'CURATED CAPSULE',
  'Explore high-density cotton tees, utility outerwear, and relaxed tailored trousers designed for effortless daily layering.',
  'VIEW ALL PIECES',
  '/products',
  '{}'::jsonb,
  '{}'::jsonb,
  1
),
(
  'minimal_fashion',
  'MINIMALIST ARCHITECTURE',
  'DESIGN PHILOSOPHY',
  'Every garment is produced with custom heavyweight fabrics, reinforced seams, and timeless neutral colorways.',
  'READ OUR STORY',
  '/about',
  '{"banner": "https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg"}'::jsonb,
  '{}'::jsonb,
  2
)
ON CONFLICT (section_key) DO NOTHING;
