import { supabase } from './client';
import { User } from '@supabase/supabase-js';
import { UserService } from './userService';
import { SignUpFormValues } from './user-types';

export interface AuthState {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  error: string | null;
}

export class AuthService {
  private static instance: AuthService;
  private user: User | null = null;
  private userProfile: any | null = null;
  private listeners: ((state: AuthState) => void)[] = [];

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  addListener(listener: (state: AuthState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private async initializeAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      this.user = session?.user ?? null;
      
      if (this.user) {
        // Utiliser les métadonnées au lieu de la table users
        this.userProfile = {
          id: this.user.id,
          email: this.user.email,
          firstName: this.user.user_metadata?.first_name || '',
          lastName: this.user.user_metadata?.last_name || '',
          username: this.user.user_metadata?.username || '',
          country: this.user.user_metadata?.country || '',
          createdAt: this.user.created_at,
          updatedAt: new Date().toISOString()
        };
      }
      
      supabase.auth.onAuthStateChange(async (event, session) => {
        this.user = session?.user ?? null;
        this.userProfile = this.user ? {
          id: this.user.id,
          email: this.user.email,
          firstName: this.user.user_metadata?.first_name || '',
          lastName: this.user.user_metadata?.last_name || '',
          username: this.user.user_metadata?.username || '',
          country: this.user.user_metadata?.country || '',
          createdAt: this.user.created_at,
          updatedAt: new Date().toISOString()
        } : null;
        this.notifyListeners();
      });
      
      this.notifyListeners();
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.notifyListeners();
    }
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    listener(this.getAuthState());
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const state = this.getAuthState();
    this.listeners.forEach(listener => listener(state));
  }

  private getAuthState(): AuthState {
    return {
      user: this.user,
      userProfile: this.userProfile,
      loading: false,
      error: null
    };
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion' 
      };
    }
  }

  async signUp(userData: SignUpFormValues) {
    try {
      // Check if email already exists (désactivé temporairement)
      // const emailExists = await UserService.checkEmailExists(userData.email);
      // if (emailExists) {
      //   return { 
      //     success: false, 
      //     error: 'Cet email est déjà utilisé' 
      //   };
      // }

      // Check if username already exists (désactivé temporairement)
      const username = userData.username || userData.firstName.toLowerCase();
      // const usernameExists = await UserService.checkUsernameExists(username);
      // if (usernameExists) {
      //   return { 
      //     success: false, 
      //     error: 'Ce nom d\'utilisateur est déjà pris' 
      //   };
      // }

      // Create auth user with metadata
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            username: username,
            country: userData.country,
          }
        }
      });

      if (error) throw error;

      // Utiliser seulement les métadonnées Supabase Auth
      // Plus besoin de la table users personnalisée
      if (data.user) {
        console.log('Utilisateur créé avec succès dans Supabase Auth');
        console.log('Métadonnées:', data.user.user_metadata);
      }

      return { success: true, data };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur d\'inscription' 
      };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de déconnexion' 
      };
    }
  }

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de réinitialisation' 
      };
    }
  }

  getCurrentUser(): User | null {
    return this.user;
  }

  getUserProfile(): any | null {
    return this.userProfile;
  }

  isAuthenticated(): boolean {
    return this.user !== null;
  }
}

export const authService = AuthService.getInstance();
