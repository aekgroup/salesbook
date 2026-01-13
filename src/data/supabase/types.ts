import { UUID } from '../../shared/types';

// Supabase database table types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: UUID;
          user_id: UUID; // Ajouté
          sku: string;
          name: string;
          category: string;
          brand?: string;
          purchase_price: number;
          sale_price: number;
          quantity: number;
          status_id: UUID;
          reorder_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>>;
      };
      statuses: {
        Row: {
          id: UUID;
          label: string;
          color: string;
          is_default: boolean;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['statuses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['statuses']['Row'], 'id' | 'created_at'>>;
      };
      sales: {
        Row: {
          id: UUID;
          user_id: UUID; // Ajouté
          date: string;
          total_revenue: number;
          total_cost: number;
          total_profit: number;
          payment_method?: string;
          note?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['sales']['Row'], 'id' | 'created_at'>>;
      };
      sale_items: {
        Row: {
          id: UUID;
          sale_id: UUID;
          product_id: UUID;
          qty: number;
          unit_sale_price: number;
          unit_cost_price: number;
          profit_line: number;
        };
        Insert: Omit<Database['public']['Tables']['sale_items']['Row'], 'id'>;
        Update: Partial<Omit<Database['public']['Tables']['sale_items']['Row'], 'id'>>;
      };
      expenses: {
        Row: {
          id: UUID;
          user_id: UUID; // Ajouté
          label: string;
          category: string;
          amount: number;
          date: string;
          note?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at'>>;
      };
      preferences: {
        Row: {
          id: string;
          user_id: UUID; // Ajouté
          currency: string;
          payment_methods: string; // JSON string
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['preferences']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['preferences']['Row'], 'id'>>;
      };
      subscriptions: {
        Row: {
          id: UUID;
          user_id: UUID;
          status: 'trial' | 'active' | 'expired' | 'canceled';
          trial_ends_at?: string;
          subscription_ends_at?: string;
          plan_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at'>>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Helper types for Supabase operations
export type ProductRow = Database['public']['Tables']['products']['Row'];
export type ProductInsert = Database['public']['Tables']['products']['Insert'];
export type ProductUpdate = Database['public']['Tables']['products']['Update'];

export type StatusRow = Database['public']['Tables']['statuses']['Row'];
export type StatusInsert = Database['public']['Tables']['statuses']['Insert'];
export type StatusUpdate = Database['public']['Tables']['statuses']['Update'];

export type SaleRow = Database['public']['Tables']['sales']['Row'];
export type SaleInsert = Database['public']['Tables']['sales']['Insert'];
export type SaleUpdate = Database['public']['Tables']['sales']['Update'];

export type SaleItemRow = Database['public']['Tables']['sale_items']['Row'];
export type SaleItemInsert = Database['public']['Tables']['sale_items']['Insert'];
export type SaleItemUpdate = Database['public']['Tables']['sale_items']['Update'];

export type ExpenseRow = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

export type PreferencesRow = Database['public']['Tables']['preferences']['Row'];
export type PreferencesInsert = Database['public']['Tables']['preferences']['Insert'];
export type PreferencesUpdate = Database['public']['Tables']['preferences']['Update'];

export type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];
export type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
export type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];
