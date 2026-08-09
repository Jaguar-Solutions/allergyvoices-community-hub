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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      restaurant_badges: {
        Row: {
          awarded_at: string
          awarded_by: string | null
          badge_key: string
          expires_at: string | null
          id: string
          metadata: Json
          restaurant_id: string
        }
        Insert: {
          awarded_at?: string
          awarded_by?: string | null
          badge_key: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          restaurant_id: string
        }
        Update: {
          awarded_at?: string
          awarded_by?: string | null
          badge_key?: string
          expires_at?: string | null
          id?: string
          metadata?: Json
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_badges_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_claims: {
        Row: {
          claimant_email: string
          claimant_id: string | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          id: string
          note: string | null
          restaurant_id: string
          status: string
        }
        Insert: {
          claimant_email: string
          claimant_id?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          note?: string | null
          restaurant_id: string
          status?: string
        }
        Update: {
          claimant_email?: string
          claimant_id?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          id?: string
          note?: string | null
          restaurant_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_claims_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_contacts: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          manager_email: string
          manager_name: string | null
          phone: string | null
          position: string | null
          restaurant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          manager_email: string
          manager_name?: string | null
          phone?: string | null
          position?: string | null
          restaurant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          manager_email?: string
          manager_name?: string | null
          phone?: string | null
          position?: string | null
          restaurant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_contacts_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_events: {
        Row: {
          actor_id: string | null
          actor_type: string
          created_at: string
          event_type: string
          id: string
          note: string | null
          payload: Json
          restaurant_id: string
        }
        Insert: {
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          event_type: string
          id?: string
          note?: string | null
          payload?: Json
          restaurant_id: string
        }
        Update: {
          actor_id?: string | null
          actor_type?: string
          created_at?: string
          event_type?: string
          id?: string
          note?: string | null
          payload?: Json
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_events_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_interests: {
        Row: {
          created_at: string
          requested_at: string
          restaurant_id: string
          updated_at: string
          wants_best_practices_guide: boolean
          wants_menu_help: boolean
          wants_updates: boolean
        }
        Insert: {
          created_at?: string
          requested_at?: string
          restaurant_id: string
          updated_at?: string
          wants_best_practices_guide?: boolean
          wants_menu_help?: boolean
          wants_updates?: boolean
        }
        Update: {
          created_at?: string
          requested_at?: string
          restaurant_id?: string
          updated_at?: string
          wants_best_practices_guide?: boolean
          wants_menu_help?: boolean
          wants_updates?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_interests_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: true
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_reports: {
        Row: {
          created_at: string
          email_error: string | null
          email_sent_at: string | null
          email_status: string
          email_to: string | null
          engine_version: number
          generated_at: string
          generated_by: string | null
          id: string
          next_steps: Json
          pdf_bytes: number | null
          pdf_path: string | null
          recommendations: Json
          restaurant_id: string
          strengths: Json
          submission_id: string | null
          survey_schema_version: number | null
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          email_error?: string | null
          email_sent_at?: string | null
          email_status?: string
          email_to?: string | null
          engine_version: number
          generated_at?: string
          generated_by?: string | null
          id?: string
          next_steps?: Json
          pdf_bytes?: number | null
          pdf_path?: string | null
          recommendations?: Json
          restaurant_id: string
          strengths?: Json
          submission_id?: string | null
          survey_schema_version?: number | null
          updated_at?: string
          version: number
        }
        Update: {
          created_at?: string
          email_error?: string | null
          email_sent_at?: string | null
          email_status?: string
          email_to?: string | null
          engine_version?: number
          generated_at?: string
          generated_by?: string | null
          id?: string
          next_steps?: Json
          pdf_bytes?: number | null
          pdf_path?: string | null
          recommendations?: Json
          restaurant_id?: string
          strengths?: Json
          submission_id?: string | null
          survey_schema_version?: number | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_reports_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_reports_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "restaurant_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_submissions: {
        Row: {
          answers: Json
          client_submission_id: string | null
          id: string
          restaurant_id: string
          schema_version: number
          source: Database["public"]["Enums"]["restaurant_submission_source"]
          submitted_at: string
          submitted_by: string | null
          version: number
        }
        Insert: {
          answers: Json
          client_submission_id?: string | null
          id?: string
          restaurant_id: string
          schema_version?: number
          source?: Database["public"]["Enums"]["restaurant_submission_source"]
          submitted_at?: string
          submitted_by?: string | null
          version: number
        }
        Update: {
          answers?: Json
          client_submission_id?: string | null
          id?: string
          restaurant_id?: string
          schema_version?: number
          source?: Database["public"]["Enums"]["restaurant_submission_source"]
          submitted_at?: string
          submitted_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_submissions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string
          claim_status: Database["public"]["Enums"]["restaurant_claim_status"]
          claimed_at: string | null
          claimed_by: string | null
          country: string
          created_at: string
          cuisine: string[]
          facets: Json
          id: string
          information_current_as_of: string | null
          latitude: number | null
          listing_source: Database["public"]["Enums"]["restaurant_listing_source"]
          longitude: number | null
          name: string
          phone: string | null
          postal_code: string | null
          publish_consent: Database["public"]["Enums"]["restaurant_publish_consent"]
          published_at: string | null
          published_submission_id: string | null
          slug: string | null
          state: string
          status: Database["public"]["Enums"]["restaurant_status"]
          submitted_at: string
          updated_at: string
          wants_website_badge: boolean
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city: string
          claim_status?: Database["public"]["Enums"]["restaurant_claim_status"]
          claimed_at?: string | null
          claimed_by?: string | null
          country?: string
          created_at?: string
          cuisine?: string[]
          facets?: Json
          id?: string
          information_current_as_of?: string | null
          latitude?: number | null
          listing_source?: Database["public"]["Enums"]["restaurant_listing_source"]
          longitude?: number | null
          name: string
          phone?: string | null
          postal_code?: string | null
          publish_consent?: Database["public"]["Enums"]["restaurant_publish_consent"]
          published_at?: string | null
          published_submission_id?: string | null
          slug?: string | null
          state: string
          status?: Database["public"]["Enums"]["restaurant_status"]
          submitted_at?: string
          updated_at?: string
          wants_website_badge?: boolean
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string
          claim_status?: Database["public"]["Enums"]["restaurant_claim_status"]
          claimed_at?: string | null
          claimed_by?: string | null
          country?: string
          created_at?: string
          cuisine?: string[]
          facets?: Json
          id?: string
          information_current_as_of?: string | null
          latitude?: number | null
          listing_source?: Database["public"]["Enums"]["restaurant_listing_source"]
          longitude?: number | null
          name?: string
          phone?: string | null
          postal_code?: string | null
          publish_consent?: Database["public"]["Enums"]["restaurant_publish_consent"]
          published_at?: string | null
          published_submission_id?: string | null
          slug?: string | null
          state?: string
          status?: Database["public"]["Enums"]["restaurant_status"]
          submitted_at?: string
          updated_at?: string
          wants_website_badge?: boolean
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_published_submission_fk"
            columns: ["published_submission_id"]
            isOneToOne: false
            referencedRelation: "restaurant_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "moderator" | "user"
      restaurant_claim_status: "unclaimed" | "pending" | "claimed"
      restaurant_listing_source: "self_submitted" | "admin_entered"
      restaurant_publish_consent: "yes" | "yes_contact_first" | "no"
      restaurant_status:
        | "submitted"
        | "in_review"
        | "changes_requested"
        | "published"
        | "hidden"
        | "declined"
      restaurant_submission_source: "web_form" | "owner_update" | "admin_edit"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      restaurant_claim_status: ["unclaimed", "pending", "claimed"],
      restaurant_listing_source: ["self_submitted", "admin_entered"],
      restaurant_publish_consent: ["yes", "yes_contact_first", "no"],
      restaurant_status: [
        "submitted",
        "in_review",
        "changes_requested",
        "published",
        "hidden",
        "declined",
      ],
      restaurant_submission_source: ["web_form", "owner_update", "admin_edit"],
    },
  },
} as const
