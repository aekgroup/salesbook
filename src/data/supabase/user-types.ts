import { UUID } from '../../shared/types';

// Supabase users table types
export interface Database {
  public: {
    Tables: {
      // ... existing tables
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
      // ... other existing tables
    };
    // ... rest of database types
  };
}

// Helper types for users table
export type UserRow = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// App user interface
export interface AppUser {
  id: UUID;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

// Form types
export interface SignUpFormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username?: string;
  country: string;
}

export interface SignInFormValues {
  email: string;
  password: string;
}
