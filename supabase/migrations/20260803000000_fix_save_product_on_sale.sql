-- Fix: Add missing v_on_sale variable declaration to save_product_transactional
-- The original function was missing the DECLARE for v_on_sale, causing runtime errors.

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
  v_on_sale BOOLEAN;
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
  v_category_id := COALESCE((p_payload->>'categoryId')::UUID, (p_payload->>'collectionId')::UUID);
  v_collection_id := COALESCE((p_payload->>'collectionId')::UUID, (p_payload->>'categoryId')::UUID);

  IF v_category_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM public.categories WHERE id = v_category_id) AND NOT EXISTS (SELECT 1 FROM public.collections WHERE id = v_category_id) THEN
      RAISE EXCEPTION 'Collection does not exist.';
    END IF;
  END IF;

  v_gender := COALESCE((p_payload->>'gender')::public.product_gender, 'unisex'::public.product_gender);
  v_featured := COALESCE((p_payload->>'featured')::BOOLEAN, (p_payload->>'is_featured')::BOOLEAN, false);
  v_trending := COALESCE((p_payload->>'trending')::BOOLEAN, (p_payload->>'is_trending')::BOOLEAN, false);
  v_new_arrival := COALESCE((p_payload->>'newArrival')::BOOLEAN, (p_payload->>'is_new_arrival')::BOOLEAN, true);
  v_best_seller := COALESCE((p_payload->>'bestSeller')::BOOLEAN, (p_payload->>'is_best_seller')::BOOLEAN, false);
  v_recommended := COALESCE((p_payload->>'recommended')::BOOLEAN, (p_payload->>'is_recommended')::BOOLEAN, false);
  v_limited_edition := COALESCE((p_payload->>'limitedEdition')::BOOLEAN, (p_payload->>'is_limited_edition')::BOOLEAN, false);
  v_on_sale := COALESCE((p_payload->>'onSale')::BOOLEAN, (p_payload->>'is_on_sale')::BOOLEAN, false);
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
      on_sale = v_on_sale,
      status = v_status,
      updated_at = timezone('utc', now())
    WHERE id = v_product_id;
  ELSE
    -- Insert new product
    INSERT INTO public.products (
      id, name, slug, description, price, discount_price, stock, category_id, collection_id,
      gender, featured, trending, new_arrival, best_seller, recommended, limited_edition, on_sale, status
    ) VALUES (
      COALESCE(v_product_id, gen_random_uuid()), v_name, v_slug, v_description, v_price, v_discount_price, v_total_stock,
      v_category_id, v_collection_id, v_gender, v_featured, v_trending, v_new_arrival, v_best_seller, v_recommended, v_limited_edition, v_on_sale, v_status
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
