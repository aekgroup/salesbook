import { useState, useEffect } from 'react';
import { authService, AuthState } from '../data/supabase/auth';
import { SignUpFormValues } from '../data/supabase/user-types';

export function useSupabaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = authService.subscribe((state) => {
      setAuthState(state);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    const result = await authService.signIn(email, password);
    
    if (!result.success) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error || null }));
    }
    
    return result;
  };

  const signUp = async (userData: SignUpFormValues) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    const result = await authService.signUp(userData);
    
    if (!result.success) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error || null }));
    }
    
    return result;
  };

  const signOut = async () => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    const result = await authService.signOut();
    
    if (!result.success) {
      setAuthState(prev => ({ ...prev, loading: false, error: result.error || null }));
    }
    
    return result;
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: authState.user !== null,
    user: authState.user,
    userProfile: authState.userProfile
  };
}
