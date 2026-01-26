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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_activity_logs: {
        Row: {
          action_type: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action_type: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action_type?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string | null
          custom_signature: string | null
          department: Database["public"]["Enums"]["admin_department"]
          display_name: string | null
          id: string
          is_active: boolean | null
          signature_type: Database["public"]["Enums"]["signature_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_signature?: string | null
          department?: Database["public"]["Enums"]["admin_department"]
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          signature_type?: Database["public"]["Enums"]["signature_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_signature?: string | null
          department?: Database["public"]["Enums"]["admin_department"]
          display_name?: string | null
          id?: string
          is_active?: boolean | null
          signature_type?: Database["public"]["Enums"]["signature_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      affiliate_clicks: {
        Row: {
          category: string
          component: string | null
          created_at: string
          destination: string | null
          id: string
          origin: string | null
          partner_id: string
          partner_name: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          component?: string | null
          created_at?: string
          destination?: string | null
          id?: string
          origin?: string | null
          partner_id: string
          partner_name: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          component?: string | null
          created_at?: string
          destination?: string | null
          id?: string
          origin?: string | null
          partner_id?: string
          partner_name?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      customer_notes: {
        Row: {
          created_at: string
          created_by: string
          id: string
          note: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          note: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          note?: string
          user_id?: string
        }
        Relationships: []
      }
      customer_tag_assignments: {
        Row: {
          assigned_at: string
          id: string
          tag_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          tag_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "customer_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      flight_price_cache: {
        Row: {
          airline: string | null
          airline_name: string | null
          created_at: string | null
          departure_at: string | null
          destination_code: string
          destination_name: string
          flight_number: string | null
          id: string
          is_domestic: boolean | null
          link: string | null
          origin_code: string
          price: number
          return_at: string | null
          transfers: number | null
          updated_at: string | null
        }
        Insert: {
          airline?: string | null
          airline_name?: string | null
          created_at?: string | null
          departure_at?: string | null
          destination_code: string
          destination_name: string
          flight_number?: string | null
          id?: string
          is_domestic?: boolean | null
          link?: string | null
          origin_code: string
          price: number
          return_at?: string | null
          transfers?: number | null
          updated_at?: string | null
        }
        Update: {
          airline?: string | null
          airline_name?: string | null
          created_at?: string | null
          departure_at?: string | null
          destination_code?: string
          destination_name?: string
          flight_number?: string | null
          id?: string
          is_domestic?: boolean | null
          link?: string | null
          origin_code?: string
          price?: number
          return_at?: string | null
          transfers?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      hotmart_products: {
        Row: {
          created_at: string
          credits_to_add: number | null
          hotmart_product_id: string
          id: string
          is_active: boolean
          name: string
          product_ucode: string | null
          subscription_days: number | null
          subscription_type: string | null
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          created_at?: string
          credits_to_add?: number | null
          hotmart_product_id: string
          id?: string
          is_active?: boolean
          name: string
          product_ucode?: string | null
          subscription_days?: number | null
          subscription_type?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          created_at?: string
          credits_to_add?: number | null
          hotmart_product_id?: string
          id?: string
          is_active?: boolean
          name?: string
          product_ucode?: string | null
          subscription_days?: number | null
          subscription_type?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      hotmart_purchases: {
        Row: {
          amount: number | null
          buyer_email: string
          buyer_name: string | null
          buyer_phone: string | null
          created_at: string
          currency: string | null
          event_type: string
          hotmart_product_id: string
          hotmart_transaction_id: string
          id: string
          raw_data: Json | null
          status: string
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          buyer_email: string
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string
          currency?: string | null
          event_type: string
          hotmart_product_id: string
          hotmart_transaction_id: string
          id?: string
          raw_data?: Json | null
          status?: string
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          buyer_email?: string
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string
          currency?: string | null
          event_type?: string
          hotmart_product_id?: string
          hotmart_transaction_id?: string
          id?: string
          raw_data?: Json | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      integration_settings: {
        Row: {
          created_at: string
          id: string
          integration_name: string
          is_active: boolean
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          integration_name: string
          is_active?: boolean
          settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          integration_name?: string
          is_active?: boolean
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      landing_leads: {
        Row: {
          converted: boolean | null
          created_at: string | null
          email: string
          id: string
          name: string | null
          phone: string | null
          source: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          converted?: boolean | null
          created_at?: string | null
          email: string
          id?: string
          name?: string | null
          phone?: string | null
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          converted?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          source?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          channel: string
          created_at: string
          email: string | null
          error_message: string | null
          id: string
          message_content: string | null
          phone: string | null
          sent_at: string | null
          status: string
          template_name: string | null
          type: string
          user_id: string | null
          variables: Json | null
        }
        Insert: {
          channel?: string
          created_at?: string
          email?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          phone?: string | null
          sent_at?: string | null
          status?: string
          template_name?: string | null
          type: string
          user_id?: string | null
          variables?: Json | null
        }
        Update: {
          channel?: string
          created_at?: string
          email?: string | null
          error_message?: string | null
          id?: string
          message_content?: string | null
          phone?: string | null
          sent_at?: string | null
          status?: string
          template_name?: string | null
          type?: string
          user_id?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      places_cache: {
        Row: {
          address: string | null
          created_at: string
          expires_at: string
          foursquare_categories: Json | null
          foursquare_features: Json | null
          foursquare_id: string | null
          foursquare_rating: number | null
          foursquare_tastes: string[] | null
          foursquare_tips: Json | null
          google_maps_url: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          name: string | null
          photo_reference: string | null
          place_id: string | null
          rating: number | null
          search_query: string
          user_ratings_total: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          expires_at?: string
          foursquare_categories?: Json | null
          foursquare_features?: Json | null
          foursquare_id?: string | null
          foursquare_rating?: number | null
          foursquare_tastes?: string[] | null
          foursquare_tips?: Json | null
          google_maps_url?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          name?: string | null
          photo_reference?: string | null
          place_id?: string | null
          rating?: number | null
          search_query: string
          user_ratings_total?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string
          expires_at?: string
          foursquare_categories?: Json | null
          foursquare_features?: Json | null
          foursquare_id?: string | null
          foursquare_rating?: number | null
          foursquare_tastes?: string[] | null
          foursquare_tips?: Json | null
          google_maps_url?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          name?: string | null
          photo_reference?: string | null
          place_id?: string | null
          rating?: number | null
          search_query?: string
          user_ratings_total?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_itineraries: {
        Row: {
          created_at: string
          destinations: string[] | null
          duration: string | null
          id: string
          itinerary_data: Json
          summary: string | null
          title: string
          total_budget: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destinations?: string[] | null
          duration?: string | null
          id?: string
          itinerary_data: Json
          summary?: string | null
          title: string
          total_budget?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destinations?: string[] | null
          duration?: string | null
          id?: string
          itinerary_data?: Json
          summary?: string | null
          title?: string
          total_budget?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_preferences: {
        Row: {
          created_at: string
          id: string
          preferences: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preferences: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preferences?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          credits_added: number | null
          id: string
          mp_payment_id: string | null
          mp_preference_id: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          credits_added?: number | null
          id?: string
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          credits_added?: number | null
          id?: string
          mp_payment_id?: string | null
          mp_preference_id?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          chat_messages_reset_at: string | null
          chat_messages_used: number
          created_at: string
          free_itineraries_used: number
          id: string
          paid_credits: number
          subscription_expires_at: string | null
          subscription_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chat_messages_reset_at?: string | null
          chat_messages_used?: number
          created_at?: string
          free_itineraries_used?: number
          id?: string
          paid_credits?: number
          subscription_expires_at?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chat_messages_reset_at?: string | null
          chat_messages_used?: number
          created_at?: string
          free_itineraries_used?: number
          id?: string
          paid_credits?: number
          subscription_expires_at?: string | null
          subscription_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_messages: {
        Row: {
          content: string | null
          created_at: string
          direction: string
          id: string
          media_url: string | null
          message_id: string | null
          message_type: string
          phone: string
          sender_name: string | null
          sender_photo: string | null
          status: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          direction: string
          id?: string
          media_url?: string | null
          message_id?: string | null
          message_type?: string
          phone: string
          sender_name?: string | null
          sender_photo?: string | null
          status?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          direction?: string
          id?: string
          media_url?: string | null
          message_id?: string | null
          message_type?: string
          phone?: string
          sender_name?: string | null
          sender_photo?: string | null
          status?: string
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          content: string
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          content: string
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      admin_department:
        | "suporte"
        | "vendas"
        | "administracao"
        | "financeiro"
        | "marketing"
      app_role: "admin" | "moderator" | "user"
      signature_type: "department" | "personal"
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
    Enums: {
      admin_department: [
        "suporte",
        "vendas",
        "administracao",
        "financeiro",
        "marketing",
      ],
      app_role: ["admin", "moderator", "user"],
      signature_type: ["department", "personal"],
    },
  },
} as const
