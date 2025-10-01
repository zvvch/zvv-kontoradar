export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      account: {
        Row: {
          id: string
          konto_nr: string
          name: string
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          konto_nr: string
          name: string
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          konto_nr?: string
          name?: string
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      booking: {
        Row: {
          id: number
          ok_id: string
          account_id: string
          import_batch_id: string | null
          booking_date: string
          beleg_nr: string | null
          text_long: string | null
          gegenkonto: string | null
          amount: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          ok_id: string
          account_id: string
          import_batch_id?: string | null
          booking_date: string
          beleg_nr?: string | null
          text_long?: string | null
          gegenkonto?: string | null
          amount: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          ok_id?: string
          account_id?: string
          import_batch_id?: string | null
          booking_date?: string
          beleg_nr?: string | null
          text_long?: string | null
          gegenkonto?: string | null
          amount?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_ok_id_fkey"
            columns: ["ok_id"]
            isOneToOne: false
            referencedRelation: "object_credit"
            referencedColumns: ["id"]
          }
        ]
      }
      import_batch: {
        Row: {
          id: string
          source: string
          source_file_name: string | null
          source_file_hash: string | null
          imported_at: string
        }
        Insert: {
          id?: string
          source: string
          source_file_name?: string | null
          source_file_hash?: string | null
          imported_at?: string
        }
        Update: {
          id?: string
          source?: string
          source_file_name?: string | null
          source_file_hash?: string | null
          imported_at?: string
        }
        Relationships: []
      }
      object_credit: {
        Row: {
          id: string
          ok_nr: string
          account_id: string
          title: string
          budget_total: number
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ok_nr: string
          account_id: string
          title: string
          budget_total?: number
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ok_nr?: string
          account_id?: string
          title?: string
          budget_total?: number
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "object_credit_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "account"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      v_account_overview: {
        Row: {
          account_id: string
          konto_nr: string
          account_name: string
          ok_count: number
          total_budget: number
          total_spent: number
          total_available: number
        }
        Relationships: []
      }
      v_ok_overview: {
        Row: {
          ok_id: string
          ok_nr: string
          title: string
          budget_total: number
          spent: number
          available: number
          booking_count: number
          first_booking: string | null
          last_booking: string | null
          account_id: string
          konto_nr: string
          account_name: string
        }
        Relationships: []
      }
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
