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
      admins: {
        Row: {
          user_id: string
        }
        Insert: {
          user_id: string
        }
        Update: {
          user_id?: string
        }
        Relationships: []
      }
      gols: {
        Row: {
          assistente_id: number | null
          autor_id: number
          created_at: string
          id: number
          rodada_id: number
        }
        Insert: {
          assistente_id?: number | null
          autor_id: number
          created_at?: string
          id?: never
          rodada_id: number
        }
        Update: {
          assistente_id?: number | null
          autor_id?: number
          created_at?: string
          id?: never
          rodada_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "gols_assistente_fkey"
            columns: ["assistente_id"]
            isOneToOne: false
            referencedRelation: "jogadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gols_assistente_presente_fkey"
            columns: ["rodada_id", "assistente_id"]
            isOneToOne: false
            referencedRelation: "presencas"
            referencedColumns: ["rodada_id", "jogador_id"]
          },
          {
            foreignKeyName: "gols_autor_fkey"
            columns: ["autor_id"]
            isOneToOne: false
            referencedRelation: "jogadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gols_autor_presente_fkey"
            columns: ["rodada_id", "autor_id"]
            isOneToOne: false
            referencedRelation: "presencas"
            referencedColumns: ["rodada_id", "jogador_id"]
          },
          {
            foreignKeyName: "gols_rodada_id_fkey"
            columns: ["rodada_id"]
            isOneToOne: false
            referencedRelation: "rodadas"
            referencedColumns: ["id"]
          },
        ]
      }
      jogadores: {
        Row: {
          apelido: string | null
          ativo: boolean
          created_at: string
          id: number
          nome: string
        }
        Insert: {
          apelido?: string | null
          ativo?: boolean
          created_at?: string
          id?: never
          nome: string
        }
        Update: {
          apelido?: string | null
          ativo?: boolean
          created_at?: string
          id?: never
          nome?: string
        }
        Relationships: []
      }
      niveis: {
        Row: {
          jogador_id: number
          nivel: number
        }
        Insert: {
          jogador_id: number
          nivel: number
        }
        Update: {
          jogador_id?: number
          nivel?: number
        }
        Relationships: [
          {
            foreignKeyName: "niveis_jogador_id_fkey"
            columns: ["jogador_id"]
            isOneToOne: true
            referencedRelation: "jogadores"
            referencedColumns: ["id"]
          },
        ]
      }
      presencas: {
        Row: {
          jogador_id: number
          rodada_id: number
        }
        Insert: {
          jogador_id: number
          rodada_id: number
        }
        Update: {
          jogador_id?: number
          rodada_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "presencas_jogador_id_fkey"
            columns: ["jogador_id"]
            isOneToOne: false
            referencedRelation: "jogadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_rodada_id_fkey"
            columns: ["rodada_id"]
            isOneToOne: false
            referencedRelation: "rodadas"
            referencedColumns: ["id"]
          },
        ]
      }
      rodadas: {
        Row: {
          data: string
          id: number
        }
        Insert: {
          data: string
          id?: never
        }
        Update: {
          data?: string
          id?: never
        }
        Relationships: []
      }
      sorteios: {
        Row: {
          jogador_id: number
          rodada_id: number
          time: number
        }
        Insert: {
          jogador_id: number
          rodada_id: number
          time: number
        }
        Update: {
          jogador_id?: number
          rodada_id?: number
          time?: number
        }
        Relationships: [
          {
            foreignKeyName: "sorteios_jogador_fkey"
            columns: ["jogador_id"]
            isOneToOne: false
            referencedRelation: "jogadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorteios_rodada_fkey"
            columns: ["rodada_id"]
            isOneToOne: false
            referencedRelation: "rodadas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sorteios_rodada_id_jogador_id_fkey"
            columns: ["rodada_id", "jogador_id"]
            isOneToOne: true
            referencedRelation: "presencas"
            referencedColumns: ["rodada_id", "jogador_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      ranking: {
        Args: { fim?: string; inicio?: string }
        Returns: {
          apelido: string
          assistencias: number
          gols: number
          jogador_id: number
          nome: string
        }[]
      }
      salvar_sorteio: {
        Args: { rodada: number; times: Json }
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
    Enums: {},
  },
} as const
