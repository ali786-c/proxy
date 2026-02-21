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
      api_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          key_name: string
          last_used_at: string | null
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean
          key_name?: string
          last_used_at?: string | null
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          key_name?: string
          last_used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          geo_city: string | null
          geo_country: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          geo_city?: string | null
          geo_country?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          geo_city?: string | null
          geo_country?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_amount: number | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          used_count?: number
        }
        Relationships: []
      }
      custom_proxy_domains: {
        Row: {
          created_at: string
          dns_txt_record: string | null
          dns_verified: boolean
          domain: string
          id: string
          is_active: boolean
          proxy_type: string
          ssl_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dns_txt_record?: string | null
          dns_verified?: boolean
          domain: string
          id?: string
          is_active?: boolean
          proxy_type: string
          ssl_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dns_txt_record?: string | null
          dns_verified?: boolean
          domain?: string
          id?: string
          is_active?: boolean
          proxy_type?: string
          ssl_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      fraud_signals: {
        Row: {
          created_at: string
          description: string | null
          geo_city: string | null
          geo_country: string | null
          id: string
          ip_address: string | null
          is_resolved: boolean
          metadata: Json | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          signal_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          geo_city?: string | null
          geo_country?: string | null
          id?: string
          ip_address?: string | null
          is_resolved?: boolean
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          signal_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          geo_city?: string | null
          geo_country?: string | null
          id?: string
          ip_address?: string | null
          is_resolved?: boolean
          metadata?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          signal_type?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          currency: string
          gateway: Database["public"]["Enums"]["payment_gateway"] | null
          gateway_payment_id: string | null
          id: string
          invoice_number: string
          order_id: string | null
          paid_at: string | null
          pdf_url: string | null
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          gateway?: Database["public"]["Enums"]["payment_gateway"] | null
          gateway_payment_id?: string | null
          id?: string
          invoice_number: string
          order_id?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          gateway?: Database["public"]["Enums"]["payment_gateway"] | null
          gateway_payment_id?: string | null
          id?: string
          invoice_number?: string
          order_id?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      login_history: {
        Row: {
          created_at: string
          geo_city: string | null
          geo_country: string | null
          id: string
          ip_address: string | null
          success: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          geo_city?: string | null
          geo_country?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          geo_city?: string | null
          geo_country?: string | null
          id?: string
          ip_address?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          product_id: string | null
          proxy_config: Json | null
          proxy_type: string | null
          quantity: number
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          product_id?: string | null
          proxy_config?: Json | null
          proxy_type?: string | null
          quantity?: number
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          product_id?: string | null
          proxy_config?: Json | null
          proxy_type?: string | null
          quantity?: number
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      org_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_invites_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          department: string | null
          id: string
          joined_at: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          department?: string | null
          id?: string
          joined_at?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          department?: string | null
          id?: string
          joined_at?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          avatar_url: string | null
          billing_email: string | null
          created_at: string
          id: string
          name: string
          owner_id: string
          slug: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          billing_email?: string | null
          created_at?: string
          id?: string
          name: string
          owner_id: string
          slug: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          billing_email?: string | null
          created_at?: string
          id?: string
          name?: string
          owner_id?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number | null
          created_at: string
          currency: string | null
          gateway: Database["public"]["Enums"]["payment_gateway"]
          gateway_event: string | null
          gateway_payload: Json | null
          id: string
          invoice_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          user_id: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          gateway: Database["public"]["Enums"]["payment_gateway"]
          gateway_event?: string | null
          gateway_payload?: Json | null
          id?: string
          invoice_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string
          currency?: string | null
          gateway?: Database["public"]["Enums"]["payment_gateway"]
          gateway_event?: string | null
          gateway_payload?: Json | null
          id?: string
          invoice_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          min_quantity: number
          name: string
          price_per_gb: number | null
          price_per_ip: number | null
          price_per_port: number | null
          proxy_type: string
          slug: string
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          min_quantity?: number
          name: string
          price_per_gb?: number | null
          price_per_ip?: number | null
          price_per_port?: number | null
          proxy_type: string
          slug: string
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          min_quantity?: number
          name?: string
          price_per_gb?: number | null
          price_per_ip?: number | null
          price_per_port?: number | null
          proxy_type?: string
          slug?: string
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          balance: number
          ban_reason: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_banned: boolean
          preferred_currency: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          balance?: number
          ban_reason?: string | null
          created_at?: string
          email: string
          full_name?: string
          id?: string
          is_banned?: boolean
          preferred_currency?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          balance?: number
          ban_reason?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_banned?: boolean
          preferred_currency?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reseller_clients: {
        Row: {
          client_user_id: string
          created_at: string
          id: string
          label: string | null
          reseller_id: string
        }
        Insert: {
          client_user_id: string
          created_at?: string
          id?: string
          label?: string | null
          reseller_id: string
        }
        Update: {
          client_user_id?: string
          created_at?: string
          id?: string
          label?: string | null
          reseller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reseller_clients_reseller_id_fkey"
            columns: ["reseller_id"]
            isOneToOne: false
            referencedRelation: "reseller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reseller_profiles: {
        Row: {
          brand_logo_url: string | null
          brand_primary_color: string | null
          brand_secondary_color: string | null
          commission_rate: number
          company_name: string
          created_at: string
          custom_domain: string | null
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_logo_url?: string | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          commission_rate?: number
          company_name: string
          created_at?: string
          custom_domain?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_logo_url?: string | null
          brand_primary_color?: string | null
          brand_secondary_color?: string | null
          commission_rate?: number
          company_name?: string
          created_at?: string
          custom_domain?: string | null
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_configs: {
        Row: {
          created_at: string
          credit_per_percent: number
          guaranteed_uptime: number
          id: string
          is_active: boolean
          measurement_window: string
          proxy_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          credit_per_percent?: number
          guaranteed_uptime?: number
          id?: string
          is_active?: boolean
          measurement_window?: string
          proxy_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          credit_per_percent?: number
          guaranteed_uptime?: number
          id?: string
          is_active?: boolean
          measurement_window?: string
          proxy_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      sla_credits: {
        Row: {
          actual_uptime: number
          applied_at: string | null
          created_at: string
          credit_amount: number
          guaranteed_uptime: number
          id: string
          order_id: string | null
          period_end: string
          period_start: string
          proxy_type: string
          status: string
          user_id: string
        }
        Insert: {
          actual_uptime: number
          applied_at?: string | null
          created_at?: string
          credit_amount?: number
          guaranteed_uptime: number
          id?: string
          order_id?: string | null
          period_end: string
          period_start: string
          proxy_type: string
          status?: string
          user_id: string
        }
        Update: {
          actual_uptime?: number
          applied_at?: string | null
          created_at?: string
          credit_amount?: number
          guaranteed_uptime?: number
          id?: string
          order_id?: string | null
          period_end?: string
          period_start?: string
          proxy_type?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sla_credits_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          created_at: string
          id: string
          message: string
          priority: string
          replied_at: string | null
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message: string
          priority?: string
          replied_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_reply?: string | null
          created_at?: string
          id?: string
          message?: string
          priority?: string
          replied_at?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      supported_currencies: {
        Row: {
          auto_detect_regions: string[] | null
          code: string
          exchange_rate: number
          id: string
          is_active: boolean
          name: string
          symbol: string
          updated_at: string
        }
        Insert: {
          auto_detect_regions?: string[] | null
          code: string
          exchange_rate?: number
          id?: string
          is_active?: boolean
          name: string
          symbol: string
          updated_at?: string
        }
        Update: {
          auto_detect_regions?: string[] | null
          code?: string
          exchange_rate?: number
          id?: string
          is_active?: boolean
          name?: string
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      uptime_records: {
        Row: {
          checked_at: string
          created_at: string
          id: string
          proxy_type: string
          region: string | null
          response_time_ms: number | null
          status: string
        }
        Insert: {
          checked_at?: string
          created_at?: string
          id?: string
          proxy_type: string
          region?: string | null
          response_time_ms?: number | null
          status?: string
        }
        Update: {
          checked_at?: string
          created_at?: string
          id?: string
          proxy_type?: string
          region?: string | null
          response_time_ms?: number | null
          status?: string
        }
        Relationships: []
      }
      usage_records: {
        Row: {
          billed: boolean
          bytes_used: number
          created_at: string
          id: string
          invoice_id: string | null
          order_id: string | null
          proxy_type: string
          recorded_at: string
          requests_count: number
          user_id: string
        }
        Insert: {
          billed?: boolean
          bytes_used?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          order_id?: string | null
          proxy_type: string
          recorded_at?: string
          requests_count?: number
          user_id: string
        }
        Update: {
          billed?: boolean
          bytes_used?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          order_id?: string | null
          proxy_type?: string
          recorded_at?: string
          requests_count?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_records_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_records_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_risk_scores: {
        Row: {
          created_at: string
          factors: Json | null
          id: string
          last_calculated_at: string
          risk_level: string
          risk_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          factors?: Json | null
          id?: string
          last_calculated_at?: string
          risk_level?: string
          risk_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          factors?: Json | null
          id?: string
          last_calculated_at?: string
          risk_level?: string
          risk_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_totp_secrets: {
        Row: {
          backup_codes: Json | null
          created_at: string
          encrypted_secret: string
          id: string
          is_enabled: boolean
          updated_at: string
          user_id: string
          verified_at: string | null
        }
        Insert: {
          backup_codes?: Json | null
          created_at?: string
          encrypted_secret: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          user_id: string
          verified_at?: string | null
        }
        Update: {
          backup_codes?: Json | null
          created_at?: string
          encrypted_secret?: string
          id?: string
          is_enabled?: boolean
          updated_at?: string
          user_id?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          source: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          payload?: Json
          source: string
          status?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          source?: string
          status?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_org_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["org_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "client"
      order_status: "pending" | "active" | "expired" | "cancelled" | "suspended"
      org_role: "owner" | "admin" | "member" | "viewer"
      payment_gateway: "stripe" | "paypal" | "crypto"
      payment_status: "pending" | "completed" | "failed" | "refunded"
      ticket_status: "open" | "in_progress" | "resolved" | "closed"
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
      app_role: ["admin", "client"],
      order_status: ["pending", "active", "expired", "cancelled", "suspended"],
      org_role: ["owner", "admin", "member", "viewer"],
      payment_gateway: ["stripe", "paypal", "crypto"],
      payment_status: ["pending", "completed", "failed", "refunded"],
      ticket_status: ["open", "in_progress", "resolved", "closed"],
    },
  },
} as const
