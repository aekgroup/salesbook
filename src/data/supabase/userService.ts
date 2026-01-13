import { supabase } from './client';
import { UUID } from '../../shared/types';

export class UserService {
  static async getCurrentUserId(): Promise<UUID> {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;

    const user = data.user;
    if (!user) throw new Error('User not authenticated');

    return user.id as UUID;
  }
}
