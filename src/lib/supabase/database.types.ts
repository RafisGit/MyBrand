export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string;
          id: string;
          product_variant_id: string;
          quantity: number;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_variant_id: string;
          quantity?: number;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_variant_id?: string;
          quantity?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          price: number;
          product_variant_id: string;
          quantity: number;
        };
        Insert: {
          id?: string;
          order_id: string;
          price: number;
          product_variant_id: string;
          quantity: number;
        };
        Update: {
          id?: string;
          order_id?: string;
          price?: number;
          product_variant_id?: string;
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_variant_id_fkey";
            columns: ["product_variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          created_at: string;
          id: string;
          payment_method: Database["public"]["Enums"]["payment_method"] | null;
          payment_reference: string | null;
          payment_status: Database["public"]["Enums"]["payment_status"];
          phone: string | null;
          shipping_address: Json;
          status: Database["public"]["Enums"]["order_status"];
          total: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"] | null;
          payment_reference?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          phone?: string | null;
          shipping_address: Json;
          status?: Database["public"]["Enums"]["order_status"];
          total?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"] | null;
          payment_reference?: string | null;
          payment_status?: Database["public"]["Enums"]["payment_status"];
          phone?: string | null;
          shipping_address?: Json;
          status?: Database["public"]["Enums"]["order_status"];
          total?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      product_images: {
        Row: {
          display_order: number;
          id: string;
          image_url: string;
          product_id: string;
        };
        Insert: {
          display_order?: number;
          id?: string;
          image_url: string;
          product_id: string;
        };
        Update: {
          display_order?: number;
          id?: string;
          image_url?: string;
          product_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          color: string;
          id: string;
          product_id: string;
          size: string;
          sku: string;
          stock: number;
        };
        Insert: {
          color: string;
          id?: string;
          product_id: string;
          size: string;
          sku: string;
          stock?: number;
        };
        Update: {
          color?: string;
          id?: string;
          product_id?: string;
          size?: string;
          sku?: string;
          stock?: number;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category_id: string | null;
          collection_id: string | null;
          created_at: string;
          description: string;
          discount_price: number | null;
          featured: boolean;
          gender: Database["public"]["Enums"]["product_gender"] | null;
          id: string;
          name: string;
          price: number;
          search_document: unknown | null;
          slug: string;
          status: Database["public"]["Enums"]["product_status"];
          stock: number;
          updated_at: string;
        };
        Insert: {
          category_id?: string | null;
          collection_id?: string | null;
          created_at?: string;
          description: string;
          discount_price?: number | null;
          featured?: boolean;
          gender?: Database["public"]["Enums"]["product_gender"] | null;
          id?: string;
          name: string;
          price: number;
          search_document?: unknown | null;
          slug: string;
          status?: Database["public"]["Enums"]["product_status"];
          stock?: number;
          updated_at?: string;
        };
        Update: {
          category_id?: string | null;
          collection_id?: string | null;
          created_at?: string;
          description?: string;
          discount_price?: number | null;
          featured?: boolean;
          gender?: Database["public"]["Enums"]["product_gender"] | null;
          id?: string;
          name?: string;
          price?: number;
          search_document?: unknown | null;
          slug?: string;
          status?: Database["public"]["Enums"]["product_status"];
          stock?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          product_id: string;
          rating: number;
          user_id: string;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          product_id: string;
          rating: number;
          user_id: string;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          product_id?: string;
          rating?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          email: string;
          full_name: string | null;
          id: string;
          phone: string | null;
          role: Database["public"]["Enums"]["app_role"];
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          email: string;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
        };
        Relationships: [];
      };
      homepage_sections: {
        Row: {
          id: string;
          section_key: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          button_text: string | null;
          button_link: string | null;
          images: Json;
          config: Json;
          visibility: boolean;
          display_order: number;
          status: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          section_key: string;
          title: string;
          subtitle?: string | null;
          description?: string | null;
          button_text?: string | null;
          button_link?: string | null;
          images?: Json;
          config?: Json;
          visibility?: boolean;
          display_order?: number;
          status?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          section_key?: string;
          title?: string;
          subtitle?: string | null;
          description?: string | null;
          button_text?: string | null;
          button_link?: string | null;
          images?: Json;
          config?: Json;
          visibility?: boolean;
          display_order?: number;
          status?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          collection_cover: string | null;
          collection_banner: string | null;
          is_featured: boolean;
          is_homepage: boolean;
          is_landing: boolean;
          display_order: number;
          visibility: boolean;
          status: string;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          collection_cover?: string | null;
          collection_banner?: string | null;
          is_featured?: boolean;
          is_homepage?: boolean;
          is_landing?: boolean;
          display_order?: number;
          visibility?: boolean;
          status?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          collection_cover?: string | null;
          collection_banner?: string | null;
          is_featured?: boolean;
          is_homepage?: boolean;
          is_landing?: boolean;
          display_order?: number;
          visibility?: boolean;
          status?: string;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media_library: {
        Row: {
          id: string;
          bucket: string;
          path: string;
          public_url: string;
          filename: string;
          folder: string;
          file_size: number | null;
          width: number | null;
          height: number | null;
          mime_type: string | null;
          alt_text: string | null;
          caption: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          bucket?: string;
          path: string;
          public_url: string;
          filename: string;
          folder?: string;
          file_size?: number | null;
          width?: number | null;
          height?: number | null;
          mime_type?: string | null;
          alt_text?: string | null;
          caption?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          bucket?: string;
          path?: string;
          public_url?: string;
          filename?: string;
          folder?: string;
          file_size?: number | null;
          width?: number | null;
          height?: number | null;
          mime_type?: string | null;
          alt_text?: string | null;
          caption?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      wishlist: {
        Row: {
          id: string;
          product_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "wishlist_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_order: {
        Args: {
          p_items: Json;
          p_shipping_address: Json;
          p_phone: string;
          p_payment_method: Database["public"]["Enums"]["payment_method"];
          p_payment_reference?: string | null;
          p_payment_status?: Database["public"]["Enums"]["payment_status"];
        };
        Returns: Database["public"]["Tables"]["orders"]["Row"][];
      };
      get_sales_analytics: {
        Args: {
          p_from?: string | null;
          p_to?: string | null;
        };
        Returns: {
          average_order_value: number;
          conversion_orders: number;
          revenue: number;
        }[];
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      save_product_transactional: {
        Args: {
          p_payload: Json;
        };
        Returns: Json;
      };
      search_products: {
        Args: {
          p_category_slug?: string | null;
          p_colors?: string[] | null;
          p_featured_only?: boolean | null;
          p_gender?: Database["public"]["Enums"]["product_gender"] | null;
          p_max_price?: number | null;
          p_min_price?: number | null;
          p_page?: number | null;
          p_page_size?: number | null;
          p_query?: string | null;
          p_sizes?: string[] | null;
          p_sort?: string | null;
        };
        Returns: {
          available_colors: string[];
          available_sizes: string[];
          category_id: string | null;
          category_name: string | null;
          category_slug: string | null;
          created_at: string;
          description: string;
          discount_price: number | null;
          featured: boolean;
          gender: Database["public"]["Enums"]["product_gender"] | null;
          id: string;
          image_urls: string[];
          name: string;
          price: number;
          primary_image: string | null;
          slug: string;
          status: Database["public"]["Enums"]["product_status"];
          total_count: number;
          total_stock: number;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      app_role: "customer" | "admin";
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled";
      payment_method: "stripe" | "sslcommerz" | "cash_on_delivery";
      payment_status: "unpaid" | "paid" | "failed" | "refunded";
      product_gender: "men" | "women" | "unisex";
      product_status: "draft" | "active" | "archived";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Row: infer Row;
    }
    ? Row
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Row: infer Row;
      }
      ? Row
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer Insert;
    }
    ? Insert
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer Insert;
      }
      ? Insert
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer Update;
    }
    ? Update
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer Update;
      }
      ? Update
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;
