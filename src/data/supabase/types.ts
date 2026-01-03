import { UUID } from '../../shared/types';

// Supabase database table types
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: UUID;
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
      preferences: {
        Row: {
          id: string;
          currency: string;
          payment_methods: string; // JSON string
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['preferences']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['preferences']['Row'], 'id'>>;
      };
      users: {
        Row: {
          id: UUID;
          email: string;
          first_name: string;
          last_name: string;
          username: string;
          country: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at'>>;
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

export type PreferencesRow = Database['public']['Tables']['preferences']['Row'];
export type PreferencesInsert = Database['public']['Tables']['preferences']['Insert'];
export type PreferencesUpdate = Database['public']['Tables']['preferences']['Update'];

export type UserRow = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];
