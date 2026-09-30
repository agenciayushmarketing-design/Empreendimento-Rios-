// Tipos gerados a partir do banco Supabase rios-homolog em 2026-09-30.
// Nao editar a mao. Regerar apos cada migration: npm run db:types

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
      animal_sales: {
        Row: {
          animal_id: string
          auction_lot_id: string | null
          business_unit_id: string
          buyer_client_id: string
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          commission: number
          commission_category_id: string | null
          commission_client_id: string | null
          commission_due_date: string | null
          commission_mode: string
          commission_payable_id: string | null
          commission_receivable_id: string | null
          contract_generated_at: string | null
          contract_path: string | null
          covering_mare_note: string | null
          created_at: string
          created_by: string | null
          crop_year: number | null
          donor_animal_id: string | null
          down_payment: number
          down_payment_date: string | null
          first_due_date: string | null
          id: string
          installments_count: number
          notes: string | null
          paid_account_category_id: string | null
          payment_method: Database["public"]["Enums"]["sale_payment_method"]
          product_type: string
          recipient_animal_id: string | null
          sale_date: string
          sale_type: string
          share_pct: number | null
          sire_animal_id: string | null
          status: Database["public"]["Enums"]["sale_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          animal_id: string
          auction_lot_id?: string | null
          business_unit_id: string
          buyer_client_id: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          commission?: number
          commission_category_id?: string | null
          commission_client_id?: string | null
          commission_due_date?: string | null
          commission_mode?: string
          commission_payable_id?: string | null
          commission_receivable_id?: string | null
          contract_generated_at?: string | null
          contract_path?: string | null
          covering_mare_note?: string | null
          created_at?: string
          created_by?: string | null
          crop_year?: number | null
          donor_animal_id?: string | null
          down_payment?: number
          down_payment_date?: string | null
          first_due_date?: string | null
          id?: string
          installments_count?: number
          notes?: string | null
          paid_account_category_id?: string | null
          payment_method?: Database["public"]["Enums"]["sale_payment_method"]
          product_type?: string
          recipient_animal_id?: string | null
          sale_date?: string
          sale_type?: string
          share_pct?: number | null
          sire_animal_id?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          total_amount: number
          updated_at?: string
        }
        Update: {
          animal_id?: string
          auction_lot_id?: string | null
          business_unit_id?: string
          buyer_client_id?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          commission?: number
          commission_category_id?: string | null
          commission_client_id?: string | null
          commission_due_date?: string | null
          commission_mode?: string
          commission_payable_id?: string | null
          commission_receivable_id?: string | null
          contract_generated_at?: string | null
          contract_path?: string | null
          covering_mare_note?: string | null
          created_at?: string
          created_by?: string | null
          crop_year?: number | null
          donor_animal_id?: string | null
          down_payment?: number
          down_payment_date?: string | null
          first_due_date?: string | null
          id?: string
          installments_count?: number
          notes?: string | null
          paid_account_category_id?: string | null
          payment_method?: Database["public"]["Enums"]["sale_payment_method"]
          product_type?: string
          recipient_animal_id?: string | null
          sale_date?: string
          sale_type?: string
          share_pct?: number | null
          sire_animal_id?: string | null
          status?: Database["public"]["Enums"]["sale_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "animal_sales_auction_lot_id_fkey"
            columns: ["auction_lot_id"]
            isOneToOne: false
            referencedRelation: "auction_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_sales_commission_receivable_id_fkey"
            columns: ["commission_receivable_id"]
            isOneToOne: false
            referencedRelation: "receivables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_sales_donor_animal_id_fkey"
            columns: ["donor_animal_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_sales_recipient_animal_id_fkey"
            columns: ["recipient_animal_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_sales_sire_animal_id_fkey"
            columns: ["sire_animal_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
        ]
      }
      auction_lot_animals: {
        Row: {
          animal_id: string
          auction_lot_id: string
          created_at: string
          hammer_price: number | null
          id: string
          lot_number: number | null
          minimum_bid: number | null
          sale_id: string | null
        }
        Insert: {
          animal_id: string
          auction_lot_id: string
          created_at?: string
          hammer_price?: number | null
          id?: string
          lot_number?: number | null
          minimum_bid?: number | null
          sale_id?: string | null
        }
        Update: {
          animal_id?: string
          auction_lot_id?: string
          created_at?: string
          hammer_price?: number | null
          id?: string
          lot_number?: number | null
          minimum_bid?: number | null
          sale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "auction_lot_animals_auction_lot_id_fkey"
            columns: ["auction_lot_id"]
            isOneToOne: false
            referencedRelation: "auction_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_lot_animals_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "animal_sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auction_lot_animals_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sale_reconciliation"
            referencedColumns: ["sale_id"]
          },
        ]
      }
      auction_lots: {
        Row: {
          auction_date: string | null
          business_unit_id: string
          created_at: string
          created_by: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          status: Database["public"]["Enums"]["auction_lot_status"]
          updated_at: string
        }
        Insert: {
          auction_date?: string | null
          business_unit_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          status?: Database["public"]["Enums"]["auction_lot_status"]
          updated_at?: string
        }
        Update: {
          auction_date?: string | null
          business_unit_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["auction_lot_status"]
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          business_unit_id: string | null
          created_at: string
          entity: string
          entity_id: string | null
          id: string
          payload: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          business_unit_id?: string | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          business_unit_id?: string | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: string
          payload?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      bank_account_units: {
        Row: {
          bank_account_id: string
          business_unit_id: string
          created_at: string
        }
        Insert: {
          bank_account_id: string
          business_unit_id: string
          created_at?: string
        }
        Update: {
          bank_account_id?: string
          business_unit_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_account_units_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_account_balances"
            referencedColumns: ["bank_account_id"]
          },
          {
            foreignKeyName: "bank_account_units_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_account_units_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_number: string | null
          agency: string | null
          bank_name: string | null
          color: string | null
          created_at: string
          created_by: string | null
          icon: string | null
          id: string
          initial_balance: number
          initial_balance_date: string
          is_active: boolean
          name: string
          notes: string | null
          type: Database["public"]["Enums"]["bank_account_type"]
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          agency?: string | null
          bank_name?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          icon?: string | null
          id?: string
          initial_balance?: number
          initial_balance_date?: string
          is_active?: boolean
          name: string
          notes?: string | null
          type?: Database["public"]["Enums"]["bank_account_type"]
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          agency?: string | null
          bank_name?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          icon?: string | null
          id?: string
          initial_balance?: number
          initial_balance_date?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          type?: Database["public"]["Enums"]["bank_account_type"]
          updated_at?: string
        }
        Relationships: []
      }
      bank_contracts: {
        Row: {
          bank_account_id: string | null
          business_unit_id: string
          contract_date: string
          contract_number: string
          contract_type: Database["public"]["Enums"]["bank_contract_type"]
          created_at: string
          created_by: string | null
          expense_category_id: string | null
          first_due_date: string | null
          id: string
          installment_amount: number | null
          installments_count: number | null
          institution: string
          interest_rate_info: number | null
          notes: string | null
          principal: number
          principal_credit_transaction_id: string | null
          renegotiated_from_id: string | null
          settled_at: string | null
          settlement_amount: number | null
          status: Database["public"]["Enums"]["bank_contract_status"]
          updated_at: string
        }
        Insert: {
          bank_account_id?: string | null
          business_unit_id: string
          contract_date: string
          contract_number: string
          contract_type: Database["public"]["Enums"]["bank_contract_type"]
          created_at?: string
          created_by?: string | null
          expense_category_id?: string | null
          first_due_date?: string | null
          id?: string
          installment_amount?: number | null
          installments_count?: number | null
          institution: string
          interest_rate_info?: number | null
          notes?: string | null
          principal: number
          principal_credit_transaction_id?: string | null
          renegotiated_from_id?: string | null
          settled_at?: string | null
          settlement_amount?: number | null
          status?: Database["public"]["Enums"]["bank_contract_status"]
          updated_at?: string
        }
        Update: {
          bank_account_id?: string | null
          business_unit_id?: string
          contract_date?: string
          contract_number?: string
          contract_type?: Database["public"]["Enums"]["bank_contract_type"]
          created_at?: string
          created_by?: string | null
          expense_category_id?: string | null
          first_due_date?: string | null
          id?: string
          installment_amount?: number | null
          installments_count?: number | null
          institution?: string
          interest_rate_info?: number | null
          notes?: string | null
          principal?: number
          principal_credit_transaction_id?: string | null
          renegotiated_from_id?: string | null
          settled_at?: string | null
          settlement_amount?: number | null
          status?: Database["public"]["Enums"]["bank_contract_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_contracts_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_account_balances"
            referencedColumns: ["bank_account_id"]
          },
          {
            foreignKeyName: "bank_contracts_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_contracts_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_contracts_expense_category_id_fkey"
            columns: ["expense_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_contracts_principal_credit_transaction_id_fkey"
            columns: ["principal_credit_transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_contracts_renegotiated_from_id_fkey"
            columns: ["renegotiated_from_id"]
            isOneToOne: false
            referencedRelation: "bank_contract_progress"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "bank_contracts_renegotiated_from_id_fkey"
            columns: ["renegotiated_from_id"]
            isOneToOne: false
            referencedRelation: "bank_contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      business_units: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          name: string
          type: Database["public"]["Enums"]["business_unit_type"]
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["business_unit_type"]
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["business_unit_type"]
        }
        Relationships: []
      }
      categories: {
        Row: {
          business_unit_id: string
          created_at: string
          created_by: string | null
          id: string
          is_payroll: boolean
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_payroll?: boolean
          name: string
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_payroll?: boolean
          name?: string
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          business_unit_id: string
          created_at: string
          created_by: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          created_at?: string
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          admission_date: string | null
          business_unit_id: string
          created_at: string
          created_by: string | null
          default_base_salary: number
          default_fgts: number
          default_inss: number
          default_meal: number
          default_other: number
          default_transport: number
          document: string | null
          full_name: string
          id: string
          is_active: boolean
          notes: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          admission_date?: string | null
          business_unit_id: string
          created_at?: string
          created_by?: string | null
          default_base_salary?: number
          default_fgts?: number
          default_inss?: number
          default_meal?: number
          default_other?: number
          default_transport?: number
          document?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          notes?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          admission_date?: string | null
          business_unit_id?: string
          created_at?: string
          created_by?: string | null
          default_base_salary?: number
          default_fgts?: number
          default_inss?: number
          default_meal?: number
          default_other?: number
          default_transport?: number
          document?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_animal_categories: {
        Row: {
          business_unit_id: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      haras_animal_movements: {
        Row: {
          animal_id: string
          created_at: string
          created_by: string | null
          from_location: string | null
          id: string
          moved_at: string
          reason: string | null
          to_location: string
        }
        Insert: {
          animal_id: string
          created_at?: string
          created_by?: string | null
          from_location?: string | null
          id?: string
          moved_at?: string
          reason?: string | null
          to_location: string
        }
        Update: {
          animal_id?: string
          created_at?: string
          created_by?: string | null
          from_location?: string | null
          id?: string
          moved_at?: string
          reason?: string | null
          to_location?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_animal_movements_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_animal_partners: {
        Row: {
          animal_id: string
          client_id: string
          created_at: string
          id: string
          ownership_percentage: number
        }
        Insert: {
          animal_id: string
          client_id: string
          created_at?: string
          id?: string
          ownership_percentage: number
        }
        Update: {
          animal_id?: string
          client_id?: string
          created_at?: string
          id?: string
          ownership_percentage?: number
        }
        Relationships: [
          {
            foreignKeyName: "haras_animal_partners_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_animal_partners_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "haras_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_animal_transaction_shares: {
        Row: {
          client_id: string
          created_at: string
          id: string
          ownership_percentage: number
          settled_at: string | null
          share_amount: number
          status: string
          transaction_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          ownership_percentage: number
          settled_at?: string | null
          share_amount: number
          status?: string
          transaction_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          ownership_percentage?: number
          settled_at?: string | null
          share_amount?: number
          status?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_animal_transaction_shares_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "haras_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_animal_transaction_shares_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "haras_animal_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_animal_transactions: {
        Row: {
          amount: number
          animal_id: string
          business_unit_id: string
          category_id: string | null
          created_at: string
          created_by: string | null
          date: string
          description: string
          id: string
          notes: string | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          animal_id: string
          business_unit_id: string
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description: string
          id?: string
          notes?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          animal_id?: string
          business_unit_id?: string
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          notes?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      haras_animal_weight_history: {
        Row: {
          animal_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          weighed_at: string
          weight_kg: number
        }
        Insert: {
          animal_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          weighed_at?: string
          weight_kg: number
        }
        Update: {
          animal_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          weighed_at?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "haras_animal_weight_history_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_animals: {
        Row: {
          animal_type: string | null
          birth_date: string | null
          business_unit_id: string
          created_at: string
          created_by: string | null
          emergency_phone: string | null
          entry_date: string
          exit_date: string | null
          id: string
          location_note: string | null
          name: string
          notes: string | null
          origin: string | null
          owner_share_amount: number | null
          owner_share_percentage: number | null
          primary_client_id: string
          registration_code: string | null
          sex: Database["public"]["Enums"]["repro_sex"] | null
          status: string
          updated_at: string
        }
        Insert: {
          animal_type?: string | null
          birth_date?: string | null
          business_unit_id: string
          created_at?: string
          created_by?: string | null
          emergency_phone?: string | null
          entry_date?: string
          exit_date?: string | null
          id?: string
          location_note?: string | null
          name: string
          notes?: string | null
          origin?: string | null
          owner_share_amount?: number | null
          owner_share_percentage?: number | null
          primary_client_id: string
          registration_code?: string | null
          sex?: Database["public"]["Enums"]["repro_sex"] | null
          status?: string
          updated_at?: string
        }
        Update: {
          animal_type?: string | null
          birth_date?: string | null
          business_unit_id?: string
          created_at?: string
          created_by?: string | null
          emergency_phone?: string | null
          entry_date?: string
          exit_date?: string | null
          id?: string
          location_note?: string | null
          name?: string
          notes?: string | null
          origin?: string | null
          owner_share_amount?: number | null
          owner_share_percentage?: number | null
          primary_client_id?: string
          registration_code?: string | null
          sex?: Database["public"]["Enums"]["repro_sex"] | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      haras_breeding_sessions: {
        Row: {
          business_unit_id: string
          cancel_reason: string | null
          created_at: string
          created_by: string | null
          doses_used: number | null
          embryo_id: string | null
          embryo_transfer_id: string | null
          id: string
          mare_id: string
          method: Database["public"]["Enums"]["repro_breeding_method"]
          notes: string | null
          perform_attempts: number
          performed_at: string | null
          scheduled_at: string
          semen_batch_id: string | null
          semen_movement_id: string | null
          stallion_id: string | null
          status: Database["public"]["Enums"]["repro_breeding_status"]
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          cancel_reason?: string | null
          created_at?: string
          created_by?: string | null
          doses_used?: number | null
          embryo_id?: string | null
          embryo_transfer_id?: string | null
          id?: string
          mare_id: string
          method: Database["public"]["Enums"]["repro_breeding_method"]
          notes?: string | null
          perform_attempts?: number
          performed_at?: string | null
          scheduled_at: string
          semen_batch_id?: string | null
          semen_movement_id?: string | null
          stallion_id?: string | null
          status?: Database["public"]["Enums"]["repro_breeding_status"]
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          cancel_reason?: string | null
          created_at?: string
          created_by?: string | null
          doses_used?: number | null
          embryo_id?: string | null
          embryo_transfer_id?: string | null
          id?: string
          mare_id?: string
          method?: Database["public"]["Enums"]["repro_breeding_method"]
          notes?: string | null
          perform_attempts?: number
          performed_at?: string | null
          scheduled_at?: string
          semen_batch_id?: string | null
          semen_movement_id?: string | null
          stallion_id?: string | null
          status?: Database["public"]["Enums"]["repro_breeding_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_breeding_sessions_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_breeding_sessions_embryo_id_fkey"
            columns: ["embryo_id"]
            isOneToOne: false
            referencedRelation: "haras_embryos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_breeding_sessions_embryo_transfer_id_fkey"
            columns: ["embryo_transfer_id"]
            isOneToOne: false
            referencedRelation: "haras_embryo_transfers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_breeding_sessions_mare_id_fkey"
            columns: ["mare_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_breeding_sessions_semen_batch_id_fkey"
            columns: ["semen_batch_id"]
            isOneToOne: false
            referencedRelation: "haras_semen_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_breeding_sessions_semen_movement_id_fkey"
            columns: ["semen_movement_id"]
            isOneToOne: false
            referencedRelation: "haras_semen_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_breeding_sessions_stallion_id_fkey"
            columns: ["stallion_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_clients: {
        Row: {
          address: string | null
          business_unit_id: string
          created_at: string
          created_by: string | null
          document: string | null
          email: string | null
          id: string
          is_owner_account: boolean
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_unit_id: string
          created_at?: string
          created_by?: string | null
          document?: string | null
          email?: string | null
          id?: string
          is_owner_account?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_unit_id?: string
          created_at?: string
          created_by?: string | null
          document?: string | null
          email?: string | null
          id?: string
          is_owner_account?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      haras_embryo_transfers: {
        Row: {
          business_unit_id: string
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          created_by: string | null
          embryo_id: string
          id: string
          notes: string | null
          outcome: Database["public"]["Enums"]["repro_embryo_outcome"]
          recipient_mare_id: string
          transfer_date: string
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string | null
          embryo_id: string
          id?: string
          notes?: string | null
          outcome?: Database["public"]["Enums"]["repro_embryo_outcome"]
          recipient_mare_id: string
          transfer_date?: string
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          cancel_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          created_by?: string | null
          embryo_id?: string
          id?: string
          notes?: string | null
          outcome?: Database["public"]["Enums"]["repro_embryo_outcome"]
          recipient_mare_id?: string
          transfer_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_embryo_transfers_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_embryo_transfers_embryo_id_fkey"
            columns: ["embryo_id"]
            isOneToOne: false
            referencedRelation: "haras_embryos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_embryo_transfers_recipient_mare_id_fkey"
            columns: ["recipient_mare_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_embryos: {
        Row: {
          business_unit_id: string
          code: string
          container: Database["public"]["Enums"]["repro_embryo_container"]
          created_at: string
          created_by: string | null
          donor_mare_id: string | null
          fiv_batch_id: string | null
          grade: string | null
          id: string
          notes: string | null
          origin: Database["public"]["Enums"]["repro_embryo_origin"]
          production_date: string | null
          sire_stallion_id: string | null
          stage: Database["public"]["Enums"]["repro_embryo_stage"]
          status: Database["public"]["Enums"]["repro_embryo_status"]
          storage_location: string | null
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          code: string
          container: Database["public"]["Enums"]["repro_embryo_container"]
          created_at?: string
          created_by?: string | null
          donor_mare_id?: string | null
          fiv_batch_id?: string | null
          grade?: string | null
          id?: string
          notes?: string | null
          origin: Database["public"]["Enums"]["repro_embryo_origin"]
          production_date?: string | null
          sire_stallion_id?: string | null
          stage: Database["public"]["Enums"]["repro_embryo_stage"]
          status?: Database["public"]["Enums"]["repro_embryo_status"]
          storage_location?: string | null
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          code?: string
          container?: Database["public"]["Enums"]["repro_embryo_container"]
          created_at?: string
          created_by?: string | null
          donor_mare_id?: string | null
          fiv_batch_id?: string | null
          grade?: string | null
          id?: string
          notes?: string | null
          origin?: Database["public"]["Enums"]["repro_embryo_origin"]
          production_date?: string | null
          sire_stallion_id?: string | null
          stage?: Database["public"]["Enums"]["repro_embryo_stage"]
          status?: Database["public"]["Enums"]["repro_embryo_status"]
          storage_location?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_embryos_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_embryos_donor_mare_id_fkey"
            columns: ["donor_mare_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_embryos_fiv_batch_id_fkey"
            columns: ["fiv_batch_id"]
            isOneToOne: false
            referencedRelation: "haras_fiv_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_embryos_sire_stallion_id_fkey"
            columns: ["sire_stallion_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_feature_flags: {
        Row: {
          business_unit_id: string | null
          created_at: string
          enabled: boolean
          flag_name: string
          id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          business_unit_id?: string | null
          created_at?: string
          enabled?: boolean
          flag_name: string
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          business_unit_id?: string | null
          created_at?: string
          enabled?: boolean
          flag_name?: string
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      haras_fiv_batches: {
        Row: {
          blastocysts: number | null
          business_unit_id: string
          cleaved: number | null
          created_at: string
          created_by: string | null
          doses_used: number
          fertilized_at: string
          id: string
          notes: string | null
          oocytes_used: number
          opu_session_id: string
          semen_batch_id: string | null
          stallion_id: string
          status: string
          updated_at: string
        }
        Insert: {
          blastocysts?: number | null
          business_unit_id: string
          cleaved?: number | null
          created_at?: string
          created_by?: string | null
          doses_used: number
          fertilized_at?: string
          id?: string
          notes?: string | null
          oocytes_used: number
          opu_session_id: string
          semen_batch_id?: string | null
          stallion_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          blastocysts?: number | null
          business_unit_id?: string
          cleaved?: number | null
          created_at?: string
          created_by?: string | null
          doses_used?: number
          fertilized_at?: string
          id?: string
          notes?: string | null
          oocytes_used?: number
          opu_session_id?: string
          semen_batch_id?: string | null
          stallion_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_fiv_batches_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_fiv_batches_opu_session_id_fkey"
            columns: ["opu_session_id"]
            isOneToOne: false
            referencedRelation: "haras_opu_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_fiv_batches_semen_batch_id_fkey"
            columns: ["semen_batch_id"]
            isOneToOne: false
            referencedRelation: "haras_semen_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_fiv_batches_stallion_id_fkey"
            columns: ["stallion_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_follicle_exams: {
        Row: {
          business_unit_id: string
          cervix_tone: string | null
          corpus_luteum_side: string | null
          created_at: string
          created_by: string | null
          examined_at: string
          examined_by: string | null
          follicle_dominant_mm: number | null
          id: string
          mare_id: string
          notes: string | null
          ovulation_confirmed: boolean
          ovulation_side: Database["public"]["Enums"]["haras_ovary_side"] | null
          recommendation:
            | Database["public"]["Enums"]["haras_follicle_recommendation"]
            | null
          updated_at: string
          uterine_edema:
            | Database["public"]["Enums"]["haras_uterine_edema"]
            | null
        }
        Insert: {
          business_unit_id: string
          cervix_tone?: string | null
          corpus_luteum_side?: string | null
          created_at?: string
          created_by?: string | null
          examined_at?: string
          examined_by?: string | null
          follicle_dominant_mm?: number | null
          id?: string
          mare_id: string
          notes?: string | null
          ovulation_confirmed?: boolean
          ovulation_side?:
            | Database["public"]["Enums"]["haras_ovary_side"]
            | null
          recommendation?:
            | Database["public"]["Enums"]["haras_follicle_recommendation"]
            | null
          updated_at?: string
          uterine_edema?:
            | Database["public"]["Enums"]["haras_uterine_edema"]
            | null
        }
        Update: {
          business_unit_id?: string
          cervix_tone?: string | null
          corpus_luteum_side?: string | null
          created_at?: string
          created_by?: string | null
          examined_at?: string
          examined_by?: string | null
          follicle_dominant_mm?: number | null
          id?: string
          mare_id?: string
          notes?: string | null
          ovulation_confirmed?: boolean
          ovulation_side?:
            | Database["public"]["Enums"]["haras_ovary_side"]
            | null
          recommendation?:
            | Database["public"]["Enums"]["haras_follicle_recommendation"]
            | null
          updated_at?: string
          uterine_edema?:
            | Database["public"]["Enums"]["haras_uterine_edema"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "haras_follicle_exams_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_follicle_exams_mare_id_fkey"
            columns: ["mare_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_follicle_readings: {
        Row: {
          business_unit_id: string
          created_at: string
          diameter_mm: number
          exam_id: string
          id: string
          notes: string | null
          ovary_side: Database["public"]["Enums"]["haras_ovary_side"]
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          created_at?: string
          diameter_mm: number
          exam_id: string
          id?: string
          notes?: string | null
          ovary_side: Database["public"]["Enums"]["haras_ovary_side"]
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          created_at?: string
          diameter_mm?: number
          exam_id?: string
          id?: string
          notes?: string | null
          ovary_side?: Database["public"]["Enums"]["haras_ovary_side"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_follicle_readings_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_follicle_readings_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "haras_follicle_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_opu_sessions: {
        Row: {
          business_unit_id: string
          created_at: string
          created_by: string | null
          donor_mare_id: string
          id: string
          location_id: string | null
          notes: string | null
          oocytes_total: number
          oocytes_viable: number
          performed_at: string
          performed_by: string | null
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          created_at?: string
          created_by?: string | null
          donor_mare_id: string
          id?: string
          location_id?: string | null
          notes?: string | null
          oocytes_total?: number
          oocytes_viable?: number
          performed_at?: string
          performed_by?: string | null
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          created_at?: string
          created_by?: string | null
          donor_mare_id?: string
          id?: string
          location_id?: string | null
          notes?: string | null
          oocytes_total?: number
          oocytes_viable?: number
          performed_at?: string
          performed_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_opu_sessions_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_opu_sessions_donor_mare_id_fkey"
            columns: ["donor_mare_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_opu_sessions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "haras_partner_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_partner_locations: {
        Row: {
          address: string | null
          business_unit_id: string
          client_id: string
          created_at: string
          id: string
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_unit_id: string
          client_id: string
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_unit_id?: string
          client_id?: string
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_partner_locations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "haras_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_pregnancies: {
        Row: {
          breeding_session_id: string | null
          business_unit_id: string
          conception_date: string
          created_at: string
          created_by: string | null
          donor_mare_id: string | null
          gestation_days: number
          id: string
          mare_id: string
          notes: string | null
          offspring_animal_id: string | null
          outcome_date: string | null
          outcome_notes: string | null
          stallion_id: string | null
          status: Database["public"]["Enums"]["repro_pregnancy_status"]
          updated_at: string
        }
        Insert: {
          breeding_session_id?: string | null
          business_unit_id: string
          conception_date: string
          created_at?: string
          created_by?: string | null
          donor_mare_id?: string | null
          gestation_days: number
          id?: string
          mare_id: string
          notes?: string | null
          offspring_animal_id?: string | null
          outcome_date?: string | null
          outcome_notes?: string | null
          stallion_id?: string | null
          status?: Database["public"]["Enums"]["repro_pregnancy_status"]
          updated_at?: string
        }
        Update: {
          breeding_session_id?: string | null
          business_unit_id?: string
          conception_date?: string
          created_at?: string
          created_by?: string | null
          donor_mare_id?: string | null
          gestation_days?: number
          id?: string
          mare_id?: string
          notes?: string | null
          offspring_animal_id?: string | null
          outcome_date?: string | null
          outcome_notes?: string | null
          stallion_id?: string | null
          status?: Database["public"]["Enums"]["repro_pregnancy_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_pregnancies_breeding_session_id_fkey"
            columns: ["breeding_session_id"]
            isOneToOne: false
            referencedRelation: "haras_breeding_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_pregnancies_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_pregnancies_donor_mare_id_fkey"
            columns: ["donor_mare_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_pregnancies_mare_id_fkey"
            columns: ["mare_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_pregnancies_offspring_animal_id_fkey"
            columns: ["offspring_animal_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_pregnancies_stallion_id_fkey"
            columns: ["stallion_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_pregnancy_diagnostics: {
        Row: {
          business_unit_id: string
          created_at: string
          created_by: string | null
          diagnosed_at: string
          id: string
          method: Database["public"]["Enums"]["repro_diagnostic_method"]
          notes: string | null
          observed_days: number | null
          pregnancy_id: string
          result: Database["public"]["Enums"]["repro_diagnostic_result"]
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          created_at?: string
          created_by?: string | null
          diagnosed_at: string
          id?: string
          method: Database["public"]["Enums"]["repro_diagnostic_method"]
          notes?: string | null
          observed_days?: number | null
          pregnancy_id: string
          result: Database["public"]["Enums"]["repro_diagnostic_result"]
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          created_at?: string
          created_by?: string | null
          diagnosed_at?: string
          id?: string
          method?: Database["public"]["Enums"]["repro_diagnostic_method"]
          notes?: string | null
          observed_days?: number | null
          pregnancy_id?: string
          result?: Database["public"]["Enums"]["repro_diagnostic_result"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_pregnancy_diagnostics_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_pregnancy_diagnostics_pregnancy_id_fkey"
            columns: ["pregnancy_id"]
            isOneToOne: false
            referencedRelation: "haras_pregnancies"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_purchase_commission_installments: {
        Row: {
          amount: number
          business_unit_id: string
          commission_id: string
          created_at: string
          created_by: string | null
          due_date: string
          id: string
          installment_number: number
          paid_date: string | null
          payable_id: string | null
          reversal_reason: string | null
          reversal_transaction_id: string | null
          reversed_at: string | null
          reversed_by: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          business_unit_id: string
          commission_id: string
          created_at?: string
          created_by?: string | null
          due_date: string
          id?: string
          installment_number: number
          paid_date?: string | null
          payable_id?: string | null
          reversal_reason?: string | null
          reversal_transaction_id?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          business_unit_id?: string
          commission_id?: string
          created_at?: string
          created_by?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          paid_date?: string | null
          payable_id?: string | null
          reversal_reason?: string | null
          reversal_transaction_id?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_purchase_commission_installments_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_purchase_commission_installments_commission_id_fkey"
            columns: ["commission_id"]
            isOneToOne: false
            referencedRelation: "haras_purchase_commissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_purchase_commission_installments_payable_id_fkey"
            columns: ["payable_id"]
            isOneToOne: false
            referencedRelation: "payables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_purchase_commission_installments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_purchase_commissions: {
        Row: {
          auto_create_bills: boolean
          business_unit_id: string
          commission_amount: number
          commission_percentage: number | null
          commission_type: string
          created_at: string
          created_by: string | null
          expense_category_id: string | null
          first_due_date: string | null
          id: string
          installment_count: number
          notes: string | null
          payment_condition: string
          purchase_id: string
          purchase_status: string
          recipient_name: string | null
          updated_at: string
        }
        Insert: {
          auto_create_bills?: boolean
          business_unit_id: string
          commission_amount: number
          commission_percentage?: number | null
          commission_type: string
          created_at?: string
          created_by?: string | null
          expense_category_id?: string | null
          first_due_date?: string | null
          id?: string
          installment_count?: number
          notes?: string | null
          payment_condition: string
          purchase_id: string
          purchase_status?: string
          recipient_name?: string | null
          updated_at?: string
        }
        Update: {
          auto_create_bills?: boolean
          business_unit_id?: string
          commission_amount?: number
          commission_percentage?: number | null
          commission_type?: string
          created_at?: string
          created_by?: string | null
          expense_category_id?: string | null
          first_due_date?: string | null
          id?: string
          installment_count?: number
          notes?: string | null
          payment_condition?: string
          purchase_id?: string
          purchase_status?: string
          recipient_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_purchase_commissions_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_purchase_commissions_expense_category_id_fkey"
            columns: ["expense_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_purchase_commissions_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: true
            referencedRelation: "haras_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_purchase_installments: {
        Row: {
          amount: number
          business_unit_id: string
          created_at: string
          created_by: string | null
          due_date: string
          id: string
          installment_number: number
          paid_date: string | null
          payable_id: string | null
          purchase_id: string
          reversal_reason: string | null
          reversal_transaction_id: string | null
          reversed_at: string | null
          reversed_by: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          business_unit_id: string
          created_at?: string
          created_by?: string | null
          due_date: string
          id?: string
          installment_number: number
          paid_date?: string | null
          payable_id?: string | null
          purchase_id: string
          reversal_reason?: string | null
          reversal_transaction_id?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          business_unit_id?: string
          created_at?: string
          created_by?: string | null
          due_date?: string
          id?: string
          installment_number?: number
          paid_date?: string | null
          payable_id?: string | null
          purchase_id?: string
          reversal_reason?: string | null
          reversal_transaction_id?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_purchase_installments_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_purchase_installments_payable_id_fkey"
            columns: ["payable_id"]
            isOneToOne: false
            referencedRelation: "payables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_purchase_installments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "haras_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_purchase_installments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_purchases: {
        Row: {
          animal_id: string | null
          auto_create_bills: boolean
          business_unit_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          client_request_id: string | null
          contract_url: string | null
          create_new_animal: boolean
          created_at: string
          created_by: string | null
          down_payment_amount: number | null
          down_payment_date: string | null
          estimated_total_value: number | null
          expense_category_id: string | null
          expiration_date: string | null
          first_due_date: string | null
          has_down_payment: boolean
          id: string
          installment_count: number
          notes: string | null
          participation_percentage: number | null
          payment_condition: string
          purchase_date: string
          purchase_status: string
          purchase_type: string
          quantity_purchased: number | null
          quantity_used: number
          seller_name: string | null
          stallion_name: string | null
          storage_location: string | null
          supplier_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          animal_id?: string | null
          auto_create_bills?: boolean
          business_unit_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_request_id?: string | null
          contract_url?: string | null
          create_new_animal?: boolean
          created_at?: string
          created_by?: string | null
          down_payment_amount?: number | null
          down_payment_date?: string | null
          estimated_total_value?: number | null
          expense_category_id?: string | null
          expiration_date?: string | null
          first_due_date?: string | null
          has_down_payment?: boolean
          id?: string
          installment_count?: number
          notes?: string | null
          participation_percentage?: number | null
          payment_condition: string
          purchase_date?: string
          purchase_status?: string
          purchase_type: string
          quantity_purchased?: number | null
          quantity_used?: number
          seller_name?: string | null
          stallion_name?: string | null
          storage_location?: string | null
          supplier_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          animal_id?: string | null
          auto_create_bills?: boolean
          business_unit_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          client_request_id?: string | null
          contract_url?: string | null
          create_new_animal?: boolean
          created_at?: string
          created_by?: string | null
          down_payment_amount?: number | null
          down_payment_date?: string | null
          estimated_total_value?: number | null
          expense_category_id?: string | null
          expiration_date?: string | null
          first_due_date?: string | null
          has_down_payment?: boolean
          id?: string
          installment_count?: number
          notes?: string | null
          participation_percentage?: number | null
          payment_condition?: string
          purchase_date?: string
          purchase_status?: string
          purchase_type?: string
          quantity_purchased?: number | null
          quantity_used?: number
          seller_name?: string | null
          stallion_name?: string | null
          storage_location?: string | null
          supplier_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_purchases_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_purchases_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_purchases_expense_category_id_fkey"
            columns: ["expense_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_purchases_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "haras_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_recurring_invoice_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          line_total: number | null
          quantity: number
          recurring_invoice_id: string
          service_id: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          line_total?: number | null
          quantity?: number
          recurring_invoice_id: string
          service_id?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          line_total?: number | null
          quantity?: number
          recurring_invoice_id?: string
          service_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "haras_recurring_invoice_items_invoice_id_fkey"
            columns: ["recurring_invoice_id"]
            isOneToOne: false
            referencedRelation: "haras_recurring_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_recurring_invoice_items_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "haras_services"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_recurring_invoices: {
        Row: {
          animal_id: string | null
          business_unit_id: string
          client_id: string
          created_at: string
          created_by: string | null
          day_of_month: number
          description: string | null
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean
          next_run_date: string
          notes: string | null
          start_date: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          animal_id?: string | null
          business_unit_id: string
          client_id: string
          created_at?: string
          created_by?: string | null
          day_of_month?: number
          description?: string | null
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean
          next_run_date: string
          notes?: string | null
          start_date?: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          animal_id?: string | null
          business_unit_id?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          day_of_month?: number
          description?: string | null
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          next_run_date?: string
          notes?: string | null
          start_date?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_recurring_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "haras_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_recurring_runs: {
        Row: {
          business_unit_id: string | null
          created_by: string | null
          generated_count: number
          id: string
          invoice_id: string
          notes: string | null
          ran_at: string
          receivable_id: string | null
          source: string
          status: string
        }
        Insert: {
          business_unit_id?: string | null
          created_by?: string | null
          generated_count?: number
          id?: string
          invoice_id: string
          notes?: string | null
          ran_at?: string
          receivable_id?: string | null
          source?: string
          status?: string
        }
        Update: {
          business_unit_id?: string | null
          created_by?: string | null
          generated_count?: number
          id?: string
          invoice_id?: string
          notes?: string | null
          ran_at?: string
          receivable_id?: string | null
          source?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_recurring_runs_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "haras_recurring_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_reproduction_settings: {
        Row: {
          breeding_upcoming_days: number
          business_unit_id: string
          created_at: string
          default_gestation_days: number
          diagnostic_due_max_days: number
          diagnostic_due_min_days: number
          diagnostic_recheck_days: number
          dpp_overdue_days: number
          dpp_soon_days: number
          enabled: boolean
          updated_at: string
        }
        Insert: {
          breeding_upcoming_days?: number
          business_unit_id: string
          created_at?: string
          default_gestation_days?: number
          diagnostic_due_max_days?: number
          diagnostic_due_min_days?: number
          diagnostic_recheck_days?: number
          dpp_overdue_days?: number
          dpp_soon_days?: number
          enabled?: boolean
          updated_at?: string
        }
        Update: {
          breeding_upcoming_days?: number
          business_unit_id?: string
          created_at?: string
          default_gestation_days?: number
          diagnostic_due_max_days?: number
          diagnostic_due_min_days?: number
          diagnostic_recheck_days?: number
          dpp_overdue_days?: number
          dpp_soon_days?: number
          enabled?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_reproduction_settings_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: true
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_semen_batches: {
        Row: {
          business_unit_id: string
          code: string
          collection_id: string
          container: Database["public"]["Enums"]["repro_semen_container"]
          created_at: string
          created_by: string | null
          doses_available: number
          id: string
          semen_type: Database["public"]["Enums"]["repro_semen_type"]
          stallion_id: string
          storage_location: string | null
          total_doses: number
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          code: string
          collection_id: string
          container: Database["public"]["Enums"]["repro_semen_container"]
          created_at?: string
          created_by?: string | null
          doses_available?: number
          id?: string
          semen_type: Database["public"]["Enums"]["repro_semen_type"]
          stallion_id: string
          storage_location?: string | null
          total_doses: number
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          code?: string
          collection_id?: string
          container?: Database["public"]["Enums"]["repro_semen_container"]
          created_at?: string
          created_by?: string | null
          doses_available?: number
          id?: string
          semen_type?: Database["public"]["Enums"]["repro_semen_type"]
          stallion_id?: string
          storage_location?: string | null
          total_doses?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_semen_batches_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_semen_batches_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "haras_semen_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_semen_batches_stallion_id_fkey"
            columns: ["stallion_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_semen_collections: {
        Row: {
          business_unit_id: string
          collected_at: string
          concentration_millions_per_ml: number | null
          created_at: string
          created_by: string | null
          id: string
          libido: Database["public"]["Enums"]["repro_libido"] | null
          motility_pct: number | null
          notes: string | null
          stallion_id: string
          updated_at: string
          volume_ml: number | null
        }
        Insert: {
          business_unit_id: string
          collected_at: string
          concentration_millions_per_ml?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          libido?: Database["public"]["Enums"]["repro_libido"] | null
          motility_pct?: number | null
          notes?: string | null
          stallion_id: string
          updated_at?: string
          volume_ml?: number | null
        }
        Update: {
          business_unit_id?: string
          collected_at?: string
          concentration_millions_per_ml?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          libido?: Database["public"]["Enums"]["repro_libido"] | null
          motility_pct?: number | null
          notes?: string | null
          stallion_id?: string
          updated_at?: string
          volume_ml?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "haras_semen_collections_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_semen_collections_stallion_id_fkey"
            columns: ["stallion_id"]
            isOneToOne: false
            referencedRelation: "haras_animals"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_semen_movements: {
        Row: {
          batch_id: string
          business_unit_id: string
          created_at: string
          created_by: string | null
          doses: number
          fiv_batch_id: string | null
          id: string
          idempotency_key: string | null
          kind: Database["public"]["Enums"]["repro_movement_kind"]
          notes: string | null
          reason: Database["public"]["Enums"]["repro_movement_reason"]
          ref_id: string | null
          ref_type: string | null
          reversed_by: string | null
          signed_doses: number
          updated_at: string
        }
        Insert: {
          batch_id: string
          business_unit_id: string
          created_at?: string
          created_by?: string | null
          doses: number
          fiv_batch_id?: string | null
          id?: string
          idempotency_key?: string | null
          kind: Database["public"]["Enums"]["repro_movement_kind"]
          notes?: string | null
          reason: Database["public"]["Enums"]["repro_movement_reason"]
          ref_id?: string | null
          ref_type?: string | null
          reversed_by?: string | null
          signed_doses?: number
          updated_at?: string
        }
        Update: {
          batch_id?: string
          business_unit_id?: string
          created_at?: string
          created_by?: string | null
          doses?: number
          fiv_batch_id?: string | null
          id?: string
          idempotency_key?: string | null
          kind?: Database["public"]["Enums"]["repro_movement_kind"]
          notes?: string | null
          reason?: Database["public"]["Enums"]["repro_movement_reason"]
          ref_id?: string | null
          ref_type?: string | null
          reversed_by?: string | null
          signed_doses?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "haras_semen_movements_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "haras_semen_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_semen_movements_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_semen_movements_fiv_batch_id_fkey"
            columns: ["fiv_batch_id"]
            isOneToOne: false
            referencedRelation: "haras_fiv_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "haras_semen_movements_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "haras_semen_movements"
            referencedColumns: ["id"]
          },
        ]
      }
      haras_services: {
        Row: {
          business_unit_id: string
          category: string | null
          created_at: string
          created_by: string | null
          default_price: number | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          default_price?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          default_price?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      haras_shadow_log: {
        Row: {
          business_unit_id: string | null
          diverged: boolean
          feature: string
          id: string
          note: string | null
          payload_new: Json | null
          payload_old: Json | null
          ran_at: string
          source_id: string | null
          source_table: string | null
        }
        Insert: {
          business_unit_id?: string | null
          diverged?: boolean
          feature: string
          id?: string
          note?: string | null
          payload_new?: Json | null
          payload_old?: Json | null
          ran_at?: string
          source_id?: string | null
          source_table?: string | null
        }
        Update: {
          business_unit_id?: string | null
          diverged?: boolean
          feature?: string
          id?: string
          note?: string | null
          payload_new?: Json | null
          payload_old?: Json | null
          ran_at?: string
          source_id?: string | null
          source_table?: string | null
        }
        Relationships: []
      }
      loan_installments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          installment_number: number
          loan_id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          loan_id: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          loan_id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "loan_installments_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loans"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          business_unit_id: string
          client_id: string
          created_at: string
          created_by: string | null
          id: string
          monthly_rate: number
          principal: number
          start_date: string
          status: Database["public"]["Enums"]["loan_status"]
          term_months: number
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          client_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          monthly_rate: number
          principal: number
          start_date?: string
          status?: Database["public"]["Enums"]["loan_status"]
          term_months: number
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          client_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          monthly_rate?: number
          principal?: number
          start_date?: string
          status?: Database["public"]["Enums"]["loan_status"]
          term_months?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          business_unit_id: string | null
          created_at: string
          entity_id: string | null
          entity_table: string | null
          id: string
          link: string | null
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body?: string | null
          business_unit_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_table?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string | null
          business_unit_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_table?: string | null
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      payables: {
        Row: {
          amount: number
          bank_contract_id: string | null
          business_unit_id: string
          category_id: string | null
          closed_at: string | null
          contract_installment_number: number | null
          created_at: string
          created_by: string | null
          description: string
          due_date: string
          employee_id: string | null
          id: string
          last_reschedule_reason: string | null
          last_rescheduled_at: string | null
          notes: string | null
          original_amount: number | null
          original_due_date: string | null
          paid_account_category_id: string | null
          paid_at: string | null
          payroll_batch_id: string | null
          payroll_breakdown: Json | null
          payroll_period: string | null
          preferred_bank_account_id: string | null
          recurring_payable_id: string | null
          rescheduled_count: number
          status: Database["public"]["Enums"]["payment_status"]
          supplier_id: string | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          bank_contract_id?: string | null
          business_unit_id: string
          category_id?: string | null
          closed_at?: string | null
          contract_installment_number?: number | null
          created_at?: string
          created_by?: string | null
          description: string
          due_date: string
          employee_id?: string | null
          id?: string
          last_reschedule_reason?: string | null
          last_rescheduled_at?: string | null
          notes?: string | null
          original_amount?: number | null
          original_due_date?: string | null
          paid_account_category_id?: string | null
          paid_at?: string | null
          payroll_batch_id?: string | null
          payroll_breakdown?: Json | null
          payroll_period?: string | null
          preferred_bank_account_id?: string | null
          recurring_payable_id?: string | null
          rescheduled_count?: number
          status?: Database["public"]["Enums"]["payment_status"]
          supplier_id?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_contract_id?: string | null
          business_unit_id?: string
          category_id?: string | null
          closed_at?: string | null
          contract_installment_number?: number | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string
          employee_id?: string | null
          id?: string
          last_reschedule_reason?: string | null
          last_rescheduled_at?: string | null
          notes?: string | null
          original_amount?: number | null
          original_due_date?: string | null
          paid_account_category_id?: string | null
          paid_at?: string | null
          payroll_batch_id?: string | null
          payroll_breakdown?: Json | null
          payroll_period?: string | null
          preferred_bank_account_id?: string | null
          recurring_payable_id?: string | null
          rescheduled_count?: number
          status?: Database["public"]["Enums"]["payment_status"]
          supplier_id?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payables_bank_contract_id_fkey"
            columns: ["bank_contract_id"]
            isOneToOne: false
            referencedRelation: "bank_contract_progress"
            referencedColumns: ["contract_id"]
          },
          {
            foreignKeyName: "payables_bank_contract_id_fkey"
            columns: ["bank_contract_id"]
            isOneToOne: false
            referencedRelation: "bank_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payables_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payables_preferred_bank_account_id_fkey"
            columns: ["preferred_bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_account_balances"
            referencedColumns: ["bank_account_id"]
          },
          {
            foreignKeyName: "payables_preferred_bank_account_id_fkey"
            columns: ["preferred_bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          must_change_password: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string
          id: string
          is_active?: boolean
          must_change_password?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          must_change_password?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      receivables: {
        Row: {
          amount: number
          business_unit_id: string
          category_id: string | null
          client_id: string | null
          closed_at: string | null
          created_at: string
          created_by: string | null
          description: string
          due_date: string
          haras_client_id: string | null
          id: string
          paid_account_category_id: string | null
          paid_at: string | null
          preferred_bank_account_id: string | null
          recurring_invoice_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          business_unit_id: string
          category_id?: string | null
          client_id?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          due_date: string
          haras_client_id?: string | null
          id?: string
          paid_account_category_id?: string | null
          paid_at?: string | null
          preferred_bank_account_id?: string | null
          recurring_invoice_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          business_unit_id?: string
          category_id?: string | null
          client_id?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string
          haras_client_id?: string | null
          id?: string
          paid_account_category_id?: string | null
          paid_at?: string | null
          preferred_bank_account_id?: string | null
          recurring_invoice_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "receivables_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_haras_client_id_fkey"
            columns: ["haras_client_id"]
            isOneToOne: false
            referencedRelation: "haras_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_paid_account_category_id_fkey"
            columns: ["paid_account_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_preferred_bank_account_id_fkey"
            columns: ["preferred_bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_account_balances"
            referencedColumns: ["bank_account_id"]
          },
          {
            foreignKeyName: "receivables_preferred_bank_account_id_fkey"
            columns: ["preferred_bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_recurring_invoice_id_fkey"
            columns: ["recurring_invoice_id"]
            isOneToOne: false
            referencedRelation: "haras_recurring_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receivables_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_payables: {
        Row: {
          amount: number
          business_unit_id: string
          category_id: string | null
          created_at: string
          created_by: string | null
          day_of_month: number
          description: string
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean
          next_run_date: string
          notes: string | null
          start_date: string
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          business_unit_id: string
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          day_of_month: number
          description: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          next_run_date: string
          notes?: string | null
          start_date?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          business_unit_id?: string
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          day_of_month?: number
          description?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          next_run_date?: string
          notes?: string | null
          start_date?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          business_unit_id: string
          client_id: string | null
          created_at: string
          created_by: string | null
          end_date: string
          id: string
          notes: string | null
          receivable_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["reservation_status"]
          title: string
          total_amount: number
          updated_at: string
        }
        Insert: {
          business_unit_id: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          end_date: string
          id?: string
          notes?: string | null
          receivable_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["reservation_status"]
          title: string
          total_amount?: number
          updated_at?: string
        }
        Update: {
          business_unit_id?: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          end_date?: string
          id?: string
          notes?: string | null
          receivable_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          title?: string
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      sale_installment_notifications: {
        Row: {
          id: string
          installment_id: string
          kind: string
          sent_at: string
        }
        Insert: {
          id?: string
          installment_id: string
          kind: string
          sent_at?: string
        }
        Update: {
          id?: string
          installment_id?: string
          kind?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_installment_notifications_installment_id_fkey"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "sale_installments"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_installments: {
        Row: {
          amount: number
          created_at: string
          discount_amount: number
          due_date: string
          fine_amount: number
          id: string
          installment_number: number
          interest_amount: number
          paid_at: string | null
          parent_installment_id: string | null
          receivable_id: string | null
          sale_id: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          discount_amount?: number
          due_date: string
          fine_amount?: number
          id?: string
          installment_number: number
          interest_amount?: number
          paid_at?: string | null
          parent_installment_id?: string | null
          receivable_id?: string | null
          sale_id: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          discount_amount?: number
          due_date?: string
          fine_amount?: number
          id?: string
          installment_number?: number
          interest_amount?: number
          paid_at?: string | null
          parent_installment_id?: string | null
          receivable_id?: string | null
          sale_id?: string
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_installments_parent_installment_id_fkey"
            columns: ["parent_installment_id"]
            isOneToOne: false
            referencedRelation: "sale_installments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_installments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "animal_sales"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_installments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "v_sale_reconciliation"
            referencedColumns: ["sale_id"]
          },
        ]
      }
      transactions: {
        Row: {
          adjustment_reason: string | null
          amount: number
          attachment_url: string | null
          bank_account_id: string | null
          business_unit_id: string
          category_id: string | null
          client_id: string | null
          closed_at: string | null
          created_at: string
          created_by: string | null
          date: string
          description: string
          id: string
          is_adjustment: boolean
          is_transfer: boolean
          reconciled_at: string | null
          reconciled_by: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transfer_counterpart_account_id: string | null
          transfer_group_id: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
        }
        Insert: {
          adjustment_reason?: string | null
          amount: number
          attachment_url?: string | null
          bank_account_id?: string | null
          business_unit_id: string
          category_id?: string | null
          client_id?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description: string
          id?: string
          is_adjustment?: boolean
          is_transfer?: boolean
          reconciled_at?: string | null
          reconciled_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transfer_counterpart_account_id?: string | null
          transfer_group_id?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Update: {
          adjustment_reason?: string | null
          amount?: number
          attachment_url?: string | null
          bank_account_id?: string | null
          business_unit_id?: string
          category_id?: string | null
          client_id?: string | null
          closed_at?: string | null
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          is_adjustment?: boolean
          is_transfer?: boolean
          reconciled_at?: string | null
          reconciled_by?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transfer_counterpart_account_id?: string | null
          transfer_group_id?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_account_balances"
            referencedColumns: ["bank_account_id"]
          },
          {
            foreignKeyName: "transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_transfer_counterpart_account_id_fkey"
            columns: ["transfer_counterpart_account_id"]
            isOneToOne: false
            referencedRelation: "bank_account_balances"
            referencedColumns: ["bank_account_id"]
          },
          {
            foreignKeyName: "transactions_transfer_counterpart_account_id_fkey"
            columns: ["transfer_counterpart_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_module_permissions: {
        Row: {
          action: Database["public"]["Enums"]["permission_action"]
          created_at: string
          id: string
          module: Database["public"]["Enums"]["app_module"]
          user_id: string
        }
        Insert: {
          action: Database["public"]["Enums"]["permission_action"]
          created_at?: string
          id?: string
          module: Database["public"]["Enums"]["app_module"]
          user_id: string
        }
        Update: {
          action?: Database["public"]["Enums"]["permission_action"]
          created_at?: string
          id?: string
          module?: Database["public"]["Enums"]["app_module"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_unit_access: {
        Row: {
          business_unit_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          business_unit_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          business_unit_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_unit_access_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      bank_account_balances: {
        Row: {
          bank_account_id: string | null
          last_movement_date: string | null
          movements_count: number | null
          realized_balance: number | null
          total_expense: number | null
          total_income: number | null
        }
        Relationships: []
      }
      bank_contract_progress: {
        Row: {
          business_unit_id: string | null
          contract_id: string | null
          installments_count: number | null
          last_paid_date: string | null
          next_due_date: string | null
          overdue_count: number | null
          paid_amount: number | null
          paid_count: number | null
          pending_amount: number | null
          pending_count: number | null
          progress_pct: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_contracts_business_unit_id_fkey"
            columns: ["business_unit_id"]
            isOneToOne: false
            referencedRelation: "business_units"
            referencedColumns: ["id"]
          },
        ]
      }
      v_haras_reproduction_alerts: {
        Row: {
          alert_type: string | null
          business_unit_id: string | null
          days_delta: number | null
          due_date: string | null
          mare_name: string | null
          reference_id: string | null
          reference_type: string | null
          severity: string | null
          stallion_name: string | null
        }
        Relationships: []
      }
      v_sale_delinquency_by_buyer: {
        Row: {
          business_unit_id: string | null
          buyer_client_id: string | null
          buyer_name: string | null
          max_days_overdue: number | null
          oldest_due_date: string | null
          overdue_amount: number | null
          overdue_installments: number | null
        }
        Relationships: []
      }
      v_sale_health_checks: {
        Row: {
          business_unit_id: string | null
          check_kind: string | null
          details: Json | null
          sale_id: string | null
        }
        Relationships: []
      }
      v_sale_reconciliation: {
        Row: {
          animal_name: string | null
          business_unit_id: string | null
          buyer_name: string | null
          diff_installments: number | null
          down_payment: number | null
          paid_installments: number | null
          reconciliation_status: string | null
          sale_date: string | null
          sale_id: string | null
          sale_status: Database["public"]["Enums"]["sale_status"] | null
          sum_installments: number | null
          total_amount: number | null
          total_installments: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      _create_bank_contract_impl: {
        Args: { _payload: Json; _renegotiated_from: string }
        Returns: string
      }
      _haras_regenerate_shares: { Args: { _tx_id: string }; Returns: undefined }
      _haras_split_largest_remainder: {
        Args: { _amount: number; _parts: Json }
        Returns: {
          client_id: string
          ownership_percentage: number
          share_amount: number
        }[]
      }
      add_revolving_charge: { Args: { _payload: Json }; Returns: string }
      admin_replace_user_permissions: {
        Args: {
          _caller_id: string
          _is_active: boolean
          _perms: Json
          _unit_ids: string[]
          _user_id: string
        }
        Returns: undefined
      }
      can_access_unit: {
        Args: { _unit_id: string; _user_id: string }
        Returns: boolean
      }
      can_use_bank_account: {
        Args: {
          _bank_account_id: string
          _business_unit_id: string
          _user_id: string
        }
        Returns: boolean
      }
      can_view_bank_account: {
        Args: { _bank_account_id: string; _user_id: string }
        Returns: boolean
      }
      cancel_animal_sale: {
        Args: { _reason: string; _sale_id: string }
        Returns: {
          animal_id: string
          auction_lot_id: string | null
          business_unit_id: string
          buyer_client_id: string
          cancel_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          commission: number
          commission_category_id: string | null
          commission_client_id: string | null
          commission_due_date: string | null
          commission_mode: string
          commission_payable_id: string | null
          commission_receivable_id: string | null
          contract_generated_at: string | null
          contract_path: string | null
          covering_mare_note: string | null
          created_at: string
          created_by: string | null
          crop_year: number | null
          donor_animal_id: string | null
          down_payment: number
          down_payment_date: string | null
          first_due_date: string | null
          id: string
          installments_count: number
          notes: string | null
          paid_account_category_id: string | null
          payment_method: Database["public"]["Enums"]["sale_payment_method"]
          product_type: string
          recipient_animal_id: string | null
          sale_date: string
          sale_type: string
          share_pct: number | null
          sire_animal_id: string | null
          status: Database["public"]["Enums"]["sale_status"]
          total_amount: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "animal_sales"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      cancel_recurring_payable_series: {
        Args: { _template_id: string }
        Returns: undefined
      }
      close_receivable: { Args: { _id: string }; Returns: string }
      close_transaction: { Args: { _id: string }; Returns: string }
      create_animal_sale: { Args: { _payload: Json }; Returns: string }
      create_animal_sale_custom: {
        Args: { _installments: Json; _payload: Json }
        Returns: string
      }
      create_animal_sale_v2: {
        Args: { _buyer_new?: Json; _installments: Json; _payload: Json }
        Returns: string
      }
      create_bank_adjustment: {
        Args: {
          _amount: number
          _bank_account_id: string
          _date?: string
          _direction: string
          _reason: string
        }
        Returns: string
      }
      create_bank_contract: { Args: { _payload: Json }; Returns: string }
      create_bank_transfer: {
        Args: {
          _amount: number
          _date: string
          _description?: string
          _from_account_id: string
          _to_account_id: string
        }
        Returns: string
      }
      create_recurring_payable: { Args: { _payload: Json }; Returns: string }
      delete_animal_sale: { Args: { _sale_id: string }; Returns: undefined }
      generate_monthly_payroll: {
        Args: {
          _category_id: string
          _due_date: string
          _employee_ids?: string[]
          _period: string
          _unit_id: string
        }
        Returns: Json
      }
      generate_recurring_payables: {
        Args: { _source?: string; _unit_id?: string }
        Returns: number
      }
      generate_recurring_receivables: {
        Args: { _source?: string; _unit_id?: string }
        Returns: number
      }
      get_bank_account_balance: { Args: { _id: string }; Returns: Json }
      haras_cancel_purchase: {
        Args: { _id: string; _reason?: string }
        Returns: string
      }
      haras_create_purchase: { Args: { _payload: Json }; Returns: string }
      haras_fiv_finalize: {
        Args: {
          _batch_id: string
          _blastocysts: number
          _container?: Database["public"]["Enums"]["repro_embryo_container"]
          _produced_at?: string
          _stage?: Database["public"]["Enums"]["repro_embryo_stage"]
        }
        Returns: string[]
      }
      haras_generate_payables_for_purchase: {
        Args: { _purchase_id: string }
        Returns: number
      }
      haras_pay_commission_installment: {
        Args: {
          _bank_account_id: string
          _installment_id: string
          _paid_date: string
        }
        Returns: string
      }
      haras_pay_purchase_installment: {
        Args: {
          _bank_account_id: string
          _installment_id: string
          _paid_date: string
        }
        Returns: string
      }
      haras_recompute_purchase_status: {
        Args: { _purchase_id: string }
        Returns: undefined
      }
      haras_reverse_commission_installment: {
        Args: { _installment_id: string; _reason?: string }
        Returns: string
      }
      haras_reverse_purchase_installment: {
        Args: { _installment_id: string; _reason?: string }
        Returns: string
      }
      haras_update_purchase: {
        Args: { _id: string; _payload: Json }
        Returns: string
      }
      has_permission: {
        Args: {
          _action: Database["public"]["Enums"]["permission_action"]
          _module: Database["public"]["Enums"]["app_module"]
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_feature_enabled: {
        Args: { _flag_name: string; _unit_id: string }
        Returns: boolean
      }
      mark_overdue: { Args: never; Returns: undefined }
      mark_payable_paid:
        | {
            Args: {
              _account_category_id: string
              _id: string
              _payment_date: string
            }
            Returns: string
          }
        | {
            Args: {
              _account_category_id: string
              _bank_account_id?: string
              _id: string
              _payment_date: string
            }
            Returns: string
          }
      mark_receivable_paid:
        | {
            Args: {
              _account_category_id: string
              _id: string
              _payment_date: string
            }
            Returns: string
          }
        | {
            Args: {
              _account_category_id: string
              _bank_account_id?: string
              _id: string
              _payment_date: string
            }
            Returns: string
          }
      notify_bu_users: {
        Args: {
          _body: string
          _bu: string
          _entity_id: string
          _entity_table: string
          _link: string
          _module: Database["public"]["Enums"]["app_module"]
          _title: string
          _type: Database["public"]["Enums"]["notification_type"]
        }
        Returns: undefined
      }
      notify_upcoming_dues: { Args: never; Returns: undefined }
      notify_upcoming_sale_installments: { Args: never; Returns: number }
      partial_pay_and_reschedule: {
        Args: {
          _account_category_id?: string
          _amount_paid: number
          _bank_account_id: string
          _new_due_date: string
          _payable_id: string
          _payment_date: string
          _reason: string
        }
        Returns: string
      }
      pay_sale_installment:
        | {
            Args: {
              _account_category_id: string
              _discount?: number
              _fine?: number
              _installment_id: string
              _interest?: number
              _payment_date: string
            }
            Returns: string
          }
        | {
            Args: {
              _account_category_id: string
              _bank_account_id?: string
              _discount?: number
              _fine?: number
              _installment_id: string
              _interest?: number
              _payment_date: string
            }
            Returns: string
          }
      preview_animal_share_split: {
        Args: { _amount: number; _animal_id: string }
        Returns: {
          client_id: string
          ownership_percentage: number
          share_amount: number
        }[]
      }
      preview_monthly_payroll: {
        Args: { _period: string; _unit_id: string }
        Returns: {
          already_generated: boolean
          base_salary: number
          employee_id: string
          employee_name: string
          existing_payable_id: string
          fgts: number
          inss: number
          meal: number
          net_amount: number
          other: number
          transport: number
        }[]
      }
      recalc_sale_installments: {
        Args: {
          _new_first_due_date: string
          _new_installments_count: number
          _sale_id: string
        }
        Returns: undefined
      }
      recalc_sale_installments_custom: {
        Args: { _installments: Json; _sale_id: string }
        Returns: undefined
      }
      recompute_animal_transaction_shares: {
        Args: { _tx_id: string }
        Returns: undefined
      }
      reconcile_transaction: {
        Args: { _transaction_id: string }
        Returns: undefined
      }
      renegotiate_bank_contract: { Args: { _payload: Json }; Returns: string }
      renegotiate_sale_installment: {
        Args: { _installment_id: string; _new_installments: Json }
        Returns: {
          amount: number
          created_at: string
          discount_amount: number
          due_date: string
          fine_amount: number
          id: string
          installment_number: number
          interest_amount: number
          paid_at: string | null
          parent_installment_id: string | null
          receivable_id: string | null
          sale_id: string
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }[]
        SetofOptions: {
          from: "*"
          to: "sale_installments"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      reopen_receivable: { Args: { _id: string }; Returns: undefined }
      reopen_transaction: { Args: { _id: string }; Returns: undefined }
      replace_animal_partners: {
        Args: { _animal_id: string; _partners: Json }
        Returns: undefined
      }
      report_payroll_by_employee: {
        Args: { _end_date: string; _start_date: string; _unit_id: string }
        Returns: {
          business_unit_id: string
          business_unit_name: string
          employee_id: string
          employee_name: string
          entries_count: number
          total_credits: number
          total_debits: number
          total_gross: number
          total_net: number
        }[]
      }
      repro_cancel_breeding: {
        Args: { p_reason: string; p_session_id: string }
        Returns: undefined
      }
      repro_cancel_embryo_transfer: {
        Args: { p_reason: string; p_transfer_id: string }
        Returns: {
          embryo_id: string
          embryo_status: Database["public"]["Enums"]["repro_embryo_status"]
        }[]
      }
      repro_cancel_pregnancy: {
        Args: { p_pregnancy_id: string; p_reason: string }
        Returns: undefined
      }
      repro_close_pregnancy: {
        Args: {
          p_notes?: string
          p_offspring_animal_id?: string
          p_outcome: Database["public"]["Enums"]["repro_pregnancy_status"]
          p_outcome_date: string
          p_pregnancy_id: string
        }
        Returns: undefined
      }
      repro_consume_semen: {
        Args: {
          p_batch_id: string
          p_doses: number
          p_idempotency_key?: string
          p_notes?: string
          p_reason: Database["public"]["Enums"]["repro_movement_reason"]
          p_ref_id?: string
          p_ref_type?: string
        }
        Returns: {
          doses_available_after: number
          movement_id: string
          reused: boolean
        }[]
      }
      repro_discard_embryo: {
        Args: { p_embryo_id: string; p_notes?: string; p_reason: string }
        Returns: Database["public"]["Enums"]["repro_embryo_status"]
      }
      repro_perform_breeding: {
        Args: {
          p_notes?: string
          p_performed_at?: string
          p_session_id: string
        }
        Returns: {
          embryo_transfer_id: string
          reused: boolean
          semen_movement_id: string
          session_id: string
        }[]
      }
      repro_register_birth: {
        Args: {
          p_animal_type?: string
          p_birth_date: string
          p_foal_name: string
          p_foal_sex: string
          p_notes?: string
          p_pregnancy_id: string
          p_registration_code?: string
        }
        Returns: Json
      }
      repro_register_diagnostic: {
        Args: {
          p_diagnosed_at: string
          p_method: Database["public"]["Enums"]["repro_diagnostic_method"]
          p_notes?: string
          p_observed_days?: number
          p_pregnancy_id: string
          p_result: Database["public"]["Enums"]["repro_diagnostic_result"]
        }
        Returns: string
      }
      repro_register_pregnancy: {
        Args: {
          p_breeding_session_id?: string
          p_business_unit_id: string
          p_conception_date?: string
          p_donor_mare_id?: string
          p_gestation_days?: number
          p_mare_id: string
          p_notes?: string
          p_stallion_id?: string
        }
        Returns: string
      }
      repro_revert_birth: {
        Args: { p_pregnancy_id: string; p_reason: string }
        Returns: Json
      }
      repro_revert_performed_breeding: {
        Args: { p_reason: string; p_session_id: string }
        Returns: undefined
      }
      repro_revert_semen_movement: {
        Args: { p_movement_id: string; p_notes?: string }
        Returns: {
          doses_available_after: number
          reversal_id: string
        }[]
      }
      repro_schedule_breeding: {
        Args: {
          p_business_unit_id: string
          p_doses_used?: number
          p_embryo_id?: string
          p_mare_id: string
          p_method: Database["public"]["Enums"]["repro_breeding_method"]
          p_notes?: string
          p_scheduled_at: string
          p_semen_batch_id?: string
          p_stallion_id: string
        }
        Returns: string
      }
      repro_transfer_embryo: {
        Args: {
          p_embryo_id: string
          p_notes?: string
          p_recipient_mare_id: string
          p_transfer_date?: string
        }
        Returns: {
          embryo_status: Database["public"]["Enums"]["repro_embryo_status"]
          transfer_id: string
        }[]
      }
      repro_update_embryo_transfer_outcome: {
        Args: {
          p_notes?: string
          p_outcome: Database["public"]["Enums"]["repro_embryo_outcome"]
          p_transfer_id: string
        }
        Returns: Database["public"]["Enums"]["repro_embryo_outcome"]
      }
      reservation_overlaps: {
        Args: {
          _end: string
          _ignore_id: string
          _start: string
          _unit_id: string
        }
        Returns: boolean
      }
      reverse_bank_transfer: {
        Args: { _reason?: string; _transfer_group_id: string }
        Returns: string
      }
      revert_sale_installment_payment: {
        Args: { _installment_id: string }
        Returns: undefined
      }
      rollback_payroll_batch: { Args: { _batch_id: string }; Returns: Json }
      set_animal_share_status: {
        Args: { _share_id: string; _status: string }
        Returns: undefined
      }
      settle_bank_contract: { Args: { _payload: Json }; Returns: string }
      unmark_payable_paid: { Args: { _id: string }; Returns: undefined }
      unmark_receivable_paid: { Args: { _id: string }; Returns: undefined }
      unreconcile_transaction: {
        Args: { _transaction_id: string }
        Returns: undefined
      }
      update_animal_sale_meta: {
        Args: { _payload: Json; _sale_id: string }
        Returns: undefined
      }
      update_sale_installment_due_date: {
        Args: { _installment_id: string; _new_due: string }
        Returns: undefined
      }
      update_sale_installment_payment_date: {
        Args: { _installment_id: string; _new_paid_at: string }
        Returns: undefined
      }
      upsert_sale_commission_payable: {
        Args: { _payload: Json; _sale_id: string }
        Returns: string
      }
      upsert_sale_commission_receivable: {
        Args: { _payload: Json; _sale_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_module:
        | "dashboard"
        | "cash_flow"
        | "receivables"
        | "clients"
        | "categories"
        | "loans"
        | "team"
        | "reservations"
        | "sales"
        | "payables"
        | "bank_accounts"
        | "bank_contracts"
        | "employees"
        | "haras_purchases"
      app_role: "admin" | "member"
      auction_lot_status:
        | "draft"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
      bank_account_type:
        | "checking"
        | "savings"
        | "cash"
        | "card"
        | "investment"
        | "other"
      bank_contract_status: "active" | "paid_off" | "renegotiated" | "cancelled"
      bank_contract_type:
        | "working_capital"
        | "loan"
        | "consortium"
        | "revolving"
        | "discounted_bill"
      business_unit_type: "office" | "events" | "rental" | "loans" | "haras"
      haras_follicle_recommendation:
        | "aguardar"
        | "hormonio"
        | "cobrir_agora"
        | "cobrir_24h"
        | "cobrir_48h"
        | "nao_cobrir"
      haras_ovary_side: "esquerdo" | "direito"
      haras_uterine_edema: "ausente" | "leve" | "moderado" | "acentuado"
      loan_status: "active" | "paid_off" | "defaulted"
      notification_type:
        | "due_soon_receivable"
        | "due_soon_payable"
        | "became_overdue"
        | "sale_installment_paid"
        | "sale_installment_due_soon"
        | "sale_installment_overdue"
      payment_status:
        | "pending"
        | "paid"
        | "overdue"
        | "renegotiated"
        | "cancelled"
      permission_action: "view" | "create" | "edit" | "delete"
      repro_breeding_method:
        | "monta_natural"
        | "ia_fresco"
        | "ia_refrigerado"
        | "ia_congelado"
        | "te"
      repro_breeding_status: "agendado" | "realizado" | "cancelado"
      repro_diagnostic_method: "us" | "palpacao" | "sangue" | "outro"
      repro_diagnostic_result:
        | "positivo"
        | "negativo"
        | "duvidoso"
        | "reabsorcao"
        | "obito_fetal"
      repro_embryo_container: "palheta" | "criotubo" | "outro"
      repro_embryo_origin: "te" | "opu_fiv" | "importado"
      repro_embryo_outcome:
        | "pendente"
        | "prenhez_confirmada"
        | "perdida"
        | "nao_prenhez"
      repro_embryo_stage:
        | "d6"
        | "d7"
        | "d8"
        | "expandido"
        | "eclodido"
        | "outro"
      repro_embryo_status:
        | "disponivel"
        | "transferido"
        | "descartado"
        | "perdido"
      repro_libido: "baixa" | "media" | "boa" | "excelente"
      repro_movement_kind: "in" | "out" | "reversal"
      repro_movement_reason:
        | "coleta"
        | "ia"
        | "te"
        | "venda"
        | "descarte"
        | "ajuste"
        | "estorno"
        | "fiv"
      repro_pregnancy_status:
        | "em_andamento"
        | "concluida"
        | "abortada"
        | "confirmada"
        | "perdida"
        | "cancelada"
      repro_semen_container: "palheta" | "pellet" | "ampola"
      repro_semen_type: "fresco" | "refrigerado" | "congelado"
      repro_sex: "macho" | "femea" | "castrado"
      reservation_status: "pending" | "confirmed" | "cancelled" | "completed"
      sale_payment_method: "cash" | "installments" | "financed"
      sale_status: "draft" | "active" | "completed" | "cancelled"
      transaction_type: "income" | "expense"
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
      app_module: [
        "dashboard",
        "cash_flow",
        "receivables",
        "clients",
        "categories",
        "loans",
        "team",
        "reservations",
        "sales",
        "payables",
        "bank_accounts",
        "bank_contracts",
        "employees",
        "haras_purchases",
      ],
      app_role: ["admin", "member"],
      auction_lot_status: [
        "draft",
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
      ],
      bank_account_type: [
        "checking",
        "savings",
        "cash",
        "card",
        "investment",
        "other",
      ],
      bank_contract_status: ["active", "paid_off", "renegotiated", "cancelled"],
      bank_contract_type: [
        "working_capital",
        "loan",
        "consortium",
        "revolving",
        "discounted_bill",
      ],
      business_unit_type: ["office", "events", "rental", "loans", "haras"],
      haras_follicle_recommendation: [
        "aguardar",
        "hormonio",
        "cobrir_agora",
        "cobrir_24h",
        "cobrir_48h",
        "nao_cobrir",
      ],
      haras_ovary_side: ["esquerdo", "direito"],
      haras_uterine_edema: ["ausente", "leve", "moderado", "acentuado"],
      loan_status: ["active", "paid_off", "defaulted"],
      notification_type: [
        "due_soon_receivable",
        "due_soon_payable",
        "became_overdue",
        "sale_installment_paid",
        "sale_installment_due_soon",
        "sale_installment_overdue",
      ],
      payment_status: [
        "pending",
        "paid",
        "overdue",
        "renegotiated",
        "cancelled",
      ],
      permission_action: ["view", "create", "edit", "delete"],
      repro_breeding_method: [
        "monta_natural",
        "ia_fresco",
        "ia_refrigerado",
        "ia_congelado",
        "te",
      ],
      repro_breeding_status: ["agendado", "realizado", "cancelado"],
      repro_diagnostic_method: ["us", "palpacao", "sangue", "outro"],
      repro_diagnostic_result: [
        "positivo",
        "negativo",
        "duvidoso",
        "reabsorcao",
        "obito_fetal",
      ],
      repro_embryo_container: ["palheta", "criotubo", "outro"],
      repro_embryo_origin: ["te", "opu_fiv", "importado"],
      repro_embryo_outcome: [
        "pendente",
        "prenhez_confirmada",
        "perdida",
        "nao_prenhez",
      ],
      repro_embryo_stage: ["d6", "d7", "d8", "expandido", "eclodido", "outro"],
      repro_embryo_status: [
        "disponivel",
        "transferido",
        "descartado",
        "perdido",
      ],
      repro_libido: ["baixa", "media", "boa", "excelente"],
      repro_movement_kind: ["in", "out", "reversal"],
      repro_movement_reason: [
        "coleta",
        "ia",
        "te",
        "venda",
        "descarte",
        "ajuste",
        "estorno",
        "fiv",
      ],
      repro_pregnancy_status: [
        "em_andamento",
        "concluida",
        "abortada",
        "confirmada",
        "perdida",
        "cancelada",
      ],
      repro_semen_container: ["palheta", "pellet", "ampola"],
      repro_semen_type: ["fresco", "refrigerado", "congelado"],
      repro_sex: ["macho", "femea", "castrado"],
      reservation_status: ["pending", "confirmed", "cancelled", "completed"],
      sale_payment_method: ["cash", "installments", "financed"],
      sale_status: ["draft", "active", "completed", "cancelled"],
      transaction_type: ["income", "expense"],
    },
  },
} as const
