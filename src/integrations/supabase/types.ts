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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_matches: {
        Row: {
          created_at: string
          detection_id: string | null
          donation_id: string | null
          id: string
          match_score: number | null
          recommendation: string
          status: string
        }
        Insert: {
          created_at?: string
          detection_id?: string | null
          donation_id?: string | null
          id?: string
          match_score?: number | null
          recommendation: string
          status?: string
        }
        Update: {
          created_at?: string
          detection_id?: string | null
          donation_id?: string | null
          id?: string
          match_score?: number | null
          recommendation?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_matches_detection_id_fkey"
            columns: ["detection_id"]
            isOneToOne: false
            referencedRelation: "urban_detections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_matches_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      classifications: {
        Row: {
          all_predictions: Json | null
          confidence: number
          created_at: string
          id: string
          image_url: string | null
          model_used: string | null
          predicted_class: string
          user_id: string
        }
        Insert: {
          all_predictions?: Json | null
          confidence: number
          created_at?: string
          id?: string
          image_url?: string | null
          model_used?: string | null
          predicted_class: string
          user_id: string
        }
        Update: {
          all_predictions?: Json | null
          confidence?: number
          created_at?: string
          id?: string
          image_url?: string | null
          model_used?: string | null
          predicted_class?: string
          user_id?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          category: string
          condition: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          lat: number | null
          lng: number | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          condition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          lat?: number | null
          lng?: number | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          condition?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          lat?: number | null
          lng?: number | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      missing_cases: {
        Row: {
          age: string | null
          case_type: string
          created_at: string
          description: string | null
          gender: string | null
          id: string
          last_seen: string
          name: string
          national_id: string | null
          phone: string | null
          photo_url: string | null
          reported_at: string
          status: string
          updated_at: string
          user_id: string
          video_url: string | null
        }
        Insert: {
          age?: string | null
          case_type?: string
          created_at?: string
          description?: string | null
          gender?: string | null
          id?: string
          last_seen: string
          name: string
          national_id?: string | null
          phone?: string | null
          photo_url?: string | null
          reported_at?: string
          status?: string
          updated_at?: string
          user_id: string
          video_url?: string | null
        }
        Update: {
          age?: string | null
          case_type?: string
          created_at?: string
          description?: string | null
          gender?: string | null
          id?: string
          last_seen?: string
          name?: string
          national_id?: string | null
          phone?: string | null
          photo_url?: string | null
          reported_at?: string
          status?: string
          updated_at?: string
          user_id?: string
          video_url?: string | null
        }
        Relationships: []
      }
      urban_alerts: {
        Row: {
          acknowledged: boolean | null
          alert_type: string
          created_at: string
          detection_id: string | null
          id: string
          message: string
          severity: string
        }
        Insert: {
          acknowledged?: boolean | null
          alert_type: string
          created_at?: string
          detection_id?: string | null
          id?: string
          message: string
          severity?: string
        }
        Update: {
          acknowledged?: boolean | null
          alert_type?: string
          created_at?: string
          detection_id?: string | null
          id?: string
          message?: string
          severity?: string
        }
        Relationships: [
          {
            foreignKeyName: "urban_alerts_detection_id_fkey"
            columns: ["detection_id"]
            isOneToOne: false
            referencedRelation: "urban_detections"
            referencedColumns: ["id"]
          },
        ]
      }
      urban_detections: {
        Row: {
          confidence: number
          created_at: string
          description: string | null
          detection_type: string
          id: string
          image_url: string | null
          lat: number
          lng: number
          metadata: Json | null
          severity: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          description?: string | null
          detection_type: string
          id?: string
          image_url?: string | null
          lat: number
          lng: number
          metadata?: Json | null
          severity?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          description?: string | null
          detection_type?: string
          id?: string
          image_url?: string | null
          lat?: number
          lng?: number
          metadata?: Json | null
          severity?: string
          status?: string
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
