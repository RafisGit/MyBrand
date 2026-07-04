-- Add new columns for metadata
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS alt_text text;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS storage_path text;
ALTER TABLE public.product_images ADD COLUMN IF NOT EXISTS file_size integer;

-- Drop the unique display_order constraint to make dynamic deletion/reordering/replacing easier
ALTER TABLE public.product_images DROP CONSTRAINT IF EXISTS product_images_display_order_unique;
