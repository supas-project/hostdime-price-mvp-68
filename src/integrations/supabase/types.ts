export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      contract_types: {
        Row: {
          contract_id: string
          created_at: string
          description: string | null
          discount_percentage: number
          duration_months: number
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          contract_id: string
          created_at?: string
          description?: string | null
          discount_percentage?: number
          duration_months: number
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          contract_id?: string
          created_at?: string
          description?: string | null
          discount_percentage?: number
          duration_months?: number
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      contracts: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          discount_percentage: number
          duration_months: number
          id: string
          min_commitment: number | null
          payback_factor: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          discount_percentage?: number
          duration_months: number
          id?: string
          min_commitment?: number | null
          payback_factor: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          discount_percentage?: number
          duration_months?: number
          id?: string
          min_commitment?: number | null
          payback_factor?: number
        }
        Relationships: []
      }
      datacenters: {
        Row: {
          badge: string | null
          certifications: Json | null
          created_at: string
          datacenter_id: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          location: string
          name: string
          price: number | null
          region: string | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          certifications?: Json | null
          created_at?: string
          datacenter_id: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          location: string
          name: string
          price?: number | null
          region?: string | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          certifications?: Json | null
          created_at?: string
          datacenter_id?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          location?: string
          name?: string
          price?: number | null
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      price_data: {
        Row: {
          created_at: string | null
          data: Json
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data: Json
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data?: Json
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      price_data_updates: {
        Row: {
          details: string | null
          id: string
          initiator: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          details?: string | null
          id?: string
          initiator?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          details?: string | null
          id?: string
          initiator?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          active: boolean
          conditions: Json
          created_at: string
          factor: number
          id: string
          name: string
          priority: number
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          conditions: Json
          created_at?: string
          factor: number
          id?: string
          name: string
          priority?: number
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          conditions?: Json
          created_at?: string
          factor?: number
          id?: string
          name?: string
          priority?: number
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          nome_completo: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          nome_completo?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          nome_completo?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          item_id: string
          item_type: string
          name: string
          payback_applied: boolean
          payback_factor: number | null
          quantity: number
          quote_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          item_id: string
          item_type: string
          name: string
          payback_applied?: boolean
          payback_factor?: number | null
          quantity?: number
          quote_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          item_id?: string
          item_type?: string
          name?: string
          payback_applied?: boolean
          payback_factor?: number | null
          quantity?: number
          quote_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quote_templates: {
        Row: {
          company_logo: string | null
          created_at: string
          description: string | null
          footer_text: string | null
          header_text: string | null
          id: string
          name: string
          show_breakdown: boolean
          show_payback: boolean
          terms_conditions: string | null
          updated_at: string
          validity_days: number
        }
        Insert: {
          company_logo?: string | null
          created_at?: string
          description?: string | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          name: string
          show_breakdown?: boolean
          show_payback?: boolean
          terms_conditions?: string | null
          updated_at?: string
          validity_days?: number
        }
        Update: {
          company_logo?: string | null
          created_at?: string
          description?: string | null
          footer_text?: string | null
          header_text?: string | null
          id?: string
          name?: string
          show_breakdown?: boolean
          show_payback?: boolean
          terms_conditions?: string | null
          updated_at?: string
          validity_days?: number
        }
        Relationships: []
      }
      quotes: {
        Row: {
          approved_at: string | null
          configuration: Json
          contract_duration: number
          created_at: string
          customer_email: string | null
          customer_name: string | null
          data_center_id: string
          discounts: number
          expires_at: string
          id: string
          margin_percentage: number | null
          monthly_total: number | null
          notes: string | null
          payback_total: number | null
          quote_number: string | null
          sent_at: string | null
          status: string
          subtotal: number
          taxes: number
          total_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          approved_at?: string | null
          configuration: Json
          contract_duration?: number
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          data_center_id: string
          discounts?: number
          expires_at: string
          id?: string
          margin_percentage?: number | null
          monthly_total?: number | null
          notes?: string | null
          payback_total?: number | null
          quote_number?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          taxes?: number
          total_price?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          approved_at?: string | null
          configuration?: Json
          contract_duration?: number
          created_at?: string
          customer_email?: string | null
          customer_name?: string | null
          data_center_id?: string
          discounts?: number
          expires_at?: string
          id?: string
          margin_percentage?: number | null
          monthly_total?: number | null
          notes?: string | null
          payback_total?: number | null
          quote_number?: string | null
          sent_at?: string | null
          status?: string
          subtotal?: number
          taxes?: number
          total_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      storage_items: {
        Row: {
          capacity_gb: number | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          item_type: string
          metadata: Json | null
          name: string
          price: number
          specs: Json | null
          storage_type: string
          updated_at: string | null
        }
        Insert: {
          capacity_gb?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          item_type: string
          metadata?: Json | null
          name: string
          price?: number
          specs?: Json | null
          storage_type: string
          updated_at?: string | null
        }
        Update: {
          capacity_gb?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          item_type?: string
          metadata?: Json | null
          name?: string
          price?: number
          specs?: Json | null
          storage_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_components: {
        Row: {
          component_id: string
          component_type: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          is_hardware: boolean | null
          metadata: Json | null
          name: string
          price: number
          specs: Json | null
          subtype: string | null
          updated_at: string
        }
        Insert: {
          component_id: string
          component_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_hardware?: boolean | null
          metadata?: Json | null
          name: string
          price?: number
          specs?: Json | null
          subtype?: string | null
          updated_at?: string
        }
        Update: {
          component_id?: string
          component_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_hardware?: boolean | null
          metadata?: Json | null
          name?: string
          price?: number
          specs?: Json | null
          subtype?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_quote_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
