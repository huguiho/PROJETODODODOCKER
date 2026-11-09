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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      categorias: {
        Row: {
          ativo: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      configuracoes: {
        Row: {
          chave: string
          id: string
          updated_at: string
          valor: Json
        }
        Insert: {
          chave: string
          id?: string
          updated_at?: string
          valor: Json
        }
        Update: {
          chave?: string
          id?: string
          updated_at?: string
          valor?: Json
        }
        Relationships: []
      }
      itens_venda: {
        Row: {
          id: string
          preco_custo: number
          preco_unitario: number
          produto_id: string
          produto_nome: string
          quantidade: number
          subtotal: number
          venda_id: string
        }
        Insert: {
          id?: string
          preco_custo?: number
          preco_unitario: number
          produto_id: string
          produto_nome: string
          quantidade: number
          subtotal: number
          venda_id: string
        }
        Update: {
          id?: string
          preco_custo?: number
          preco_unitario?: number
          produto_id?: string
          produto_nome?: string
          quantidade?: number
          subtotal?: number
          venda_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itens_venda_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_venda_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_atividade: {
        Row: {
          created_at: string
          descricao: string
          id: string
          metadados: Json | null
          tipo: string
          usuario_id: string
          usuario_nome: string
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          metadados?: Json | null
          tipo: string
          usuario_id: string
          usuario_nome: string
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          metadados?: Json | null
          tipo?: string
          usuario_id?: string
          usuario_nome?: string
        }
        Relationships: []
      }
      movimentacoes_estoque: {
        Row: {
          created_at: string
          estoque_anterior: number
          estoque_novo: number
          id: string
          motivo: string | null
          produto_id: string
          produto_nome: string
          quantidade: number
          tipo: string
          usuario_id: string
          usuario_nome: string
          venda_id: string | null
        }
        Insert: {
          created_at?: string
          estoque_anterior: number
          estoque_novo: number
          id?: string
          motivo?: string | null
          produto_id: string
          produto_nome: string
          quantidade: number
          tipo: string
          usuario_id: string
          usuario_nome: string
          venda_id?: string | null
        }
        Update: {
          created_at?: string
          estoque_anterior?: number
          estoque_novo?: number
          id?: string
          motivo?: string | null
          produto_id?: string
          produto_nome?: string
          quantidade?: number
          tipo?: string
          usuario_id?: string
          usuario_nome?: string
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "movimentacoes_estoque_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "movimentacoes_estoque_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
        ]
      }
      papeis_usuarios: {
        Row: {
          id: string
          papel: Database["public"]["Enums"]["papel_usuario"]
          user_id: string
        }
        Insert: {
          id?: string
          papel?: Database["public"]["Enums"]["papel_usuario"]
          user_id: string
        }
        Update: {
          id?: string
          papel?: Database["public"]["Enums"]["papel_usuario"]
          user_id?: string
        }
        Relationships: []
      }
      perfis: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          nome: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      produtos: {
        Row: {
          ativo: boolean
          categoria_id: string | null
          codigo_barras: string | null
          created_at: string
          estoque: number
          estoque_minimo: number
          id: string
          imagem_url: string | null
          nome: string
          preco_custo: number
          preco_venda: number
          produto_unitario_id: string | null
          unidades_por_pacote: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          categoria_id?: string | null
          codigo_barras?: string | null
          created_at?: string
          estoque?: number
          estoque_minimo?: number
          id?: string
          imagem_url?: string | null
          nome: string
          preco_custo?: number
          preco_venda: number
          produto_unitario_id?: string | null
          unidades_por_pacote?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          categoria_id?: string | null
          codigo_barras?: string | null
          created_at?: string
          estoque?: number
          estoque_minimo?: number
          id?: string
          imagem_url?: string | null
          nome?: string
          preco_custo?: number
          preco_venda?: number
          produto_unitario_id?: string | null
          unidades_por_pacote?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_produto_unitario_id_fkey"
            columns: ["produto_unitario_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      vendas: {
        Row: {
          acrescimo: number
          cancelada: boolean
          created_at: string
          desconto: number
          forma_pagamento: string
          id: string
          parcelas: number | null
          subtotal: number
          taxa_valor: number
          total: number
          usuario_id: string
          usuario_nome: string
          valor_liquido: number
        }
        Insert: {
          acrescimo?: number
          cancelada?: boolean
          created_at?: string
          desconto?: number
          forma_pagamento: string
          id?: string
          parcelas?: number | null
          subtotal: number
          taxa_valor?: number
          total: number
          usuario_id: string
          usuario_nome: string
          valor_liquido: number
        }
        Update: {
          acrescimo?: number
          cancelada?: boolean
          created_at?: string
          desconto?: number
          forma_pagamento?: string
          id?: string
          parcelas?: number | null
          subtotal?: number
          taxa_valor?: number
          total?: number
          usuario_id?: string
          usuario_nome?: string
          valor_liquido?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      registrar_movimentacao_estoque: {
        Args: {
          identificador_produto: string
          motivo_informado?: string
          quantidade_informada: number
          tipo_movimentacao: string
        }
        Returns: undefined
      }
      registrar_venda_com_estoque: {
        Args: { dados_itens: Json; dados_venda: Json }
        Returns: string
      }
      tem_papel: {
        Args: {
          _papel: Database["public"]["Enums"]["papel_usuario"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      papel_usuario: "admin" | "operador"
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
  public: {
    Enums: {
      papel_usuario: ["admin", "operador"],
    },
  },
} as const
