import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, AuthState } from '../data/supabase/auth';
import { SubscriptionService, SubscriptionInfo } from '../data/supabase/subscriptionService';

interface AppContextType {
  authState: AuthState;
  subscriptionInfo: SubscriptionInfo | null;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    error: null
  });
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSubscription = async () => {
    if (authState.user) {
      try {
        const subInfo = await SubscriptionService.getSubscriptionInfo(authState.user.id);
        setSubscriptionInfo(subInfo);
      } catch (error) {
        console.error('Error refreshing subscription:', error);
      }
    }
  };

  useEffect(() => {
    // Initialize auth
    const initAuth = async () => {
      try {
        const authServiceInstance = AuthService.getInstance();
        
        // Set up auth listener
        const unsubscribe = authServiceInstance.addListener((newAuthState: AuthState) => {
          setAuthState(newAuthState);
          
          // Load subscription when user is authenticated
          if (newAuthState.user && !newAuthState.loading) {
            loadSubscription(newAuthState.user.id);
          } else {
            setSubscriptionInfo(null);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsLoading(false);
      }
    };

    const loadSubscription = async (userId: string) => {
      try {
        // Check if user has a subscription, create trial if not
        let subInfo = await SubscriptionService.getSubscriptionInfo(userId);
        
        if (!subInfo) {
          await SubscriptionService.createTrialSubscription(userId);
          subInfo = await SubscriptionService.getSubscriptionInfo(userId);
        }
        
        setSubscriptionInfo(subInfo);
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const cleanup = initAuth();
    return () => {
      cleanup.then(unsubscribe => unsubscribe?.());
    };
  }, []);

  // Check for expired trials periodically
  useEffect(() => {
    if (!authState.user) return;

    const interval = setInterval(async () => {
      await SubscriptionService.checkAndExpireTrials();
      await refreshSubscription();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [authState.user]);

  const value: AppContextType = {
    authState,
    subscriptionInfo,
    isLoading,
    refreshSubscription
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
