export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      cart_items: {
        Row: {
          created_at: string
          custom_bouquet_data: Json | null
          id: string
          price: number | null
          product_id: string | null
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_bouquet_data?: Json | null
          id?: string
          price?: number | null
          product_id?: string | null
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_bouquet_data?: Json | null
          id?: string
          price?: number | null
          product_id?: string | null
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          maximum_discount: number | null
          minimum_amount: number | null
          type: string
          usage_limit: number | null
          used_count: number | null
          value: number
        }
        Insert: {
          code: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          maximum_discount?: number | null
          minimum_amount?: number | null
          type: string
          usage_limit?: number | null
          used_count?: number | null
          value: number
        }
        Update: {
          code?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          maximum_discount?: number | null
          minimum_amount?: number | null
          type?: string
          usage_limit?: number | null
          used_count?: number | null
          value?: number
        }
        Relationships: []
      }
      custom_bouquets: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          design_data: Json
          id: string
          is_public: boolean | null
          name: string
          occasion: string | null
          price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          design_data: Json
          id?: string
          is_public?: boolean | null
          name: string
          occasion?: string | null
          price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          design_data?: Json
          id?: string
          is_public?: boolean | null
          name?: string
          occasion?: string | null
          price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          custom_bouquet_data: Json | null
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          custom_bouquet_data?: Json | null
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          custom_bouquet_data?: Json | null
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_tracking: {
        Row: {
          coordinates: Json | null
          created_at: string
          description: string | null
          id: string
          location: Json | null
          order_id: string
          status: string
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          location?: Json | null
          order_id: string
          status: string
        }
        Update: {
          coordinates?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          location?: Json | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billing_address: Json | null
          created_at: string
          currency: string
          delivered_at: string | null
          delivery_address: Json
          delivery_date: string | null
          delivery_time_slot: string | null
          discount_amount: number | null
          estimated_delivery: string | null
          gift_message: string | null
          id: string
          order_number: string
          payment_method: string | null
          payment_status: string | null
          shipping_amount: number | null
          special_instructions: string | null
          status: string
          subtotal: number
          tax_amount: number | null
          total_amount: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_address?: Json | null
          created_at?: string
          currency?: string
          delivered_at?: string | null
          delivery_address: Json
          delivery_date?: string | null
          delivery_time_slot?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          gift_message?: string | null
          id?: string
          order_number: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_amount?: number | null
          special_instructions?: string | null
          status?: string
          subtotal: number
          tax_amount?: number | null
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_address?: Json | null
          created_at?: string
          currency?: string
          delivered_at?: string | null
          delivery_address?: Json
          delivery_date?: string | null
          delivery_time_slot?: string | null
          discount_amount?: number | null
          estimated_delivery?: string | null
          gift_message?: string | null
          id?: string
          order_number?: string
          payment_method?: string | null
          payment_status?: string | null
          shipping_amount?: number | null
          special_instructions?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          care_instructions: string | null
          category: string
          colors: Json | null
          created_at: string
          description: string | null
          dimensions: Json | null
          id: string
          images: Json | null
          is_active: boolean | null
          is_featured: boolean | null
          is_new: boolean | null
          name: string
          occasions: Json | null
          original_price: number | null
          price: number
          rating: number | null
          review_count: number | null
          sizes: Json | null
          sku: string | null
          stock_quantity: number
          updated_at: string
          weight: number | null
        }
        Insert: {
          care_instructions?: string | null
          category: string
          colors?: Json | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          name: string
          occasions?: Json | null
          original_price?: number | null
          price: number
          rating?: number | null
          review_count?: number | null
          sizes?: Json | null
          sku?: string | null
          stock_quantity?: number
          updated_at?: string
          weight?: number | null
        }
        Update: {
          care_instructions?: string | null
          category?: string
          colors?: Json | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          is_new?: boolean | null
          name?: string
          occasions?: Json | null
          original_price?: number | null
          price?: number
          rating?: number | null
          review_count?: number | null
          sizes?: Json | null
          sku?: string | null
          stock_quantity?: number
          updated_at?: string
          weight?: number | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_count: number | null
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
          verified_purchase: boolean | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
          verified_purchase?: boolean | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
          verified_purchase?: boolean | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          email_verified: boolean
          first_name: string | null
          id: string
          is_active: boolean
          last_name: string | null
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          email_verified?: boolean
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          email_verified?: boolean
          first_name?: string | null
          id?: string
          is_active?: boolean
          last_name?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
