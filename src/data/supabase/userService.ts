import { supabase } from './client';
import { UserRow, UserUpdate } from './types';
import { SignUpFormValues } from './user-types';

export class UserService {
  static async create(userData: SignUpFormValues, authId: string): Promise<UserRow> {
    const username = userData.username || userData.firstName.toLowerCase();
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authId,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        username: username,
        country: userData.country,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getById(id: string): Promise<UserRow | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async getByEmail(email: string): Promise<UserRow | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
    return data || null;
  }

  static async update(id: string, updates: Partial<Omit<SignUpFormValues, 'email' | 'password'>>): Promise<UserRow> {
    const supabaseUpdates: UserUpdate = {};
    
    if (updates.firstName !== undefined) supabaseUpdates.first_name = updates.firstName;
    if (updates.lastName !== undefined) supabaseUpdates.last_name = updates.lastName;
    if (updates.username !== undefined) supabaseUpdates.username = updates.username;
    if (updates.country !== undefined) supabaseUpdates.country = updates.country;

    const { data, error } = await supabase
      .from('users')
      .update(supabaseUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async checkUsernameExists(username: string, excludeUserId?: string): Promise<boolean> {
    let query = supabase
      .from('users')
      .select('id')
      .eq('username', username);

    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length > 0;
  }

  static async checkEmailExists(email: string, excludeUserId?: string): Promise<boolean> {
    let query = supabase
      .from('users')
      .select('id')
      .eq('email', email);

    if (excludeUserId) {
      query = query.neq('id', excludeUserId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data.length > 0;
  }
}
