import { createSupabasePublicClient, createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Json } from "@/lib/supabase/database.types";
import type { HomepageSection, CollectionItem } from "@/types/cms";

export async function getHomepageSections(): Promise<Record<string, HomepageSection>> {
  const fallbacks = getFallbackHomepageSections();
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("visibility", true)
      .eq("status", "published")
      .order("display_order", { ascending: true });

    if (error) {
      return fallbacks;
    }

    if (!data || data.length === 0) {
      return fallbacks;
    }

    const sections: Record<string, HomepageSection> = { ...fallbacks };
    for (const item of data) {
      sections[item.section_key] = {
        id: item.id,
        sectionKey: item.section_key,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        buttonText: item.button_text,
        buttonLink: item.button_link,
        images: (item.images as Record<string, string>) || {},
        config: (item.config as Record<string, unknown>) || {},
        visibility: item.visibility,
        displayOrder: item.display_order,
        status: item.status as "draft" | "published" | "archived",
        publishedAt: item.published_at,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      };
    }

    return sections;
  } catch {
    return fallbacks;
  }
}

export async function getAllHomepageSectionsForAdmin(): Promise<HomepageSection[]> {
  try {
    const supabase = await createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data) {
      return Object.values(getFallbackHomepageSections());
    }

    return data.map((item) => ({
      id: item.id,
      sectionKey: item.section_key,
      title: item.title,
      subtitle: item.subtitle,
      description: item.description,
      buttonText: item.button_text,
      buttonLink: item.button_link,
      images: (item.images as Record<string, string>) || {},
      config: (item.config as Record<string, unknown>) || {},
      visibility: item.visibility,
      displayOrder: item.display_order,
      status: item.status as "draft" | "published" | "archived",
      publishedAt: item.published_at,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch {
    return Object.values(getFallbackHomepageSections());
  }
}

export async function updateHomepageSection(sectionKey: string, payload: Partial<HomepageSection>) {
  const supabase = await createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("homepage_sections")
    .upsert(
      {
        section_key: sectionKey,
        title: payload.title ?? "",
        subtitle: payload.subtitle ?? null,
        description: payload.description ?? null,
        button_text: payload.buttonText ?? null,
        button_link: payload.buttonLink ?? null,
        images: (payload.images ?? {}) as Json,
        config: (payload.config ?? {}) as Json,
        visibility: payload.visibility ?? true,
        status: payload.status ?? "published",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "section_key" }
    )
    .select("*")
    .single();

  if (error) {
    console.error("Error upserting homepage section:", error);
    throw error;
  }

  return data;
}

export async function getPublishedCollections(): Promise<CollectionItem[]> {
  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("collections")
      .select("*")
      .eq("visibility", true)
      .eq("status", "published")
      .order("display_order", { ascending: true });

    if (error || !data) {
      return [];
    }

    return (data ?? []).map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      collectionCover: item.collection_cover,
      collectionBanner: item.collection_banner,
      isFeatured: item.is_featured,
      isHomepage: item.is_homepage,
      isLanding: item.is_landing,
      displayOrder: item.display_order,
      visibility: item.visibility,
      status: item.status as "draft" | "published" | "archived",
      publishedAt: item.published_at,
    }) as unknown as CollectionItem);
  } catch {
    return [];
  }
}

function getFallbackHomepageSections(): Record<string, HomepageSection> {
  return {
    hero: {
      id: "hero-fallback",
      sectionKey: "hero",
      title: "ARCHITECTURAL SILHOUETTES FOR THE MODERN ICON.",
      subtitle: "EST. 2026 / HIGH-DENSITY COTTON & TAILORED DRAPE",
      description: "VALTORN engineers heavyweight minimalist streetwear crafted with precision drape, structural longevity, and quiet luxury tones.",
      buttonText: "EXPLORE COLLECTION",
      buttonLink: "/products",
      images: {
        primary: "https://images.pexels.com/photos/35625406/pexels-photo-35625406.jpeg",
        fabric: "https://images.pexels.com/photos/7717491/pexels-photo-7717491.jpeg",
        trousers: "https://images.pexels.com/photos/20094389/pexels-photo-20094389.jpeg",
        editorial: "https://images.pexels.com/photos/35586905/pexels-photo-35586905.jpeg",
      },
      config: {
        badge: "SPRING / SUMMER 2026 DROP",
      },
      visibility: true,
      displayOrder: 0,
      status: "published",
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    featured_collection: {
      id: "featured-fallback",
      sectionKey: "featured_collection",
      title: "ESSENTIAL ROTATION",
      subtitle: "CURATED CAPSULE",
      description: "Explore high-density cotton tees, utility outerwear, and relaxed tailored trousers designed for effortless daily layering.",
      buttonText: "VIEW ALL PIECES",
      buttonLink: "/products",
      images: {},
      config: {},
      visibility: true,
      displayOrder: 1,
      status: "published",
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    minimal_fashion: {
      id: "minimal-fallback",
      sectionKey: "minimal_fashion",
      title: "MINIMALIST ARCHITECTURE",
      subtitle: "DESIGN PHILOSOPHY",
      description: "Every garment is produced with custom heavyweight fabrics, reinforced seams, and timeless neutral colorways.",
      buttonText: "READ OUR STORY",
      buttonLink: "/about",
      images: {
        banner: "https://images.pexels.com/photos/4210866/pexels-photo-4210866.jpeg",
      },
      config: {},
      visibility: true,
      displayOrder: 2,
      status: "published",
      publishedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  };
}
