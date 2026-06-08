with category_seed(name, slug) as (
  values
    ('Men', 'men'),
    ('Women', 'women'),
    ('Oversized', 'oversized'),
    ('Hoodies', 'hoodies'),
    ('Streetwear', 'streetwear')
),
upserted_categories as (
  insert into public.categories (name, slug)
  select name, slug
  from category_seed
  on conflict (slug) do update
  set name = excluded.name
  returning id, slug
),
all_categories as (
  select id, slug from upserted_categories
  union
  select id, slug from public.categories
)
insert into public.products (
  name,
  slug,
  description,
  price,
  discount_price,
  category_id,
  gender,
  featured,
  status
)
select
  product_seed.name,
  product_seed.slug,
  product_seed.description,
  product_seed.price,
  product_seed.discount_price,
  categories.id,
  product_seed.gender::public.product_gender,
  product_seed.featured,
  'active'::public.product_status
from (
  values
    (
      'Obsidian Drape Coat',
      'obsidian-drape-coat',
      'A floor-skimming wool blend coat with fluid tailoring and quiet structure.',
      420.00,
      390.00,
      'men',
      'men',
      true
    ),
    (
      'Bone Heavyweight Hoodie',
      'bone-heavyweight-hoodie',
      'Dense brushed fleece hoodie with premium oversized volume and double-lined hood.',
      160.00,
      null,
      'hoodies',
      'unisex',
      true
    ),
    (
      'Taupe Studio Trouser',
      'taupe-studio-trouser',
      'Relaxed tailoring in a soft taupe tone with a clean taper and elevated drape.',
      190.00,
      170.00,
      'women',
      'women',
      true
    ),
    (
      'Shadow Oversized Tee',
      'shadow-oversized-tee',
      'Washed premium jersey T-shirt with a dropped shoulder and oversized silhouette.',
      85.00,
      null,
      'oversized',
      'unisex',
      true
    )
) as product_seed(
  name,
  slug,
  description,
  price,
  discount_price,
  category_slug,
  gender,
  featured
)
join all_categories as categories
  on categories.slug = product_seed.category_slug
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  discount_price = excluded.discount_price,
  category_id = excluded.category_id,
  gender = excluded.gender,
  featured = excluded.featured,
  status = excluded.status;

insert into public.product_images (product_id, image_url, display_order)
select
  products.id,
  seed.image_url,
  seed.display_order
from public.products as products
join (
  values
    ('obsidian-drape-coat', 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1400&q=80', 0),
    ('obsidian-drape-coat', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80', 1),
    ('bone-heavyweight-hoodie', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80', 0),
    ('bone-heavyweight-hoodie', 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80', 1),
    ('taupe-studio-trouser', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1400&q=80', 0),
    ('taupe-studio-trouser', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80', 1),
    ('shadow-oversized-tee', 'https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1400&q=80', 0),
    ('shadow-oversized-tee', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80', 1)
) as seed(product_slug, image_url, display_order)
  on seed.product_slug = products.slug
on conflict (product_id, display_order) do update
set image_url = excluded.image_url;

insert into public.product_variants (product_id, size, color, stock, sku)
select
  products.id,
  seed.size,
  seed.color,
  seed.stock,
  seed.sku
from public.products as products
join (
  values
    ('obsidian-drape-coat', 'S', 'Black', 4, 'ODC-BLK-S'),
    ('obsidian-drape-coat', 'M', 'Black', 4, 'ODC-BLK-M'),
    ('obsidian-drape-coat', 'L', 'Charcoal', 3, 'ODC-CHR-L'),
    ('obsidian-drape-coat', 'XL', 'Charcoal', 3, 'ODC-CHR-XL'),
    ('bone-heavyweight-hoodie', 'XS', 'Bone', 8, 'BHH-BON-XS'),
    ('bone-heavyweight-hoodie', 'S', 'Bone', 8, 'BHH-BON-S'),
    ('bone-heavyweight-hoodie', 'M', 'Stone', 10, 'BHH-STN-M'),
    ('bone-heavyweight-hoodie', 'L', 'Stone', 12, 'BHH-STN-L'),
    ('taupe-studio-trouser', 'XS', 'Taupe', 5, 'TST-TAU-XS'),
    ('taupe-studio-trouser', 'S', 'Taupe', 5, 'TST-TAU-S'),
    ('taupe-studio-trouser', 'M', 'Stone', 4, 'TST-STN-M'),
    ('taupe-studio-trouser', 'L', 'Stone', 5, 'TST-STN-L'),
    ('shadow-oversized-tee', 'S', 'Black', 12, 'SOT-BLK-S'),
    ('shadow-oversized-tee', 'M', 'Black', 18, 'SOT-BLK-M'),
    ('shadow-oversized-tee', 'L', 'Charcoal', 16, 'SOT-CHR-L'),
    ('shadow-oversized-tee', 'XL', 'Charcoal', 18, 'SOT-CHR-XL')
) as seed(product_slug, size, color, stock, sku)
  on seed.product_slug = products.slug
on conflict (product_id, size, color) do update
set
  stock = excluded.stock,
  sku = excluded.sku;
